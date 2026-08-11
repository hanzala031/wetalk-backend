$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Write-Host "Syncing current LAN IP..."
& "$root\scripts\sync-local-ip.ps1"

Write-Host "Opening Windows Firewall for backend port 5000..."
try {
  & "$root\scripts\open-backend-port.ps1"
} catch {
  Write-Host "Firewall check completed."
}

# Free port 5000 if it is occupied
try {
  $port5000Process = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue
  if ($port5000Process) {
    Write-Host "Port 5000 is occupied by process ID $($port5000Process.OwningProcess). Terminating it..." -ForegroundColor Yellow
    Stop-Process -Id $port5000Process.OwningProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
  }
} catch {
  # Ignore
}

Write-Host "Starting backend server..."
$backendDir = Join-Path $root "backend"
$outLogFile = Join-Path $backendDir "server.log"
$errLogFile = Join-Path $backendDir "server-err.log"

if (Test-Path $outLogFile) {
  Remove-Item $outLogFile -Force -ErrorAction SilentlyContinue
}
if (Test-Path $errLogFile) {
  Remove-Item $errLogFile -Force -ErrorAction SilentlyContinue
}

$backendProcess = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $backendDir -RedirectStandardOutput $outLogFile -RedirectStandardError $errLogFile -PassThru -NoNewWindow

Start-Sleep -Seconds 2

# Retrieve LAN IP from .env to test as a health check candidate
$envFilePath = Join-Path $root ".env"
$lanIp = "127.0.0.1"
if (Test-Path $envFilePath) {
  $envContent = Get-Content $envFilePath
  foreach ($line in $envContent) {
    if ($line -match "^\s*EXPO_PUBLIC_API_HOST\s*=\s*(.+)") {
      $lanIp = $Matches[1].Trim()
      break
    }
  }
}

$healthOk = $false
$lastError = $null
$urls = @("http://127.0.0.1:5000/health", "http://localhost:5000/health", "http://$lanIp:5000/health")

for ($i = 0; $i -lt 15; $i++) {
  if ($backendProcess) {
    $backendProcess.Refresh()
    if ($backendProcess.HasExited) {
      Write-Host "Backend process exited prematurely with code $($backendProcess.ExitCode)" -ForegroundColor Red
      break
    }
  }

  # Try each URL candidate
  foreach ($url in $urls) {
    # 1. Try curl.exe first (native, fast, and bypasses Windows PowerShell .NET proxy/loopback quirks)
    try {
      $responseStr = & curl.exe --silent --max-time 2 $url 2>$null
      if ($responseStr -and $responseStr -match 'OK') {
        $healthOk = $true
        break
      }
    } catch {
      # Ignore curl error and proceed to Invoke-WebRequest
    }

    # 2. Try Invoke-WebRequest with Proxy bypass
    try {
      $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2 -Proxy $null
      if ($response.StatusCode -eq 200) {
        $healthOk = $true
        break
      }
    } catch {
      $lastError = $_.Exception.Message
    }
  }

  if ($healthOk) {
    break
  }

  Start-Sleep -Seconds 1
}

if (-not $healthOk) {
  Write-Host "Backend failed to start." -ForegroundColor Red
  if ($lastError) {
    Write-Host "Last health check error: $lastError" -ForegroundColor Yellow
  }

  # Stop process first so Windows flushes output buffers and unlocks files
  if ($backendProcess) {
    $backendProcess.Refresh()
    if (-not $backendProcess.HasExited) {
      Write-Host "Stopping backend process to flush logs..." -ForegroundColor Yellow
      Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
      Start-Sleep -Milliseconds 500
    }
  }

  if (Test-Path $outLogFile) {
    Write-Host "--- Backend server.log Output ---" -ForegroundColor Yellow
    Get-Content $outLogFile -Tail 30
    Write-Host "--------------------------------" -ForegroundColor Yellow
  }
  if (Test-Path $errLogFile) {
    Write-Host "--- Backend server-err.log Output ---" -ForegroundColor Red
    Get-Content $errLogFile -Tail 30
    Write-Host "------------------------------------" -ForegroundColor Red
  }
  exit 1
}

Write-Host "Backend is running on http://0.0.0.0:5000" -ForegroundColor Green
Write-Host "Starting Expo..." -ForegroundColor Cyan

try {
  Set-Location $root
  npm start
} finally {
  Write-Host "Stopping backend server..." -ForegroundColor Yellow
  if ($backendProcess -and -not $backendProcess.HasExited) {
    Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
  }
}

