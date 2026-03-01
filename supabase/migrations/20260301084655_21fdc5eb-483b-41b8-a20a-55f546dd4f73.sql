
-- Table to track completed tasks per user
CREATE TABLE public.task_completions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  task_id text NOT NULL,
  reward numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, task_id)
);

ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own completions"
  ON public.task_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON public.task_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Table for TikTok submissions
CREATE TABLE public.tiktok_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  video_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tiktok_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own submissions"
  ON public.tiktok_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own submissions"
  ON public.tiktok_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add commission_earned column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS commission_earned numeric NOT NULL DEFAULT 0;

-- RPC to complete a task atomically: credit user, record completion, credit referrer commission
CREATE OR REPLACE FUNCTION public.complete_task(p_task_id text, p_reward numeric)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_already_done boolean;
  v_referrer_code text;
  v_referrer_vip int;
  v_commission_pct numeric;
  v_commission numeric;
  v_new_balance numeric;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if already completed
  SELECT EXISTS(SELECT 1 FROM task_completions WHERE user_id = v_user_id AND task_id = p_task_id)
    INTO v_already_done;
  IF v_already_done THEN
    RETURN jsonb_build_object('success', false, 'reason', 'already_completed');
  END IF;

  -- Insert completion
  INSERT INTO task_completions (user_id, task_id, reward) VALUES (v_user_id, p_task_id, p_reward);

  -- Credit user balance
  UPDATE profiles SET balance = balance + p_reward WHERE user_id = v_user_id
    RETURNING balance INTO v_new_balance;

  -- Referral commission: find who referred this user
  SELECT referred_by INTO v_referrer_code FROM profiles WHERE user_id = v_user_id;

  IF v_referrer_code IS NOT NULL AND v_referrer_code != '' THEN
    -- Get referrer's VIP level
    SELECT vip_level INTO v_referrer_vip FROM profiles WHERE referral_code = v_referrer_code;

    IF v_referrer_vip IS NOT NULL THEN
      v_commission_pct := CASE v_referrer_vip
        WHEN 1 THEN 0.08
        WHEN 2 THEN 0.15
        WHEN 3 THEN 0.20
        WHEN 4 THEN 0.25
        WHEN 5 THEN 0.35
        ELSE 0.08
      END;

      v_commission := p_reward * v_commission_pct;

      UPDATE profiles
        SET balance = balance + v_commission,
            commission_earned = commission_earned + v_commission
        WHERE referral_code = v_referrer_code;
    END IF;
  END IF;

  RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END;
$$;

-- RPC to submit tiktok link
CREATE OR REPLACE FUNCTION public.submit_tiktok(p_url text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_existing boolean;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT EXISTS(SELECT 1 FROM tiktok_submissions WHERE user_id = v_user_id AND status = 'pending')
    INTO v_existing;
  IF v_existing THEN
    RETURN jsonb_build_object('success', false, 'reason', 'already_pending');
  END IF;

  INSERT INTO tiktok_submissions (user_id, video_url) VALUES (v_user_id, p_url);
  RETURN jsonb_build_object('success', true);
END;
$$;
