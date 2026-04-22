@echo off
cd /d %~dp0
echo Starting server...
node index.js
echo Server exited with code %errorlevel%
pause