
CREATE OR REPLACE FUNCTION public.admin_get_users()
 RETURNS TABLE(user_id uuid, username text, email text, balance numeric, vip_level integer, commission_earned numeric, referral_code text, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN QUERY
    SELECT p.user_id, p.username, COALESCE(u.email, 'unknown') AS email, p.balance, p.vip_level, p.commission_earned, p.referral_code, p.created_at
    FROM public.profiles p
    LEFT JOIN auth.users u ON u.id = p.user_id
    ORDER BY p.created_at DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_update_user(p_user_id uuid, p_balance numeric, p_vip_level integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  UPDATE profiles SET balance = p_balance, vip_level = p_vip_level WHERE user_id = p_user_id;
END;
$function$;
