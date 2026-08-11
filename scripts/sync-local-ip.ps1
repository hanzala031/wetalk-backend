$ErrorActionPreference = "Stop"

function Get-PrimaryLanIp {
  # 1. Try UDP socket routing method (Zero-privilege, extremely fast, works even offline as long as router route exists)
  try {
    $udp = New-Object System.Net.Sockets.UdpClient
    $udp.Connect("8.8.8.8", 53)
    $ip = $udp.Client.LocalEndPoint.Address.IPAddressToString
    $udp.Close()
    if ($ip -and $ip -notlike '127.*' -and $ip -notlike '169.254.*') {
      return $ip
    }
  } catch {
    # Fallback to route/CIM methods
  }

  # 2. Try to find the IP of the interface with the active default gateway
  try {
    $defaultRoute = Get-NetRoute -DestinationPrefix '0.0.0.0/0' -ErrorAction SilentlyContinue |
      Sort-Object -Property RouteMetric |
      Select-Object -First 1

    if ($defaultRoute) {
      $ip = Get-NetIPAddress -InterfaceIndex $defaultRoute.InterfaceIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue |
        Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } |
        Select-Object -ExpandProperty IPAddress -First 1
      if ($ip) {
        return $ip
      }
    }
  } catch {
    # Fallback
  }

  # 3. Fallback to sorting candidates by metric
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
$lines = Set-EnvLine -Content $lines -Key "EXPO_PUBLIC_API_URL" -Value "http://${ip}:5000/api"

Set-Content -Path $envFile -Value $lines -Encoding UTF8
Write-Host "Updated .env with current network IP."
