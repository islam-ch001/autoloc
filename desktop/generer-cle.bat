@echo off
chcp 65001 >nul
cd /d "%~dp0"
cls
echo.
echo ============================================================
echo            GENERATEUR DE CLES AUTOLOC
echo               6900 DA - 1 cle = 1 PC
echo ============================================================
echo.
set /p NBCLES=Combien de cles voulez-vous generer ? [1] :
if "%NBCLES%"=="" set NBCLES=1
echo.

REM Cree un dossier "cles" s'il n'existe pas
if not exist "cles" mkdir cles

REM Genere un nom de fichier base sur la date/heure
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set DATE_STR=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%_%datetime:~8,2%h%datetime:~10,2%
set OUTFILE=cles\cles_%DATE_STR%.txt

REM Genere les cles et les sauvegarde dans le fichier
node generate-license.js %NBCLES% "%OUTFILE%"

echo.
echo ============================================================
echo  Cles sauvegardees dans : %OUTFILE%
echo  Le fichier s'ouvre dans le Bloc-notes...
echo ============================================================
echo.

REM Ouvre le fichier dans le Bloc-notes
start notepad "%OUTFILE%"

echo.
echo Appuyez sur une touche pour fermer cette fenetre.
pause >nul
