@echo off
:: Check for Administrator privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [SUCCESS] Running with administrator privileges.
    echo.
    echo Opening Windows Firewall port 5000 for WeTalk Backend...
    netsh advfirewall firewall add rule name="WeTalk Backend 5000" dir=in action=allow protocol=TCP localport=5000
    echo.
    echo [DONE] Firewall rule added successfully!
    echo You can now close this window and restart your app.
) else (
    echo [ERROR] This script must be run as Administrator!
    echo.
    echo Please right-click this file (open-firewall.bat) and select "Run as administrator".
)
echo.
pause
