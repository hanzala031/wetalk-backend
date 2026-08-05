$ErrorActionPreference = "Stop"

function Get-PrimaryLanIp {
  $candidates = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object {
      $_.IPAddress -notlike '127.*' -and
      $_.IPAddress -notlike '169.254.*' -and
      $_.PrefixOrigin -ne 'WellKnown'
    } |
    Sort-Object -Property InterfaceMetric, SkipAsSource

  if ($candidates.Count -eq 0) {
    throw "No LAN IPv4 address found. Connect to Wi-Fi and try again."
  }

  $wifi = $candidates | Where-Object { $_.InterfaceAlias -match 'Wi-Fi|Wireless|WLAN' } | Select-Object -First 1
  if ($wifi) {
    return $wifi.IPAddress
  }

  return ($candidates | Select-Object -First 1).IPAddress
}

$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root ".env"
$ip = Get-PrimaryLanIp

Write-Host "Detected LAN IP: $ip"

$lines = if (Test-Path $envFile) {
  Get-Content $envFile
} else {
  @()
}

function Set-EnvLine {
  param(
    [string[]]$Content,
    [string]$Key,
    [string]$Value
  )

  $pattern = "^\s*$([regex]::Escape($Key))\s*="
  $updated = $false
  $result = @()

  foreach ($line in $Content) {
    if ($line -match $pattern) {
      $result += "$Key=$Value"
      $updated = $true
    } else {
      $result += $line
    }
  }

  if (-not $updated) {
    $result += "$Key=$Value"
  }

  return ,$result
}

$lines = Set-EnvLine -Content $lines -Key "REACT_NATIVE_PACKAGER_HOSTNAME" -Value $ip
$lines = Set-EnvLine -Content $lines -Key "EXPO_PUBLIC_API_HOST" -Value $ip

Set-Content -Path $envFile -Value $lines -Encoding UTF8
Write-Host "Updated .env with current network IP."
