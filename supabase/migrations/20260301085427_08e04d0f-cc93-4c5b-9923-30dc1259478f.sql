
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS: only admins can read user_roles
CREATE POLICY "Admins can read user_roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed admin role for kiziria@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'kiziria@gmail.com'
ON CONFLICT DO NOTHING;

-- RPC: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- RPC: get all users for admin panel
CREATE OR REPLACE FUNCTION public.admin_get_users()
RETURNS TABLE(user_id uuid, username text, email text, balance numeric, vip_level int, commission_earned numeric, referral_code text, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN QUERY
    SELECT p.user_id, p.username, u.email, p.balance, p.vip_level, p.commission_earned, p.referral_code, p.created_at
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.user_id
    ORDER BY p.created_at DESC;
END;
$$;

-- RPC: get pending tiktok submissions
CREATE OR REPLACE FUNCTION public.admin_get_tiktok_submissions()
RETURNS TABLE(id uuid, user_id uuid, username text, video_url text, status text, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN QUERY
    SELECT ts.id, ts.user_id, p.username, ts.video_url, ts.status, ts.created_at
    FROM public.tiktok_submissions ts
    JOIN public.profiles p ON p.user_id = ts.user_id
    WHERE ts.status = 'pending'
    ORDER BY ts.created_at DESC;
END;
$$;

-- RPC: approve tiktok submission (+$100)
CREATE OR REPLACE FUNCTION public.admin_approve_tiktok(p_submission_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_uid uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  SELECT user_id INTO v_uid FROM tiktok_submissions WHERE id = p_submission_id AND status = 'pending';
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Submission not found or already processed'; END IF;
  UPDATE tiktok_submissions SET status = 'approved' WHERE id = p_submission_id;
  UPDATE profiles SET balance = balance + 100 WHERE user_id = v_uid;
END;
$$;

-- RPC: reject tiktok submission
CREATE OR REPLACE FUNCTION public.admin_reject_tiktok(p_submission_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  UPDATE tiktok_submissions SET status = 'rejected' WHERE id = p_submission_id AND status = 'pending';
END;
$$;

-- RPC: reset user balance
CREATE OR REPLACE FUNCTION public.admin_reset_balance(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  UPDATE profiles SET balance = 0, commission_earned = 0 WHERE user_id = p_user_id;
END;
$$;

-- RPC: add bonus to user
CREATE OR REPLACE FUNCTION public.admin_add_bonus(p_user_id uuid, p_amount numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  UPDATE profiles SET balance = balance + p_amount WHERE user_id = p_user_id;
END;
$$;

-- RPC: global stats
CREATE OR REPLACE FUNCTION public.admin_get_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_users int;
  v_total_earned numeric;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  SELECT count(*)::int, coalesce(sum(balance), 0) INTO v_total_users, v_total_earned FROM profiles;
  RETURN jsonb_build_object('total_users', v_total_users, 'total_earned', v_total_earned);
END;
$$;
