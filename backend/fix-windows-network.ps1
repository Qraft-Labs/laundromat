# Windows Network Fix for Google OAuth
# Run this script as Administrator to fix DNS/network issues

Write-Host "🔧 Windows Network Configuration Fix" -ForegroundColor Cyan
Write-Host "=" * 70

# 1. Flush DNS Cache
Write-Host "`n1️⃣ Flushing DNS Cache..." -ForegroundColor Yellow
try {
    ipconfig /flushdns | Out-Null
    Write-Host "   ✅ DNS Cache flushed successfully" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed to flush DNS cache" -ForegroundColor Red
}

# 2. Reset Winsock
Write-Host "`n2️⃣ Resetting Winsock..." -ForegroundColor Yellow
try {
    netsh winsock reset | Out-Null
    Write-Host "   ✅ Winsock reset successfully" -ForegroundColor Green
    Write-Host "   ⚠️  You may need to restart your computer" -ForegroundColor Yellow
} catch {
    Write-Host "   ❌ Failed to reset Winsock (may need admin rights)" -ForegroundColor Red
}

# 3. Reset TCP/IP
Write-Host "`n3️⃣ Resetting TCP/IP..." -ForegroundColor Yellow
try {
    netsh int ip reset | Out-Null
    Write-Host "   ✅ TCP/IP reset successfully" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed to reset TCP/IP (may need admin rights)" -ForegroundColor Red
}

# 4. Check DNS Servers
Write-Host "`n4️⃣ Checking DNS Servers..." -ForegroundColor Yellow
$adapters = Get-DnsClientServerAddress -AddressFamily IPv4 | Where-Object {$_.ServerAddresses.Count -gt 0}

foreach ($adapter in $adapters) {
    Write-Host "   Interface: $($adapter.InterfaceAlias)" -ForegroundColor White
    Write-Host "   DNS Servers: $($adapter.ServerAddresses -join ', ')" -ForegroundColor White
}

# 5. Set Google DNS (if needed)
Write-Host "`n5️⃣ Would you like to set Google DNS (8.8.8.8, 8.8.4.4)?" -ForegroundColor Yellow
$response = Read-Host "   Enter 'yes' to change DNS, or 'no' to skip"

if ($response -eq 'yes') {
    $interfaceName = Read-Host "   Enter interface name (from list above)"
    try {
        Set-DnsClientServerAddress -InterfaceAlias $interfaceName -ServerAddresses ("8.8.8.8","8.8.4.4")
        Write-Host "   ✅ DNS servers set to Google DNS" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Failed to set DNS servers" -ForegroundColor Red
    }
}

# 6. Test Google Connectivity
Write-Host "`n6️⃣ Testing Google Connectivity..." -ForegroundColor Yellow

# Test DNS resolution
Write-Host "   Testing DNS: www.googleapis.com" -ForegroundColor White
try {
    $result = Resolve-DnsName www.googleapis.com -ErrorAction Stop
    Write-Host "   ✅ DNS Resolution: $($result[0].IPAddress)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ DNS Resolution FAILED" -ForegroundColor Red
}

# Test HTTPS connection
Write-Host "   Testing HTTPS: https://www.googleapis.com" -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "https://www.googleapis.com" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ HTTPS Connection: Status $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ HTTPS Connection FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. Check Firewall
Write-Host "`n7️⃣ Checking Windows Firewall..." -ForegroundColor Yellow
$firewallProfiles = Get-NetFirewallProfile
foreach ($fwProfile in $firewallProfiles) {
    $status = if ($fwProfile.Enabled) { "🔒 ENABLED" } else { "🔓 DISABLED" }
    Write-Host "   $($fwPwProfile.Name): $status" -ForegroundColor White
}

# 8. Check Proxy Settings
Write-Host "`n8️⃣ Checking Proxy Settings..." -ForegroundColor Yellow
$proxy = Get-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings'
if ($proxy.ProxyEnable -eq 1) {
    Write-Host "   ⚠️  PROXY ENABLED: $($proxy.ProxyServer)" -ForegroundColor Yellow
    Write-Host "   This might interfere with Node.js connections!" -ForegroundColor Yellow
    
    $disableProxy = Read-Host "   Disable proxy? (yes/no)"
    if ($disableProxy -eq 'yes') {
        Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -Name ProxyEnable -Value 0
        Write-Host "   ✅ Proxy disabled" -ForegroundColor Green
    }
} else {
    Write-Host "   ✅ No proxy configured" -ForegroundColor Green
}

# 9. Summary
Write-Host "`n" + ("=" * 70)
Write-Host "🎯 Summary & Next Steps" -ForegroundColor Cyan
Write-Host "=" * 70

Write-Host "`n✅ Network fixes applied (if run as Administrator)"
Write-Host "⚠️  If you reset Winsock/TCP/IP, restart your computer"
Write-Host "🔄 After restart, try Google OAuth again"
Write-Host "`nTo test manually:"
Write-Host "   ping www.googleapis.com"
Write-Host "   nslookup www.googleapis.com"
Write-Host "   Test-NetConnection www.googleapis.com -Port 443"

Write-Host "`nPress Enter to close..."
Read-Host
