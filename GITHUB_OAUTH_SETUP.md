# GitHub OAuth App Configuration

## Current Configuration

**Client ID:** `Iv23liJmJlvyKXlErDk5`  
**Client Secret:** `c75f***` (in .env.local)
**App ID:** `2197713`

## Required Callback URLs

Your GitHub OAuth App needs to have these callback URLs registered:

### Primary URL (Windows via Port Forwarding)
```
http://localhost:3000/api/auth/github/callback
```

### Alternative URL (Direct WSL IP)
```
http://172.19.51.102:3000/api/auth/github/callback
```

## Setup Instructions

1. **Go to GitHub OAuth Apps Settings**
   - URL: https://github.com/settings/developers
   - Or: Settings → Developer settings → OAuth Apps

2. **Select Your Application**
   - Look for the app with Client ID: `Iv23liJmJlvyKXlErDk5`
   - Or App ID: `2197713`

3. **Update Callback URLs**
   - In the "Authorization callback URL" field, add:

     ```tsx
     http://localhost:3000/api/auth/github/callback
     ```

   - **Note:** GitHub OAuth Apps only support ONE callback URL
   - Choose the URL you'll use most often (localhost recommended)

4. **Save Changes**
   - Click "Update application"

5. **Test the Configuration**
   - Visit: http://localhost:3000
   - Try to authenticate with GitHub

## Troubleshooting

### Error: "redirect_uri is not associated with this application"
- **Cause:** The callback URL in your GitHub OAuth App doesn't match
- **Solution:** Make sure the callback URL is exactly:
  ```
  http://localhost:3000/api/auth/github/callback
  ```
  (No trailing slash, exact match)

### Using WSL IP Instead of localhost
If you prefer to use the WSL IP directly (172.19.51.102):
1. Update the callback URL in GitHub to:
   ```
   http://172.19.51.102:3000/api/auth/github/callback
   ```
2. Update `.env.local`:
   ```bash
   NEXTAUTH_URL="http://172.19.51.102:3000"
   ```
3. Restart the server:
   ```bash
   ./stop-server.sh && ./start-server.sh
   ```

### Port Forwarding Not Working
If localhost:3000 isn't accessible from Windows:
- Make sure you ran the PowerShell port forwarding commands as Admin
- Verify with: `netsh interface portproxy show all`
- The WSL IP may change after Windows reboot

## Current Server Status

- **Server PID:** Check with `cat /tmp/next-dev-server.pid`
- **Logs:** `tail -f /tmp/next-dev-server.log`
- **Stop:** `./stop-server.sh`
- **Start:** `./start-server.sh`

## Environment Variables

Your `.env.local` should have:

```env
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_GITHUB_CLIENT_ID=Iv23liJmJlvyKXlErDk5
GITHUB_CLIENT_SECRET=c75f3cdbd1059c86d15047154e7023dc93c7ea0f
NEXT_PUBLIC_AUTH_PROVIDERS="github"
```

## Quick Links

- GitHub OAuth Apps: https://github.com/settings/developers
- GitHub OAuth Documentation: https://docs.github.com/en/apps/oauth-apps
- NextAuth.js GitHub Provider: https://next-auth.js.org/providers/github
