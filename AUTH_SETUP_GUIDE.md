# Authentication Setup Guide

## Google OAuth Configuration

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Add authorized redirect URIs:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   http://localhost:54321/auth/v1/callback (for local dev)
   ```
7. Copy **Client ID** and **Client Secret**

### 2. Configure in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and toggle it on
4. Paste your **Client ID** and **Client Secret**
5. Click **Save**

### 3. Environment Variables

Add to your `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Email/Password Authentication

Email/password authentication is enabled by default in Supabase. No additional configuration needed.

### Email Templates (Optional)

Customize email templates in Supabase Dashboard:
- **Authentication** → **Email Templates**
- Customize: Confirmation, Reset Password, Magic Link, etc.

## Testing Authentication

### Local Development

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/signup`

3. Test flows:
   - Email/password signup
   - Email/password login
   - Google OAuth login
   - Password reset

### Production

1. Update Google OAuth redirect URI with production URL
2. Deploy to Vercel
3. Test all authentication flows on production domain

## Security Checklist

- [x] RLS policies enabled on all tables
- [x] Profile auto-creation trigger configured
- [x] Session refresh in middleware
- [x] Route protection for authenticated pages
- [x] Redirect authenticated users away from auth pages
- [ ] Configure email rate limiting in Supabase
- [ ] Set up email provider (Resend/SendGrid) for production
- [ ] Enable CAPTCHA for signup (optional)

## Troubleshooting

### Google OAuth Not Working

- Verify redirect URIs match exactly (including protocol)
- Check Client ID and Secret are correct
- Ensure Google OAuth is enabled in Supabase Dashboard

### Session Not Persisting

- Check cookies are enabled in browser
- Verify middleware is running (check Network tab)
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

### Profile Not Created

- Check `001_init_profiles.sql` migration was applied
- Verify trigger `on_auth_user_created` exists in database
- Check Supabase logs for errors
