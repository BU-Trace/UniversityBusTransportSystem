git-branch-report.sh

Usage
-----

From the repository root run:

```bash
bash ./scripts/git-branch-report.sh
```

What it does
------------
- Lists all local branches and remote branches
- Shows whether each local branch has an upstream (pushed)
- Shows, for remote branches, whether any local branch is tracking them
- Shows upstream name (for local branches)
- Shows total commits reachable from the branch
- Shows commits ahead/behind the upstream (for local branches)
- Shows last local commit date and last remote (upstream) commit date
- Shows number of unique files changed on the branch relative to the default branch (main/master)

Notes about the GitHub Action
----------------------------
- The included GitHub Action runs the script on the runner. The workflow now performs a full fetch of remote refs so remote branches are available to the script.
- If you want the Action to report remote branches from a forked repo, ensure the runner has permission to access the remote references (private remotes may require additional credentials).

Notes
-----
- "PUSHED" shows whether a branch has a configured upstream. It does not prove the exact push time.
- The script attempts to detect the default branch (prefers `main`, then `master`, then remote HEAD).
