# AutoLoc Desktop

Application bureau Windows (hors ligne).

## 📦 Pour fabriquer le `.exe` (installeur)

**Double-cliquez sur `build-desktop.bat`** — il fait tout automatiquement :
1. Build du frontend en mode desktop (URL d'API relative)
2. Copie du frontend dans `desktop/frontend/`
3. Installation des dépendances Electron
4. Packaging en `.exe`

Le résultat se trouve dans : `desktop/dist-installer/AutoLoc Setup X.X.X.exe`

## 🧪 Pour tester en mode dev (sans rebuild .exe)

```cmd
cd desktop
npm install
npm run build:frontend && npm run copy:frontend
npm start
```

## 📁 Où sont les données ?

La base SQLite est stockée localement dans :
```
%APPDATA%\AutoLoc\autoloc.db
```

Sauvegardez ce fichier pour conserver vos données. Pour réinitialiser, supprimez-le.

## 🔄 Mise à jour

Pour distribuer une nouvelle version :
1. Modifiez `version` dans `package.json`
2. Re-lancez `build-desktop.bat`
3. Distribuez le nouveau `.exe`

Les utilisateurs lancent le nouvel installeur, leurs données SQLite sont préservées.
