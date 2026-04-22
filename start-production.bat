@echo off
echo ============================================
echo     PRODUCTION SETUP - MONGODB ATLAS
echo ============================================
echo.
echo Setting up your e-commerce app for production...
echo.

REM Create production environment file
echo Creating production environment configuration...
copy ".env" ".env.production" >nul 2>&1

echo.
echo 🔧 PRODUCTION CONFIGURATION:
echo.
echo ✅ NODE_ENV=production
echo ✅ MongoDB Atlas connection configured
echo ✅ Demo mode disabled
echo.

echo.
echo 🚀 STARTING PRODUCTION SERVER...
echo.
echo Testing MongoDB Atlas connection first...
node test-mongo-atlas.js

if errorlevel 1 (
    echo.
    echo ❌ MongoDB Atlas connection failed!
    echo.
    echo 🔄 FALLING BACK TO DEMO MODE...
    echo.
    echo To fix Atlas connection:
    echo 1. Check your internet connection
    echo 2. Verify Atlas cluster is running
    echo 3. Allow all IPs (0.0.0.0/0) in Network Access
    echo 4. Verify database user credentials
    echo.
    echo For now, enabling demo mode...
    echo USE_DEMO_MODE=true>>.env
    echo.
    echo Starting server in demo mode...
) else (
    echo.
    echo ✅ MongoDB Atlas connected successfully!
    echo.
    echo 🚀 STARTING PRODUCTION SERVER...
)

echo.
echo Starting production server...
node index.js