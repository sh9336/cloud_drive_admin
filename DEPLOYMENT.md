# Deployment Guide: Cloud Admin Dashboard

## Environment Variables Setup

### Local Development
```bash
# .env.local (DO NOT COMMIT - already in .gitignore)
NEXT_PUBLIC_APP_NAME=Admin Dashboard
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### Production (Vercel)

**IMPORTANT:** `NEXT_PUBLIC_*` variables are exposed to the frontend JavaScript bundle, so only put **non-sensitive** URLs here.

#### Step 1: Configure in Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) → Select your project
2. Click **Settings** → **Environment Variables**
3. Add the following variables:

| Key | Value | Scope |
|-----|-------|-------|
| `NEXT_PUBLIC_APP_NAME` | `Admin Dashboard` | Production, Preview, Development |
| `NEXT_PUBLIC_API_URL` | `https://cloud-drive-mw0s.onrender.com/api/v1` | Production, Preview |

#### Step 2: Different URLs per Environment (Optional)

If you want different backend URLs for different environments:

**For Production:**
- Key: `NEXT_PUBLIC_API_URL`
- Value: `https://api.production.com/api/v1`
- Scope: `Production`

**For Preview/Staging:**
- Key: `NEXT_PUBLIC_API_URL`
- Value: `https://api.staging.com/api/v1`
- Scope: `Preview`

#### Step 3: Redeploy

After setting environment variables, trigger a redeployment:
```bash
# Push a new commit
git add .
git commit -m "Deploy to production"
git push origin main
```

Or manually redeploy in Vercel dashboard:
- Click **Deployments** → Click the three dots on latest deployment → **Redeploy**

---

## Environment Variable Security

### ✅ Safe to Include in NEXT_PUBLIC_*
- API base URLs (https://api.example.com)
- App name/version
- Public feature flags
- Sentry DSN (if using)

### ❌ NEVER Include in NEXT_PUBLIC_*
- API keys
- Database credentials
- JWT secrets
- Private encryption keys
- Auth tokens
- Passwords

---

## Verification Checklist

- [ ] `.env.local` is in `.gitignore` → ✅ Verified
- [ ] `.env.example` exists as template → ✅ Created
- [ ] `NEXT_PUBLIC_API_URL` set in Vercel → ⏳ TODO
- [ ] Backend API URL is HTTPS → ✅ Using https://cloud-drive-mw0s.onrender.com
- [ ] CORS configured on backend → ⏳ Verify with team
- [ ] Project deployed successfully → ⏳ TODO

---

## Troubleshooting

### "Cannot reach backend API in production"
1. Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
2. Check the backend is running and accessible
3. Verify CORS headers allow your Vercel domain
4. Check browser console for the actual URL being used

### How to see what URL is being used
In browser DevTools Console:
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL)
```

---

## Local Development Setup

```bash
# 1. Copy the example file
cp .env.example .env.local

# 2. Edit .env.local with your local backend URL
# NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# 3. Run dev server
npm run dev

# 4. Access at http://localhost:3000
```

---

## Next Steps

1. ✅ Security review complete
2. ✅ Environment variables configured locally
3. ⏳ Push to GitHub
4. ⏳ Configure Vercel environment variables
5. ⏳ Deploy and test
