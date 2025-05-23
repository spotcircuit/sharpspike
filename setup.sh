#!/bin/bash
set -e

echo "=== Starting project setup ==="

# Install dependencies
echo "Installing project dependencies..."
npm ci || npm install

# Install ESLint packages if they're missing
if ! npm list eslint >/dev/null 2>&1; then
  echo "Installing ESLint packages..."
  npm install --save-dev eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react-hooks eslint-plugin-react-refresh
fi

# Set up Supabase functions
echo "Setting up Supabase functions..."
cd supabase/functions || exit 1

# Install any function-specific dependencies if needed
for dir in */; do
  if [ -f "${dir}package.json" ]; then
    echo "Installing dependencies for ${dir}..."
    (cd "$dir" && npm ci) || (cd "$dir" && npm install)
  fi
done

# Return to project root
cd ../../

# Run a lint check to verify setup
echo "Running lint check..."
npm run lint

echo "=== Setup complete! ==="
echo "You can now run 'npm test' to run tests"
echo "Or 'npm run dev' to start the development server"

