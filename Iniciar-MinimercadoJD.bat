@echo off
title Lanzador Minimercado JD - POS
color 0A
echo ===================================================
echo   Iniciando Sistema Punto de Venta Minimercado JD
echo ===================================================
echo.

:: 1. Iniciar Servidor Backend
echo [1/3] Iniciando Backend Node.js...
cd backend
start /b node src/server.js

:: 2. Iniciar Servidor Frontend
echo [2/3] Iniciando Frontend React...
cd ..\frontend
start /b npm run dev

:: 3. Pausa para permitir que los servidores levanten
echo [3/3] Abriendo interfaz en modo escritorio...
timeout /t 3 /nobreak >nul

:: 4. Abrir la interfaz sin barras de navegador (Modo App)
start msedge --app=http://localhost:5173