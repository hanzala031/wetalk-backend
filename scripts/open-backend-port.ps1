$ruleName = "WeTalk Backend 5000"

$existingRule = netsh advfirewall firewall show rule name="$ruleName" 2>$null
if ($LASTEXITCODE -eq 0) {
  Write-Host "Firewall rule already exists: $ruleName"
  exit 0
}

Write-Host "Adding firewall rule for TCP port 5000..."
netsh advfirewall firewall add rule name="$ruleName" dir=in action=allow protocol=TCP localport=5000 | Out-Null

if ($LASTEXITCODE -eq 0) {
  Write-Host "Firewall rule added successfully."
} else {
  Write-Host "Could not add firewall rule automatically."
  Write-Host "Run PowerShell as Administrator and execute:"
  Write-Host 'netsh advfirewall firewall add rule name="WeTalk Backend 5000" dir=in action=allow protocol=TCP localport=5000'
  exit 1
}
