# Trackside Odds Pulse

## Project info

**URL**: https://lovable.dev/projects/a07bce7a-713d-446c-8c0f-8ea801d1fd15

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a07bce7a-713d-446c-8c0f-8ea801d1fd15) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase

## Code Quality

This project uses ESLint for code quality. To run the linter:

```sh
# Run ESLint to check for code issues
npm run lint

# Fix automatically fixable issues
npm run lint:fix
```

Please ensure all code passes linting before submitting pull requests.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a07bce7a-713d-446c-8c0f-8ea801d1fd15) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Setup

To set up the project for development:

```sh
# Run the setup script to install dependencies and configure the project
npm run setup
```

This will install all necessary dependencies, set up Supabase functions, and verify the linting configuration.

## How Codex runs this project

Codex executes `./setup.sh` during setup to install dependencies with `npm ci`.
After setup completes, Codex runs `npm test` which currently prints a message
because no automated tests are configured.

## Cross-Platform Development

This project uses a `.gitattributes` file to handle line ending differences between operating systems:

```
* text=auto
*.sh text eol=lf
*.ts text eol=lf
*.js text eol=lf
# ... other file types
```

This ensures that:
- Shell scripts (`.sh`) always use LF line endings, even on Windows
- Text files are normalized to the platform's native line endings on checkout
- Binary files are left untouched

If you encounter line ending issues (e.g., `$'\r': command not found` errors when running shell scripts), you may need to:

1. Ensure you have the `.gitattributes` file in your repository
2. Reset the file with line ending issues:
   ```sh
   git add --renormalize .
   ```
3. For existing files with incorrect line endings, you can use tools like `dos2unix` (Linux/Mac) or the following Git commands:
   ```sh
   # Configure Git (for Windows users)
   git config --global core.autocrlf true
   
   # For Linux/Mac users
   git config --global core.autocrlf input
   ```
