Branch protection: Restrict merges to a single user
===============================================

Goal
----
Allow only a single GitHub user (you: `mdimamhosen`) to merge pull requests into a protected branch (for example, `main`). Other collaborators can open PRs and review, but only the selected user can perform the merge (because merging updates the protected branch and is treated as a push).

Prerequisites
-------------
- You must have admin access to the repository.
- If running the API commands: a GitHub token with `repo` or `repo:status` / `admin:repo_hook` scopes (a personal access token) or use an authenticated `gh` session.

Option A — Web UI (recommended)
--------------------------------
1. Open your repository on github.com.
2. Go to `Settings` → `Branches` → `Branch protection rules`.
3. Click `Add rule` (or edit the existing rule for `main`).
4. For "Branch name pattern", enter `main` (or the branch you want to protect).
5. Enable any rules you want (e.g., "Require pull request reviews before merging", required status checks, etc.).
6. Tick "Restrict who can push to matching branches".
7. In the dialog, add the single user `mdimamhosen` (or a team if you prefer) and remove all other users/teams.
8. Optionally enable "Include administrators" (recommended if you want the protection to apply to repository admins too).
9. Save the protection rule.

Result: Only the allowed user(s) can push to or merge into the protected branch.

Option B — GitHub API (curl)
-----------------------------
Use this if you want to automate the change. Export a token first (or set it in your environment):

```bash
export OWNER=mdimamhosen
export REPO=UBTS
export BRANCH=main
export GITHUB_TOKEN=ghp_xxx   # set this in your shell (do NOT commit tokens)
```

Then run:

```bash
curl -sS -X PUT \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$OWNER/$REPO/branches/$BRANCH/protection" \
  -d '{
    "required_status_checks": null,
    "enforce_admins": true,
    "required_pull_request_reviews": null,
    "restrictions": {
      "users": ["mdimamhosen"],
      "teams": []
    }
  }'
```

Notes:
- `enforce_admins: true` makes the rule apply to administrators too (admins will not be able to bypass it). If you prefer admins can bypass, set `enforce_admins` to `false`.
- You can replace `required_status_checks` or `required_pull_request_reviews` with a valid object if you want to require checks or reviews.

Option C — GitHub CLI (`gh`)
----------------------------
If you use `gh` and are authenticated (run `gh auth login`), you can run:

```bash
OWNER=mdimamhosen REPO=UBTS BRANCH=main

gh api --method PUT /repos/$OWNER/$REPO/branches/$BRANCH/protection \
  -f enforce_admins=true \
  -F restrictions='{"users":["mdimamhosen"],"teams":[]}'
```

(gh's form encoding is a little particular; if that fails use the curl approach above.)

Undo (allow others again)
-------------------------
- Via UI: Edit the protection rule and remove the push restriction or add more users/teams.
- API: Send the same PUT payload with a different `restrictions` array.

Security and best practices
---------------------------
- Do not paste personal access tokens into public places. Use GitHub Secrets or your local environment.
- Consider creating a team that contains the single releaser account; use a team name in restrictions instead of a raw user if you prefer team-based control.

If you want, I can:
- Run the API call from this environment if you provide a token (I will not store it). OR
- Prepare a PR that documents these steps in `docs/branch-protection.md` (already added). OR
- Add a GitHub Action that alerts the repo owner when a non-authorized user attempts a merge (less reliable than branch protection).
