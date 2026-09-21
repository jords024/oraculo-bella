@echo off
chcp 65001 >nul
echo.
echo ============================================================
echo   FONTE OCULTA — Registrando publicacao automatica
echo ============================================================
echo.

:: Remove tarefa antiga se existir
schtasks /delete /tn "FonteOculta-Publicar" /f >nul 2>&1

:: Registra com o XML
schtasks /create /xml "C:\Users\julia\nano-banana-mcp\task_scheduler_fonte_oculta.xml" /tn "FonteOculta-Publicar"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo  OK! Tarefa registrada com sucesso.
    echo  Publicacao automatica: 09h, 13h e 20h todos os dias.
    echo.
    echo  Para verificar: schtasks /query /tn "FonteOculta-Publicar"
    echo  Para testar agora: schtasks /run /tn "FonteOculta-Publicar"
) else (
    echo.
    echo  ERRO ao registrar. Tente executar como Administrador.
    echo  Clique com botao direito em registrar_task.bat -> Executar como admin
)
echo.
pause
