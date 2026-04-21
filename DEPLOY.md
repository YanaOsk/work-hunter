# Deploy Work Hunter to the web

Goal: get a public URL like `work-hunter.vercel.app` that works on any device, including your phone for testing. Free. Auto-deploys on every push.

## What you need (all free, ~10 minutes total)
1. GitHub account — https://github.com/signup
2. Vercel account — https://vercel.com/signup (sign in with GitHub)

## Step 1 — Push to GitHub

Open a terminal in the project folder (`work-hunter`), then run:

```bash
git init
git add .
git commit -m "initial commit"
```

Now create a new empty repo on github.com (button "New repository"). Don't add a README or .gitignore — the project already has them. After creating, GitHub shows instructions. Run these (replace with YOUR repo URL):

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/work-hunter.git
git push -u origin main
```

You should see your files on github.com now.

## Step 2 — Deploy on Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository" and pick `work-hunter`
3. Vercel auto-detects it as a Next.js project. Leave the defaults.
4. Open **"Environment Variables"** and add:
   - `GROQ_API_KEY` = your Groq key (copy from your local `.env.local`)
   - `SERPER_API_KEY` = your Serper key (copy from your local `.env.local`)
5. Click **Deploy**. Takes about 60–90 seconds.

Vercel gives you a URL like `work-hunter-xxxx.vercel.app`. That's your live app. Open it on your phone — works everywhere.

## Step 3 — Future deploys

Every time you push to `main`, Vercel re-deploys automatically:

```bash
git add .
git commit -m "what I changed"
git push
```

Refresh your Vercel URL in 60 seconds — your changes are live.

## Optional — custom domain

In Vercel dashboard → Settings → Domains. Add a domain you own (or buy one for ~40 ₪/year on Name.com or similar). Vercel handles SSL automatically.

## Tips

- **If the deploy fails** because of env vars — go back to Vercel Settings → Environment Variables, verify the keys are saved for "Production" (not just Preview), then click "Redeploy".
- **To see logs** — Vercel dashboard → Deployments → click the deployment → "Logs". Useful if API calls fail in production.
- **Preview URLs** — every branch you push gets its own preview URL. Good for testing features without touching main.

## What's NOT deployed yet (needs your decisions later)

- **Google/Facebook login** — requires OAuth app setup + NextAuth configuration. Ask when ready.
- **Per-user database** — currently data is saved in browser localStorage. For cross-device sync and auth-gated summaries, we need a database (Supabase is easiest). Ask when ready.
- **Payments** — the pricing page is a demo. Real Stripe/PayPlus integration needed before charging anyone.

Ask me when you want to tackle any of these.
