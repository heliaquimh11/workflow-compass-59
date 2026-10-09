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

- Keep operational pages under the existing TanStack layout; login-free tests acquire an anonymous Cloud session, with RLS isolating test rows by owner and signed anonymous claim so real records remain protected.
- Store original photos in Cloud storage and all application records in PostgreSQL; never substitute local persistence.
- Fetch every page of records before Excel exports so reports do not inherit Data API row limits.
- Legacy workbook ingestion uses explicit column mapping and an atomic database RPC that enforces caller ownership, test isolation, and file-row deduplication; normal inserts cannot set the legacy photo exemption.
- Build workbook exports through the shared report mapper with an explicit field allowlist to keep attachment URLs out of every sheet.
