#!/usr/bin/env bash
set -euo pipefail

# Auto-generate a commit message that timestamps the action.
timestamp=$(date -u '+%Y-%m-%d %H:%M:%S UTC')
message="Auto commit on ${timestamp}"

echo "Scanning for changes..."
if git status --porcelain | grep . >/dev/null; then
  git add -A
  echo "Creating commit with message: ${message}"
  git commit -m "${message}"
else
  echo "No changes detected; skipping commit."
  exit 0
fi

echo "Pushing to remote..."
git push
#!/bin/bash

# Add all changes
git add .

# Check if a commit message was provided as an argument
if [ -z "$1" ]; then
  # Use an automatic commit message
  msg="Auto-commit: $(date +'%Y-%m-%d %H:%M:%S')"
else
  # Use the provided argument as the commit message
  msg="$1"
fi

# Commit the changes
git commit -m "$msg"

# Push to the current branch
git push
