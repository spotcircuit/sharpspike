#!/bin/bash

# Install dependencies
npm ci

# Set up Supabase functions
cd supabase/functions
echo "Setting up Supabase functions..."

# Install any function-specific dependencies if needed
# For example, if you have package.json files in your function directories:
# for dir in */; do
#   if [ -f "${dir}package.json" ]; then
#     (cd "$dir" && npm ci)
#   fi
# done

echo "Setup complete!"
