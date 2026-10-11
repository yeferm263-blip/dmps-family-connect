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

## Project rules
- Database schema lives in Lovable Cloud and changes only through migration files in drizzle/migrations; old Supabase migration history from the imported app was consolidated, so don't restore it.
- Admin access is granted by rows in public.user_roles (role helpers like is_admin()/can_manage_content()); never store roles elsewhere.
- Page-level visual assets are stored in the appearance_settings settings JSON so branding remains centrally managed without extra schema columns.
- Share article-length normalization and visible Markdown word counting between the AI creator and its endpoint to keep controls and generation consistent.
