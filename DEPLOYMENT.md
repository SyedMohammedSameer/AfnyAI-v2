# Deployment Guide for Sakura AI

This guide covers deploying Sakura AI to Netlify with secure API key handling.

## 🔐 Security

API keys are **never exposed** to the frontend. All Groq API calls are made through secure Netlify serverless functions.

## 📋 Prerequisites

1. A [Netlify](https://www.netlify.com/) account
2. A [Groq API key](https://console.groq.com/keys)
3. Node.js 18+ installed

## 🚀 Netlify Deployment

### Method 1: Deploy via Netlify UI (Recommended)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select your repository
   - Configure build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
     - **Functions directory**: `netlify/functions`

3. **Set Environment Variables**
   - In Netlify dashboard, go to: Site settings → Environment variables
   - Add the following variable:
     - **Key**: `GROQ_API_KEY`
     - **Value**: Your Groq API key from https://console.groq.com/keys
   - Click "Save"

4. **Deploy**
   - Click "Deploy site"
   - Wait for deployment to complete
   - Your site will be live at `https://<your-site-name>.netlify.app`

### Method 2: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Netlify site**
   ```bash
   netlify init
   ```
   - Choose "Create & configure a new site"
   - Select your team
   - Enter a site name (or leave blank for auto-generated)
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

4. **Set environment variables**
   ```bash
   netlify env:set GROQ_API_KEY "your_groq_api_key_here"
   ```

5. **Deploy**
   ```bash
   netlify deploy --prod
   ```

## 🧪 Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create `.env.local` file** (DO NOT commit this file!)
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

3. **Run development server with Netlify Functions**
   ```bash
   npm run dev
   ```

   This uses `netlify dev` which:
   - Runs Vite dev server
   - Runs Netlify Functions locally
   - Proxies function requests to `http://localhost:8888/.netlify/functions`

4. **Access the app**
   - Open http://localhost:8888 (NOT 5173)
   - Netlify Dev automatically proxies both the frontend and functions

## 🔧 Environment Variables

### Required for Netlify Functions

- `GROQ_API_KEY` - Your Groq API key (set in Netlify dashboard or via CLI)

### Not Required in Frontend

The frontend no longer needs any API keys! All sensitive operations happen in serverless functions.

## 📁 Project Structure

```
AfnyAI-v2/
├── netlify/
│   └── functions/          # Serverless functions
│       ├── chat.ts         # Chat completion endpoint
│       ├── translate.ts    # Translation endpoint
│       └── word-of-day.ts  # Word of the day endpoint
├── services/
│   ├── apiService.ts       # Frontend API client (calls Netlify functions)
│   └── speechService.ts    # Text-to-speech service
├── components/             # React components
├── netlify.toml           # Netlify configuration
├── .env.local.example     # Example environment file
└── package.json
```

## 🌐 API Endpoints

When deployed, your Netlify functions will be available at:

- `/.netlify/functions/chat` - Chat completions
- `/.netlify/functions/translate` - Text translation
- `/.netlify/functions/word-of-day` - Word of the day

## 🔍 Troubleshooting

### Functions not working locally

Make sure you're running `npm run dev` (which uses `netlify dev`), not `vite`.

### Environment variable not found

1. Check that `GROQ_API_KEY` is set in Netlify dashboard
2. After adding env vars, redeploy your site
3. For local dev, make sure `.env.local` exists with the key

### Build fails on Netlify

1. Check Node.js version in `netlify.toml` (should be 18+)
2. Verify all dependencies are in `package.json`
3. Check build logs for specific errors

### CORS errors

The Netlify functions automatically set CORS headers. If you still see CORS errors:
1. Clear browser cache
2. Make sure you're accessing the site via the Netlify URL, not `localhost:5173`

## 📝 Notes

- **Never commit `.env.local`** - it's in `.gitignore` for security
- API keys are stored securely in Netlify environment variables
- Functions are deployed automatically with each push to main branch
- Free Groq tier limits: Check https://console.groq.com/ for current limits

## 🆘 Support

For issues:
1. Check Netlify function logs in dashboard
2. Check browser console for errors
3. Verify Groq API key is valid and has quota remaining
