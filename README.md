
  # Digital showroom MVP

  This is a code bundle for Digital showroom MVP. The original project is available at https://www.figma.com/design/lcjnQICvC5bzHr9fPM6ZEk/Digital-showroom-MVP.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Deployment to Vercel

  This app is configured for deployment to Vercel. The app runs without authentication, making it perfect for public demos and sharing.

  ### Deploy via Vercel CLI

  1. Install Vercel CLI (if not already installed):
     ```bash
     npm i -g vercel
     ```

  2. Deploy:
     ```bash
     vercel
     ```

  3. Follow the prompts to link your project or create a new one.

  ### Deploy via Vercel Dashboard

  1. Go to [vercel.com](https://vercel.com) and sign in
  2. Click "Add New Project"
  3. Import your Git repository (GitHub, GitLab, or Bitbucket)
  4. Vercel will auto-detect the Vite framework
  5. The build settings are already configured in `vercel.json`:
     - Build Command: `npm run build`
     - Output Directory: `build`
     - Framework: Vite
  6. Click "Deploy"

  ### Configuration

  The `vercel.json` file is already configured with:
  - Correct build output directory (`build`)
  - SPA routing rewrites (all routes redirect to `index.html`)
  - Vite framework preset

  No additional configuration is needed. The app will be publicly accessible without login requirements.
  