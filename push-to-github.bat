@echo off
title Push FinFlow to GitHub
echo ========================================================
echo    FinFlow - Pushing code to GitHub
echo    Repository: https://github.com/Dnyaneshwar2188/expencetracker.git
echo ========================================================
echo.

set "GIT=C:\Users\Dnyaneshwar\.gemini\antigravity-ide\scratch\mingit\cmd\git.exe"

cd /d "C:\Users\Dnyaneshwar\.gemini\antigravity-ide\scratch\finflow-expense-tracker"

"%GIT%" remote remove origin 2>nul
"%GIT%" remote add origin https://github.com/Dnyaneshwar2188/expencetracker.git
"%GIT%" branch -M main

echo Pushing to GitHub...
echo (If prompted, please enter your GitHub username and Personal Access Token or sign in)
echo.

"%GIT%" push -u origin main

echo.
echo ========================================================
echo Done! Press any key to exit.
echo ========================================================
pause
