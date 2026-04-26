# Deployment Checklist

## Pre-deploy
- [ ] All env vars in .env.local are working locally
- [ ] Pipeline runs successfully locally
- [ ] No TypeScript errors (run: npx tsc --noEmit)
- [ ] No console errors in browser
- [ ] Auth flow works end to end
- [ ] RevenueCat purchase flow tested
- [ ] Trial activates correctly
- [ ] Paywall appears after trial

## Vercel setup
- [ ] Push repo to GitHub
- [ ] Connect GitHub repo to Vercel at vercel.com/new
- [ ] Add all environment variables to Vercel dashboard:
      NEXT_PUBLIC_SUPABASE_URL
      NEXT_PUBLIC_SUPABASE_ANON_KEY
      SUPABASE_SERVICE_ROLE_KEY
      NEXT_PUBLIC_REVENUECAT_API_KEY
      REVENUECAT_WEBHOOK_SECRET
      ODDS_API_KEY
      PIPELINE_SECRET
      RESEND_API_KEY
      NEXT_PUBLIC_APP_URL (set to your domain)
- [ ] Deploy and confirm build succeeds
- [ ] Add custom domain in Vercel settings
- [ ] Update NEXT_PUBLIC_APP_URL to real domain

## Post-deploy
- [ ] Add GitHub Actions secrets:
      SUPABASE_URL
      SUPABASE_SERVICE_ROLE_KEY
      ODDS_API_KEY
- [ ] Trigger manual GitHub Actions run — confirm pipeline works
- [ ] Update RevenueCat webhook URL to production domain
- [ ] Submit domain to Google Search Console
- [ ] Test full user flow on production:
      Sign up → trial → paywall → purchase → cancel
- [ ] Confirm OG image loads at /api/og
- [ ] Confirm sitemap loads at /sitemap.xml

## Launch
- [ ] Post on Twitter
- [ ] Set up Discord server for Pro subscribers
- [ ] Monitor Supabase dashboard for first signups
