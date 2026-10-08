REVOKE EXECUTE ON FUNCTION public.log_gold(text,text,uuid,numeric,numeric,text,uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.orders_gold_sync() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.casting_gold_sync() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_write(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.current_gold_balance() FROM anon;