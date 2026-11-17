-- Restore RLS helper grant: without EXECUTE, share/expense selects fail with 42501.
grant execute on function private.can_read_shared_expense(uuid) to authenticated;
