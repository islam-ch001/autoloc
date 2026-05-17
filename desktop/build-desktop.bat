@echo off
echo ========================================
echo  AutoLoc Desktop - Build du .exe
echo ========================================
echo.

cd /d "%~dp0\.."
echo [1/4] Build du frontend (mode desktop, URL relative)...
call npm run build:desktop
if errorlevel 1 (echo Erreur build frontend & pause & exit /b 1)

cd /d "%~dp0"
echo.
echo [2/4] Copie du frontend vers desktop\frontend...
call node copy-frontend.js
if errorlevel 1 (echo Erreur copie & pause & exit /b 1)

echo.
echo [3/4] Installation des dependances Electron (peut prendre 2-3 min la premiere fois)...
call npm install
if errorlevel 1 (echo Erreur npm install & pause & exit /b 1)

echo.
echo [4/4] Packaging en .exe Windows...
call npx electron-builder --win --x64
if errorlevel 1 (echo Erreur electron-builder & pause & exit /b 1)

echo.
echo ========================================
echo  TERMINE !
echo  Installeur cree dans : desktop\dist-installer\
echo ========================================
pause
