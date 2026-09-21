@echo off
chcp 65001 >nul
cd /d "C:\Users\julia\nano-banana-mcp"

:: Fonte Oculta — Auto Publicador
:: Executado 3x ao dia pelo Task Scheduler (09h, 13h, 20h)
:: Publica o próximo carrossel com status 'pronto'

set LOG=C:\Users\julia\nano-banana-mcp\logs\publicar.log
set DT=%date% %time%

echo. >> %LOG%
echo ==================== %DT% ==================== >> %LOG%

python -X utf8 publicar.py --auto >> %LOG% 2>&1

if %ERRORLEVEL% EQU 0 (
    echo [OK] Publicado com sucesso >> %LOG%
) else (
    echo [ERRO] Falha na publicacao -- codigo %ERRORLEVEL% >> %LOG%
)
