-- Fixes 2 security advisor warnings raised after 0001:
-- function_search_path_mutable, anon/authenticated_security_definer_function_executable

alter function public.handle_new_user() set search_path = public, pg_temp;

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;
