$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Write-Host "Syncing current LAN IP..."
& "$root\scripts\sync-local-ip.ps1"

Write-Host "Opening Windows Firewall for backend port 5000..."
& "$root\scripts\open-backend-port.ps1"

Write-Host "Starting backend server..."
$backendJob = Start-Job -ScriptBlock {
  Set-Location $using:root
  Set-Location backend
  node server.js
}

Start-Sleep -Seconds 3

$healthOk = $false
for ($i = 0; $i -lt 10; $i++) {
  try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:5000/health" -UseBasicParsing -TimeoutSec 3
    if ($response.StatusCode -eq 200) {
      $healthOk = $true
      break
    }
  } catch {
    Start-Sleep -Seconds 1
  }
}

if (-not $healthOk) {
  Write-Host "Backend failed to start. Check backend/.env and MongoDB connection."
  Stop-Job $backendJob -ErrorAction SilentlyContinue
  Remove-Job $backendJob -ErrorAction SilentlyContinue
  exit 1
}

Write-Host "Backend is running on http://0.0.0.0:5000"
Write-Host "Starting Expo..."
Set-Location $root
npm start

Stop-Job $backendJob -ErrorAction SilentlyContinue
Remove-Job $backendJob -ErrorAction SilentlyContinue
