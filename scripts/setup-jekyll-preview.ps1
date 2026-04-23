$ErrorActionPreference = "Stop"

function Refresh-PathForCurrentSession {
    $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    $env:Path = "$machinePath;$userPath"
}

function Ensure-RubyInstallerFallback {
    param(
        [string]$InstallDir
    )

    if (Test-Path (Join-Path $InstallDir "bin\ruby.exe")) {
        return
    }

    Write-Host "Chocolatey Ruby install did not complete. Falling back to RubyInstaller..."

    $installerUrl = "https://github.com/oneclick/rubyinstaller2/releases/download/RubyInstaller-3.4.9-1/rubyinstaller-3.4.9-1-x64.exe"
    $installerPath = Join-Path $env:TEMP "rubyinstaller-3.4.9-1-x64.exe"

    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath

    if (Test-Path $InstallDir) {
        Write-Host "Ruby install directory already exists: $InstallDir"
    } else {
        New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    }

    $arguments = @(
        "/verysilent",
        "/currentuser",
        "/dir=$InstallDir",
        "/tasks=modpath,assocfiles"
    )

    Write-Host "Running RubyInstaller..."
    $process = Start-Process -FilePath $installerPath -ArgumentList $arguments -Wait -PassThru
    if ($process.ExitCode -ne 0) {
        throw "RubyInstaller exited with code $($process.ExitCode)."
    }
}

Write-Host "Checking for Ruby..."
$rubyExists = $null -ne (Get-Command ruby -ErrorAction SilentlyContinue)
$rubyInstallDir = Join-Path $env:LOCALAPPDATA "Programs\Ruby\Ruby349-x64"

if (-not $rubyExists) {
    Write-Host "Ruby not found. Installing Ruby via Chocolatey..."
    try {
        choco install ruby -y --no-progress
    } catch {
        Write-Host "Chocolatey install failed: $($_.Exception.Message)"
    }
}

Refresh-PathForCurrentSession

if ($null -eq (Get-Command ruby -ErrorAction SilentlyContinue)) {
    Ensure-RubyInstallerFallback -InstallDir $rubyInstallDir
    Refresh-PathForCurrentSession
    $rubyBin = Join-Path $rubyInstallDir "bin"
    if ((Test-Path $rubyBin) -and ($env:Path -notlike "*$rubyBin*")) {
        $env:Path = "$rubyBin;$env:Path"
    }
}

Write-Host "Refreshing PATH for current session..."

Write-Host "Installing Bundler and Jekyll..."
if ($null -eq (Get-Command gem -ErrorAction SilentlyContinue)) {
    throw "gem command is still unavailable after Ruby install. Open a new terminal and run this script again."
}

gem install bundler jekyll --no-document

Write-Host "Installing project gems from Gemfile..."
bundle install

Write-Host "Setup complete. Use 'Jekyll: Serve Local Site' task to start preview at http://127.0.0.1:4000"
