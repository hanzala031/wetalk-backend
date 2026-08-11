$ruleBackend = "WeTalk Backend 5000"
$ruleMetro = "WeTalk Metro 8081"

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
  Write-Host "Requesting Administrator permission to open Windows Firewall ports..."
  try {
    Start-Process powershell -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Wait
    exit 0
  } catch {
    Write-Host "Could not escalate privileges. Please run PowerShell as Administrator and execute:"
    Write-Host 'netsh advfirewall firewall add rule name="WeTalk Backend 5000" dir=in action=allow protocol=TCP localport=5000'
    Write-Host 'netsh advfirewall firewall add rule name="WeTalk Metro 8081" dir=in action=allow protocol=TCP localport=8081'
    exit 0
  }
}

# Add Port 5000
$existingRule = netsh advfirewall firewall show rule name="$ruleBackend" 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Adding firewall rule for TCP port 5000..."
  netsh advfirewall firewall add rule name="$ruleBackend" dir=in action=allow protocol=TCP localport=5000 | Out-Null
} else {
  Write-Host "Firewall rule already exists: $ruleBackend"
}

# Add Port 8081
$existingRuleMetro = netsh advfirewall firewall show rule name="$ruleMetro" 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Adding firewall rule for TCP port 8081..."
  netsh advfirewall firewall add rule name="$ruleMetro" dir=in action=allow protocol=TCP localport=8081 | Out-Null
} else {
  Write-Host "Firewall rule already exists: $ruleMetro"
}

Write-Host "Firewall rules verification complete."

