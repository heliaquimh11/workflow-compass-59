<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep operational pages under the existing client-only authenticated TanStack layout; accounts require active database profiles and roles, and anonymous access stays disabled to protect real records.
- Store original photos in Cloud storage and all application records in PostgreSQL; never substitute local persistence.
- Fetch every page of records before Excel exports so reports do not inherit Data API row limits.
- Legacy workbook ingestion uses explicit column mapping and an atomic database RPC that enforces caller ownership, test isolation, and file-row deduplication; normal inserts cannot set the legacy photo exemption.
- Build workbook exports through the shared report mapper with an explicit field allowlist to keep attachment URLs out of every sheet.
- Store administrative audit entries in public.audit_logs with append-only database triggers; perform authorized bulk cleanup using one transaction for operational rows and its summary, and native Storage/Auth APIs for files and accounts because these services cannot share a database transaction.
- Manage users through authenticated server functions that verify active admin roles via the caller's RLS client before loading privileged Auth APIs; finalize profile/role/audit creation in one RPC and compensate failed provisioning, since Auth cannot share the database transaction.
- Apply class and activation changes through an advisory-locked authenticated database RPC with immutable audit entries and last-admin/self-role protections; recheck profile access in open sessions so deactivation also clears the visible shell.
- Keep login normalization and class-dependent password validation in the shared client-safe user policy module so creation and reset use the same rules.
