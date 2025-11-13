# ============================================================================
# WSL2 Development Environment - Complete Port Forwarding Setup
# Run this script in PowerShell as Administrator
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  WSL2 Development Environment - Port Forwarding Setup" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Get WSL IP Address
Write-Host "[1/5] Getting WSL IP Address..." -ForegroundColor Yellow
$wslIp = (wsl hostname -I).Trim().Split()[0]
Write-Host "      WSL IP: $wslIp" -ForegroundColor Green
Write-Host ""

# Common development ports
$ports = @(
    @{Port=3000; Name="Next.js / React"},
    @{Port=3001; Name="Vite / Alternative Dev Server"},
    @{Port=3002; Name="Ladle / Component Lab"},
    @{Port=3003; Name="Alternative Dev Server"},
    @{Port=5000; Name="Flask / Python"},
    @{Port=5173; Name="Vite (default)"},
    @{Port=5174; Name="Vite (alt)"},
    @{Port=8000; Name="Django / Python HTTP"},
    @{Port=8080; Name="Generic HTTP"},
    @{Port=8081; Name="Alternative HTTP"},
    @{Port=9000; Name="Generic"},
    @{Port=4200; Name="Angular"},
    @{Port=5432; Name="PostgreSQL"},
    @{Port=5433; Name="PostgreSQL (alt)"},
    @{Port=3306; Name="MySQL"},
    @{Port=6379; Name="Redis"},
    @{Port=27017; Name="MongoDB"}
)

# Remove all existing port forwarding rules
Write-Host "[2/5] Removing existing port forwarding rules..." -ForegroundColor Yellow
try {
    netsh interface portproxy reset | Out-Null
    Write-Host "      Existing rules cleared" -ForegroundColor Green
} catch {
    Write-Host "      No existing rules to clear" -ForegroundColor Gray
}
Write-Host ""

# Add port forwarding rules
Write-Host "[3/5] Adding port forwarding rules..." -ForegroundColor Yellow
$successCount = 0
foreach ($portInfo in $ports) {
    $port = $portInfo.Port
    $name = $portInfo.Name
    
    try {
        netsh interface portproxy add v4tov4 listenport=$port listenaddress=0.0.0.0 connectport=$port connectaddress=$wslIp | Out-Null
        Write-Host "      ✓ Port $port ($name)" -ForegroundColor Green
        $successCount++
    } catch {
        Write-Host "      ✗ Port $port ($name) - Failed" -ForegroundColor Red
    }
}
Write-Host "      Added $successCount port forwarding rules" -ForegroundColor Cyan
Write-Host ""

# Configure Windows Firewall
Write-Host "[4/5] Configuring Windows Firewall..." -ForegroundColor Yellow
$firewallRuleName = "WSL2 Development Ports"

# Remove existing firewall rule
try {
    Remove-NetFirewallRule -DisplayName $firewallRuleName -ErrorAction SilentlyContinue | Out-Null
} catch {}

# Create new firewall rule for all ports
$portList = ($ports | ForEach-Object { $_.Port }) -join ","
try {
    New-NetFirewallRule -DisplayName $firewallRuleName `
                        -Direction Inbound `
                        -LocalPort $portList `
                        -Protocol TCP `
                        -Action Allow `
                        -Profile Any `
                        -ErrorAction Stop | Out-Null
    Write-Host "      ✓ Firewall rule created" -ForegroundColor Green
} catch {
    Write-Host "      ✗ Firewall rule creation failed: $_" -ForegroundColor Red
}
Write-Host ""

# Display configuration
Write-Host "[5/5] Configuration Summary" -ForegroundColor Yellow
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
netsh interface portproxy show all
Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now access WSL services from Windows using:" -ForegroundColor White
Write-Host "  • http://localhost:3000 (Next.js/React)" -ForegroundColor Cyan
Write-Host "  • http://localhost:5173 (Vite)" -ForegroundColor Cyan
Write-Host "  • http://localhost:8000 (Django/Flask)" -ForegroundColor Cyan
Write-Host "  • localhost:5433 (PostgreSQL)" -ForegroundColor Cyan
Write-Host ""
Write-Host "WSL IP Address: $wslIp" -ForegroundColor Gray
Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  Useful Commands" -ForegroundColor Yellow
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "View all port forwarding rules:" -ForegroundColor White
Write-Host "  netsh interface portproxy show all" -ForegroundColor Gray
Write-Host ""
Write-Host "Remove all port forwarding rules:" -ForegroundColor White
Write-Host "  netsh interface portproxy reset" -ForegroundColor Gray
Write-Host ""
Write-Host "Remove specific port (e.g., 3000):" -ForegroundColor White
Write-Host "  netsh interface portproxy delete v4tov4 listenport=3000 listenaddress=0.0.0.0" -ForegroundColor Gray
Write-Host ""
Write-Host "View firewall rules:" -ForegroundColor White
Write-Host "  Get-NetFirewallRule -DisplayName 'WSL2*'" -ForegroundColor Gray
Write-Host ""
Write-Host "Remove firewall rule:" -ForegroundColor White
Write-Host "  Remove-NetFirewallRule -DisplayName 'WSL2 Development Ports'" -ForegroundColor Gray
Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: WSL IP changes after Windows reboot. Re-run this script after reboot." -ForegroundColor Yellow
Write-Host ""
