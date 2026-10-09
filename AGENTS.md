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

- Keep operational pages under the authenticated TanStack layout; database RLS remains the authoritative access boundary.
- Store original photos in Cloud storage and all application records in PostgreSQL; never substitute local persistence.
- Fetch every page of records before Excel exports so reports do not inherit Data API row limits.
