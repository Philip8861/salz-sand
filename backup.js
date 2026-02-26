const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Hauptordner (aktuelles Verzeichnis)
const sourceDir = __dirname;
const backupDir = 'C:\\Users\\info\\Desktop\\SalzundSand_BACKUP';

// Erstelle Backup-Verzeichnis, falls es nicht existiert
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Erstelle ZIP-Dateiname mit Timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const zipFileName = `SalzundSand_Backup_${timestamp}.zip`;
const zipFilePath = path.join(backupDir, zipFileName);

console.log('========================================');
console.log('  Salz und Sand Backup');
console.log('========================================');
console.log('');
console.log(`Quellverzeichnis: ${sourceDir}`);
console.log(`Ziel: ${zipFilePath}`);
console.log('');
console.log('Erstelle ZIP-Datei...');

// Erstelle ZIP-Archiv
const output = fs.createWriteStream(zipFilePath);
const archive = archiver('zip', {
  zlib: { level: 9 } // Maximale Kompression
});

// Event-Handler
archive.on('error', (err) => {
  console.error('Fehler beim Erstellen der ZIP:', err);
  process.exit(1);
});

archive.pipe(output);

// Zähle Dateien
let fileCount = 0;
let dirCount = 0;

function addToArchive(dir, basePath = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name).replace(/\\/g, '/');
    
    // Überspringe den Backup-Ordner selbst
    if (entry.name === 'SalzundSand_BACKUP' && basePath === '') {
      continue;
    }
    
    // Überspringe node_modules für kleinere Backups (kann wiederhergestellt werden)
    if (entry.name === 'node_modules' && basePath === '') {
      console.log('Überspringe node_modules...');
      continue;
    }

    try {
      if (entry.isDirectory()) {
        dirCount++;
        addToArchive(fullPath, relativePath);
      } else {
        fileCount++;
        archive.file(fullPath, { name: relativePath });
        if (fileCount % 100 === 0) {
          process.stdout.write(`\r${fileCount} Dateien verarbeitet...`);
        }
      }
    } catch (error) {
      console.warn(`Überspringe ${fullPath}: ${error.message}`);
    }
  }
}

// Starte das Archivieren
addToArchive(sourceDir);

// Finalisiere das Archiv
archive.finalize();

// Warte, bis die Datei vollständig geschrieben wurde
output.on('close', () => {
  const fileSize = archive.pointer();
  const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
  
  console.log('');
  console.log('========================================');
  console.log('  Backup erfolgreich erstellt!');
  console.log('========================================');
  console.log(`Datei: ${zipFileName}`);
  console.log(`Speicherort: ${backupDir}`);
  console.log(`Dateigröße: ${fileSizeMB} MB`);
  console.log(`Dateien: ${fileCount}`);
  console.log(`Verzeichnisse: ${dirCount}`);
  console.log('');
  console.log('Fertig!');
});

output.on('error', (err) => {
  console.error('Fehler beim Schreiben der Datei:', err);
  process.exit(1);
});
