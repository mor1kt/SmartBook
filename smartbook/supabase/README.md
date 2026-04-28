# Supabase (Multi-tenant isolation)

SmartBook is a **multi-tenant SaaS**: every business table must be scoped to a center via `center_id`.

## What’s included

- `schema.sql` contains the foundational tables for tenant isolation:
  - `centers`
  - `profiles` (optional, linked to `auth.users`)
  - `center_memberships` (maps users to centers)

## RLS guideline (required)

For every tenant-scoped table, enforce:

- `center_id` column is **NOT NULL**
- RLS policy checks user is a member of that same `center_id`

Example policy pattern (template):

```sql
alter table public.some_table enable row level security;

create policy "member can read"
on public.some_table
for select
using (
  exists (
    select 1
    from public.center_memberships m
    where m.center_id = some_table.center_id
      and m.user_id = auth.uid()
  )
);
```

Server-side operations can be performed with the **service role key** (bypasses RLS); never expose it to the frontend.

