#!/usr/bin/env bash
set -euo pipefail

# Git branch report script
# Outputs a table of local branches with info:
# - whether branch has an upstream (pushed)
# - upstream name
# - total commits (on branch)
# - commits ahead/behind upstream
# - last local commit date
# - last remote commit date (if upstream exists)
# - number of files changed vs default branch

repo_root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$repo_root"

# Determine default branch: prefer local main/master, then remote HEAD
default_branch=""
if git show-ref --verify --quiet refs/heads/main; then
  default_branch=main
elif git show-ref --verify --quiet refs/heads/master; then
  default_branch=master
else
  default_branch=$(git remote show origin 2>/dev/null | awk -F': ' '/HEAD branch/ {print $2}')
fi
default_branch=${default_branch:-main}

printf "Repository: %s\n" "$(basename "$repo_root")"
printf "Default branch: %s\n\n" "$default_branch"

printf "%-30s %-7s %-30s %-8s %-6s %-6s %-22s %-22s %s\n" \
  "BRANCH" "SCOPE" "PUSHED" "UPSTREAM" "COMMITS" "AHEAD" "BEHIND" "LAST_LOCAL" "LAST_REMOTE" "FILES_CHANGED"
printf '%s\n' "$(printf '%.0s-' {1..140})"


# Build mapping: upstream -> local branch(es)
declare -A upstream_to_local
while IFS= read -r lb; do
  [ -z "$lb" ] && continue
  if up=$(git rev-parse --abbrev-ref --symbolic-full-name "$lb@{u}" 2>/dev/null || true); then
    # support multiple locals tracking same upstream by appending
    if [ -n "${upstream_to_local[$up]:-}" ]; then
      upstream_to_local[$up]="${upstream_to_local[$up]},$lb"
    else
      upstream_to_local[$up]="$lb"
    fi
  fi
done < <(git for-each-ref --format='%(refname:short)' refs/heads)

# Iterate local branches first
locals_without_upstream=()
while IFS= read -r branch; do
  [ -z "$branch" ] && continue
  scope="local"

  # try to find upstream
  upstream=""
  if upstream=$(git rev-parse --abbrev-ref --symbolic-full-name "$branch@{u}" 2>/dev/null || true); then
    pushed="yes"
  else
    upstream="-"
    pushed="no"
  fi

  commits_count=$(git rev-list --count "$branch" 2>/dev/null || echo 0)

  ahead=0; behind=0
  if [ "$pushed" = "yes" ]; then
    ahead=$(git rev-list --count "$upstream..$branch" 2>/dev/null || echo 0)
    behind=$(git rev-list --count "$branch..$upstream" 2>/dev/null || echo 0)
  fi

  last_local=$(git log -1 --format='%ci' "$branch" 2>/dev/null || echo "-")
  if [ "$pushed" = "yes" ]; then
    last_remote=$(git log -1 --format='%ci' "$upstream" 2>/dev/null || echo "-")
  else
    last_remote="-"
    # collect locals that don't have upstreams for summary
    locals_without_upstream+=("$branch")
  fi

  files_changed=$(git diff --name-only "$default_branch...$branch" 2>/dev/null | sed '/^$/d' | sort -u | wc -l | tr -d ' ')

  printf "%-30s %-7s %-7s %-30s %-8s %-6s %-6s %-22s %-22s %s\n" \
    "$branch" "$scope" "$pushed" "$upstream" "$commits_count" "$ahead" "$behind" "$last_local" "$last_remote" "$files_changed"

done < <(git for-each-ref --format='%(refname:short)' refs/heads)

# Now iterate remote branches and show whether they have a local tracking branch
remote_only_branches=()
while IFS= read -r rbranch; do
  [ -z "$rbranch" ] && continue
  # skip remote HEAD refs like origin/HEAD
  if [[ "$rbranch" == */HEAD ]]; then
    continue
  fi
  scope="remote"

  # find if any local tracks this upstream
  tracked_local="-"
  if [ -n "${upstream_to_local[$rbranch]:-}" ]; then
    tracked_local="${upstream_to_local[$rbranch]}"
  fi

  # commits count reachable at remote ref
  commits_count=$(git rev-list --count "$rbranch" 2>/dev/null || echo 0)

  # last commit dates
  last_remote=$(git log -1 --format='%ci' "$rbranch" 2>/dev/null || echo "-")
  last_local="-"

  # files changed vs default branch (unique file count)
  files_changed=$(git diff --name-only "$default_branch...$rbranch" 2>/dev/null | sed '/^$/d' | sort -u | wc -l | tr -d ' ')

  printf "%-30s %-7s %-7s %-30s %-8s %-6s %-6s %-22s %-22s %s\n" \
    "$rbranch" "$scope" "$tracked_local" "-" "$commits_count" "-" "-" "$last_local" "$last_remote" "$files_changed"

  # collect remote-only branches (no local tracking)
  if [ "$tracked_local" = "-" ]; then
    remote_only_branches+=("$rbranch")
  fi

done < <(git for-each-ref --format='%(refname:short)' refs/remotes)

# Summary totals
total_branches=$(git for-each-ref --count=0 --format='%(refname:short)' refs/heads | wc -l | tr -d ' ')
printf "\nTotal local branches: %s\n" "$total_branches"

# Summary lists
echo
echo "Summary:"
echo "--------"

if [ ${#locals_without_upstream[@]} -eq 0 ]; then
  echo "Local branches without upstreams: -"
else
  echo "Local branches without upstreams:"
  for b in "${locals_without_upstream[@]}"; do
    echo "  - $b"
  done
fi

echo
if [ ${#remote_only_branches[@]} -eq 0 ]; then
  echo "Remote branches with no local tracking branches: -"
else
  echo "Remote branches with no local tracking branches:"
  for b in "${remote_only_branches[@]}"; do
    echo "  - $b"
  done
fi

# Note about push detection
cat <<'NOTE'

Notes:
- "PUSHED" shows "yes" when a local branch has an upstream (tracking) branch; it does not prove the last commit was pushed at a specific time.
- "LAST_REMOTE" shows the last commit date of the upstream ref (if any) and approximates the last push time for that branch.
- "FILES_CHANGED" counts unique files changed on the branch relative to the default branch (three-dot range).

NOTE
