#!/bin/bash

# Add all changes
git add .

# Check if a commit message was provided as an argument
if [ -z "$1" ]; then
  # If not, prompt the user for a commit message
  read -p "Enter commit message: " msg
else
  # Use the provided argument as the commit message
  msg="$1"
fi

# Commit the changes
git commit -m "$msg"

# Push to the current branch
git push
