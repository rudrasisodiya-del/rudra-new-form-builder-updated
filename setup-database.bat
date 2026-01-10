@echo off
echo ========================================
echo PabblyForm Database Setup Script
echo ========================================
echo.

echo Step 1: Checking PostgreSQL installation...
psql --version
if %errorlevel% neq 0 (
    echo ERROR: PostgreSQL is not installed or not in PATH
    echo Please install PostgreSQL first
    pause
    exit /b 1
)
echo PostgreSQL found!
echo.

echo Step 2: Creating database 'pabblyform'...
echo Please enter your PostgreSQL password when prompted
psql -U postgres -c "CREATE DATABASE pabblyform;" 2>nul
if %errorlevel% equ 0 (
    echo Database 'pabblyform' created successfully!
) else (
    echo Database might already exist or there was an error
    echo Continuing anyway...
)
echo.

echo Step 3: Running Prisma migrations...
cd server
call npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo Migration failed, trying db push instead...
    call npx prisma db push
)
echo.

echo Step 4: Generating Prisma client...
call npx prisma generate
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Your database is ready!
echo.
echo Next steps:
echo 1. Start backend: cd server ^&^& npm run dev
echo 2. Start frontend: npm run dev
echo 3. Visit: http://localhost:5173
echo.
pause
