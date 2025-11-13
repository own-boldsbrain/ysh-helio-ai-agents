# WSL2 Port Forwarding Setup for Development

## Problem
When running the development server in WSL2, Windows cannot access `http://localhost:3000` because WSL2 uses a virtual network adapter with its own IP address.

## Solution Options

### Option 1: PowerShell Script (Easiest)

1. Open **PowerShell as Administrator** (Right-click → Run as Administrator)

2. Navigate to the project directory:

   ```powershell
   cd \\wsl.localhost\Ubuntu\home\rookie\projects\coding-agent-template
   ```

3. Run the setup script:
   ```powershell
   .\setup-wsl-port-forward.ps1
   ```

4. Access the app at `http://localhost:3000`

### Option 2: Manual PowerShell Commands

Run these commands in **PowerShell as Administrator**:

```powershell
# Get WSL IP
$wslIp = (wsl hostname -I).Trim()

# Remove existing forwarding
netsh interface portproxy delete v4tov4 listenport=3000 listenaddress=0.0.0.0

# Add port forwarding
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=$wslIp

# Add firewall rule
New-NetFirewallRule -DisplayName "WSL Port 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### Option 3: Direct WSL IP Access

Access the server directly using WSL's IP address:

**Current WSL IP:** `http://172.19.51.102:3000`

> **Note:** WSL IP changes after Windows reboot, so you'll need to get the new IP each time.

To get current WSL IP, run in WSL terminal:
```bash
hostname -I | awk '{print $1}'
```

## Verification

Check port forwarding is active (PowerShell):
```powershell
netsh interface portproxy show all
```

You should see:
```
Listen on ipv4:             Connect to ipv4:
Address         Port        Address         Port
--------------- ----------  --------------- ----------
0.0.0.0         3000        172.19.51.102   3000
```

## Cleanup

To remove port forwarding when done (PowerShell as Administrator):
```powershell
netsh interface portproxy delete v4tov4 listenport=3000 listenaddress=0.0.0.0
Remove-NetFirewallRule -DisplayName "WSL Port 3000"
```

## Troubleshooting

### Still can't connect?

1. **Check if server is running in WSL:**
   ```bash
   curl http://localhost:3000
   ```
   Should return HTTP 200

2. **Check if port is listening:**
   ```bash
   ss -tlnp | grep 3000
   ```

3. **Restart WSL networking:**
   - In PowerShell (Administrator):
     ```powershell
     wsl --shutdown
     ```
   - Wait 10 seconds
   - Restart WSL terminal
   - Restart dev server

4. **Windows Firewall:**
   - Make sure Windows Firewall allows port 3000
   - The PowerShell script should create the rule automatically

5. **Antivirus/Security Software:**
   - Some antivirus software blocks WSL networking
   - Temporarily disable to test

## Why This Happens

WSL2 uses Hyper-V virtualization, which creates a separate network adapter. Unlike WSL1, WSL2 does not directly share the Windows network stack, requiring port forwarding for Windows to access WSL services.

## Alternative: Use WSL1

If you have persistent issues with WSL2 networking:

```powershell
wsl --set-version Ubuntu 1
```

WSL1 directly uses Windows networking, so `localhost` works immediately. However, WSL1 has worse I/O performance than WSL2.
