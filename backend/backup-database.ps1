# ═══════════════════════════════════════════════════════════════════════════
# LUSH LAUNDRY DATABASE BACKUP SCRIPT
# ═══════════════════════════════════════════════════════════════════════════
# 
# This PowerShell script creates automated backups of the PostgreSQL database
# with retention policies:
#   - Daily backups: Keep for 7 days
#   - Weekly backups: Keep for 4 weeks
#   - Monthly backups: Keep for 12 months
#
# Usage:
#   - Manual run: .\backup-database.ps1
#   - Automated run: Set up Windows Task Scheduler
#
# Setup Task Scheduler:
#   1. Open Task Scheduler
#   2. Create Task -> General tab:
#      - Name: "Lush Laundry DB Backup"
#      - Run whether user is logged on or not: checked
#      - Run with highest privileges: checked
#   3. Triggers tab:
#      - New -> Daily at 2:00 AM
#   4. Actions tab:
#      - New -> Start a program
#      - Program: powershell.exe
#      - Arguments: -ExecutionPolicy Bypass -File "D:\work_2026\lush_laundry\backend\backup-database.ps1"
#   5. Conditions tab:
#      - Start only if computer is on AC power: unchecked
#      - Wake computer to run: checked
#
# ═══════════════════════════════════════════════════════════════════════════

# Configuration
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_USER = "postgres"
$DB_NAME = "lush_laundry"
$DB_PASSWORD = $null  # Will be read from .env or prompted
$BACKUP_DIR = "D:\work_2026\lush_laundry\backend\backups"
$LOG_FILE = "$BACKUP_DIR\backup.log"

# Retention periods (in days)
$DAILY_RETENTION = 7
$WEEKLY_RETENTION = 28
$MONTHLY_RETENTION = 365

# ═══════════════════════════════════════════════════════════════════════════
# FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage
    Add-Content -Path $LOG_FILE -Value $logMessage
}

function Get-BackupType {
    $dayOfWeek = (Get-Date).DayOfWeek
    $dayOfMonth = (Get-Date).Day
    
    # Monthly backup on 1st of month
    if ($dayOfMonth -eq 1) {
        return "monthly"
    }
    # Weekly backup on Sunday
    elseif ($dayOfWeek -eq "Sunday") {
        return "weekly"
    }
    # Daily backup
    else {
        return "daily"
    }
}

function New-BackupDirectories {
    @("$BACKUP_DIR\daily", "$BACKUP_DIR\weekly", "$BACKUP_DIR\monthly") | ForEach-Object {
        if (-not (Test-Path $_)) {
            New-Item -ItemType Directory -Path $_ -Force | Out-Null
            Write-Log "Created backup directory: $_"
        }
    }
}

function Backup-Database {
    param([string]$BackupType)
    
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $backupPath = "$BACKUP_DIR\$BackupType"
    $backupFile = "$backupPath\lush_laundry_$BackupType`_$timestamp.sql"
    
    Write-Log "════════════════════════════════════════════════════════"
    Write-Log "Starting $BackupType backup: $DB_NAME"
    Write-Log "════════════════════════════════════════════════════════"
    
    # Set PostgreSQL password environment variable
    $env:PGPASSWORD = $Script:DB_PASSWORD
    
    try {
        # Execute pg_dump
        $pgDumpPath = "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe"
        
        if (-not (Test-Path $pgDumpPath)) {
            # Try to find pg_dump in PATH
            $pgDumpPath = (Get-Command pg_dump -ErrorAction SilentlyContinue).Source
            
            if (-not $pgDumpPath) {
                throw "pg_dump not found. Please install PostgreSQL or add it to PATH."
            }
        }
        
        Write-Log "Using pg_dump: $pgDumpPath"
        Write-Log "Output file: $backupFile"
        
        & $pgDumpPath `
            --host=$DB_HOST `
            --port=$DB_PORT `
            --username=$DB_USER `
            --format=plain `
            --no-owner `
            --no-acl `
            --encoding=UTF8 `
            --file=$backupFile `
            $DB_NAME
        
        if ($LASTEXITCODE -eq 0) {
            $fileSize = (Get-Item $backupFile).Length / 1KB
            Write-Log "✅ Backup successful! Size: $([math]::Round($fileSize, 2)) KB"
            
            # Compress backup
            Compress-Archive -Path $backupFile -DestinationPath "$backupFile.zip" -Force
            Remove-Item $backupFile
            Write-Log "✅ Backup compressed: $backupFile.zip"
            
            return $true
        }
        else {
            Write-Log "❌ Backup failed with exit code: $LASTEXITCODE"
            return $false
        }
    }
    catch {
        Write-Log "❌ Backup error: $($_.Exception.Message)"
        return $false
    }
    finally {
        # Clear password from environment
        Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    }
}

function Remove-OldBackups {
    param(
        [string]$BackupType,
        [int]$RetentionDays
    )
    
    $backupPath = "$BACKUP_DIR\$BackupType"
    $cutoffDate = (Get-Date).AddDays(-$RetentionDays)
    
    Write-Log "🗑️  Cleaning up $BackupType backups older than $RetentionDays days..."
    
    Get-ChildItem -Path $backupPath -Filter "*.zip" | Where-Object {
        $_.LastWriteTime -lt $cutoffDate
    } | ForEach-Object {
        Write-Log "   Deleting old backup: $($_.Name)"
        Remove-Item $_.FullName -Force
    }
}

function Send-BackupNotification {
    param(
        [bool]$Success,
        [string]$BackupType
    )
    
    # TODO: Implement email/SMS notification
    # For now, just log the status
    
    if ($Success) {
        Write-Log "📧 Notification: $BackupType backup completed successfully"
    }
    else {
        Write-Log "🚨 ALERT: $BackupType backup FAILED! Manual intervention required."
    }
}

# ═══════════════════════════════════════════════════════════════════════════
# MAIN EXECUTION
# ═══════════════════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════"
Write-Host "          LUSH LAUNDRY DATABASE BACKUP UTILITY"
Write-Host "═══════════════════════════════════════════════════════════════════════════"
Write-Host ""

# Create backup directories
New-BackupDirectories

# Determine backup type
$backupType = Get-BackupType
Write-Log "Backup type: $backupType"

# Read database password from .env or prompt
$envFile = "D:\work_2026\lush_laundry\backend\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^DB_PASSWORD=(.*)$') {
            $Script:DB_PASSWORD = $matches[1].Trim('"').Trim("'")
        }
    }
}

if (-not $Script:DB_PASSWORD) {
    Write-Host "Database password not found in .env file"
    $securePassword = Read-Host "Enter PostgreSQL password for user '$DB_USER'" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $Script:DB_PASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

# Perform backup
$success = Backup-Database -BackupType $backupType

# Clean up old backups
if ($success) {
    Remove-OldBackups -BackupType "daily" -RetentionDays $DAILY_RETENTION
    Remove-OldBackups -BackupType "weekly" -RetentionDays $WEEKLY_RETENTION
    Remove-OldBackups -BackupType "monthly" -RetentionDays $MONTHLY_RETENTION
}

# Send notification
Send-BackupNotification -Success $success -BackupType $backupType

Write-Log "════════════════════════════════════════════════════════"
Write-Log "Backup script completed"
Write-Log "════════════════════════════════════════════════════════"
Write-Host ""

# Exit with appropriate code
if ($success) {
    exit 0
}
else {
    exit 1
}
