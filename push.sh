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
