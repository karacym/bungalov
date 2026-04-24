#Requires -RunAsAdministrator
param(
  [Parameter(Mandatory = $true)]
  [string]$BackupPath
)
$PgHba = 'C:\Program Files\PostgreSQL\18\data\pg_hba.conf'
$Service = 'postgresql-x64-18'
if (-not (Test-Path $BackupPath)) { Write-Error "Yedek yok: $BackupPath" }
Start-Process -FilePath 'net.exe' -ArgumentList @('stop', $Service) -Wait -NoNewWindow
Start-Sleep -Seconds 2
Copy-Item -LiteralPath $BackupPath -Destination $PgHba -Force
$p = Start-Process -FilePath 'net.exe' -ArgumentList @('start', $Service) -Wait -PassThru -NoNewWindow
if ($p.ExitCode -ne 0) { Write-Error "Servis baslamadi. Log: C:\Program Files\PostgreSQL\18\data\log\" }
Write-Host "Tamam: pg_hba geri yuklendi ve servis baslatildi."
