#!/usr/bin/env bash

set -e

cd "$(dirname "$0")"

BRANCH="$(git branch --show-current)"

if [ -z "$BRANCH" ]; then
    echo "Error: could not determine current Git branch."
    exit 1
fi

# Use supplied commit message, or generate one automatically.
if [ -n "$1" ]; then
    MESSAGE="$*"
else
    MESSAGE="Update Gamatria $(date '+%Y-%m-%d %H:%M')"
fi

echo
echo "=== Gamatria Git Refresh ==="
echo "Branch: $BRANCH"
echo

echo "1. Staging changes..."
git add -A

if git diff --cached --quiet; then
    echo "   No local changes to commit."
else
    echo "2. Committing..."
    git commit -m "$MESSAGE"
fi

echo "3. Refreshing from GitHub..."
git pull --rebase origin "$BRANCH"

echo "4. Pushing to GitHub..."
git push origin "$BRANCH"

echo
echo "Done."
git status --short --branch
