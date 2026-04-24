#Requires -RunAsAdministrator
<#
  PostgreSQL 18: postgres sifresi 'postgres', bungalov DB.
  - pg_hba BOM yok
  - scram->trust satir satir (regex satir sonu uyumsuzluguna dayanmaz)
  - Tum psql: PGPASSWORD=postgres (trust/scram karisimi guvenli)
  - net start cikis 2 = zaten calisiyor -> basari
#>

$ErrorActionPreference = 'Stop'
$PgHba = 'C:\Program Files\PostgreSQL\18\data\pg_hba.conf'
$Psql = 'C:\Program Files\PostgreSQL\18\bin\psql.exe'
$Service = 'postgresql-x64-18'
$Backup = "$PgHba.bungalov-backup-$(Get-Date -Format 'yyyyMMddHHmmss')"
$Utf8NoBom = New-Object System.Text.UTF8Encoding $false

function Write-PgHbaLines([string[]]$Lines) {
  $text = ($Lines -join "`n") + "`n"
  [System.IO.File]::WriteAllText($PgHba, $text, $Utf8NoBom)
}

function Set-PgHbaTrust {
  $lines = [System.IO.File]::ReadAllLines($PgHba)
  $out = foreach ($line in $lines) {
    $t = $line.TrimStart()
    if ($t.StartsWith('#') -or [string]::IsNullOrWhiteSpace($line)) {
      $line
      continue
    }
    if ($line -match 'scram-sha-256\s*$') {
      if ($line -match '^(local|host)\s+all\s+all\s+' -or $line -match 'replication') {
        $line -replace 'scram-sha-256\s*$', 'trust'
      } else {
        $line
      }
    } else {
      $line
    }
  }
  Write-PgHbaLines @($out)
}

function Start-PostgresService {
  $p = Start-Process -FilePath 'net.exe' -ArgumentList @('start', $Service) -Wait -PassThru -NoNewWindow
  if ($p.ExitCode -notin @(0, 2)) {
    throw "Servis baslatilamadi (cikis: $($p.ExitCode)). Log: C:\Program Files\PostgreSQL\18\data\log\"
  }
  Start-Sleep -Seconds 4
}

function Stop-PostgresService {
  Start-Process -FilePath 'net.exe' -ArgumentList @('stop', $Service) -Wait -NoNewWindow | Out-Null
  Start-Sleep -Seconds 3
}

function Invoke-Psql([string]$Sql) {
  $env:PGPASSWORD = 'postgres'
  & $Psql -U postgres -h 127.0.0.1 -d postgres -v ON_ERROR_STOP=1 -c $Sql
  if ($LASTEXITCODE -ne 0) { throw "psql hata kodu: $LASTEXITCODE" }
}

function Invoke-PsqlScalar([string]$Sql) {
  $env:PGPASSWORD = 'postgres'
  $raw = & $Psql -U postgres -h 127.0.0.1 -d postgres -tAc $Sql 2>&1
  if ($LASTEXITCODE -ne 0) { throw "psql (scalar) hata: $raw" }
  return ($raw | Out-String).Trim()
}

if (-not (Test-Path $PgHba)) { Write-Error "pg_hba.conf bulunamadi: $PgHba" }
if (-not (Test-Path $Psql)) { Write-Error "psql bulunamadi: $Psql" }

Stop-PostgresService

Write-Host "Yedek: $Backup"
Copy-Item -LiteralPath $PgHba -Destination $Backup -Force

try {
  Write-Host "pg_hba.conf -> trust (localhost satirlari), BOM yok"
  Set-PgHbaTrust

  Write-Host "pg_hba (onizleme son 15 satir):"
  Get-Content -LiteralPath $PgHba -Tail 15 | ForEach-Object { Write-Host "  $_" }

  Write-Host "Servis baslatiliyor..."
  Start-PostgresService

  Write-Host "ALTER USER postgres PASSWORD 'postgres'"
  Invoke-Psql "ALTER USER postgres WITH PASSWORD 'postgres';"

  $hasDb = Invoke-PsqlScalar "SELECT 1 FROM pg_database WHERE datname='bungalov'"
  if ($hasDb -eq '1') {
    Write-Host "Veritabani 'bungalov' zaten var."
  } else {
    Write-Host "CREATE DATABASE bungalov"
    Invoke-Psql "CREATE DATABASE bungalov;"
  }

  Write-Host "pg_hba.conf geri yukleniyor (yedek = scram-sha-256)..."
  Stop-PostgresService
  Copy-Item -LiteralPath $Backup -Destination $PgHba -Force
  Start-PostgresService

  Write-Host ""
  Write-Host "Tamam. Simdi: npm run db:setup"
  Write-Host "Yedek: $Backup"
}
catch {
  Write-Host "HATA: $_" -ForegroundColor Red
  Write-Host "Kurtarma: yedek geri, servis baslat..."
  try {
    if (Test-Path $Backup) { Copy-Item -LiteralPath $Backup -Destination $PgHba -Force }
    Start-PostgresService
  } catch {
    Write-Host "Kurtarma basarisiz: $_" -ForegroundColor Red
  }
  exit 1
}
