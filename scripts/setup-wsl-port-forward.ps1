# PowerShell script to setup port forwarding from Windows to WSL2
# Run this in PowerShell as Administrator

$wslIp = (wsl hostname -I).Trim()
$port = 3000

Write-Host "WSL IP Address: $wslIp" -ForegroundColor Green
Write-Host "Setting up port forwarding for port $port..." -ForegroundColor Yellow

# Remove existing port forwarding if exists
netsh interface portproxy delete v4tov4 listenport=$port listenaddress=0.0.0.0 2>$null

# Add new port forwarding
netsh interface portproxy add v4tov4 listenport=$port listenaddress=0.0.0.0 connectport=$port connectaddress=$wslIp

# Add firewall rule
New-NetFirewallRule -DisplayName "WSL Port $port" -Direction Inbound -LocalPort $port -Protocol TCP -Action Allow -ErrorAction SilentlyContinue

Write-Host "`nPort forwarding configured!" -ForegroundColor Green
Write-Host "Windows localhost:$port -> WSL $wslIp`:$port" -ForegroundColor Cyan
Write-Host "`nYou can now access http://localhost:$port from Windows" -ForegroundColor Green
Write-Host "`nTo remove port forwarding later, run:" -ForegroundColor Yellow
Write-Host "netsh interface portproxy delete v4tov4 listenport=$port listenaddress=0.0.0.0" -ForegroundColor Gray
