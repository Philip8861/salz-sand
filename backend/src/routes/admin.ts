import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import archiver from 'archiver';

const router = express.Router();

const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const lstat = promisify(fs.lstat);

// Rekursives Kopieren von Verzeichnissen
async function copyDirectory(src: string, dest: string): Promise<void> {
  // Erstelle Zielverzeichnis, falls es nicht existiert
  try {
    await mkdir(dest, { recursive: true });
  } catch (error: any) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }

  // Lese alle Einträge im Quellverzeichnis
  const entries = await readdir(src);

  for (const entry of entries) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);

    // Prüfe, ob es ein Symlink ist
    const stats = await lstat(srcPath);
    
    if (stats.isSymbolicLink()) {
      // Symlinks überspringen
      continue;
    }

    if (stats.isDirectory()) {
      // Rekursiv kopieren
      await copyDirectory(srcPath, destPath);
    } else {
      // Datei kopieren
      await copyFile(srcPath, destPath);
    }
  }
}

// Backup-Endpoint - erstellt ZIP-Datei
router.post('/backup', async (req, res) => {
  let archive: archiver.Archiver | null = null;
  let output: fs.WriteStream | null = null;
  
  try {
    // Bestimme den SalzundSand Ordner
    // Im Development: backend/src/routes -> backend -> SalzundSand (2 Ebenen)
    // Im Production: dist/routes -> dist -> backend -> SalzundSand (3 Ebenen)
    let sourceDir = path.resolve(__dirname, '../..');
    // Prüfe, ob wir im backend Ordner sind, dann eine Ebene höher
    if (path.basename(sourceDir) === 'backend') {
      sourceDir = path.resolve(sourceDir, '..');
    } else if (path.basename(sourceDir) === 'dist') {
      sourceDir = path.resolve(sourceDir, '..', '..');
    }
    
    // Prüfe, ob Quellverzeichnis existiert
    if (!fs.existsSync(sourceDir)) {
      return res.status(404).json({ 
        error: 'Quellverzeichnis nicht gefunden',
        path: sourceDir 
      });
    }

    // Erstelle Backup-Verzeichnis, falls es nicht existiert
    const backupDir = 'C:\\Users\\info\\Desktop\\SalzundSand_BACKUP';
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Erstelle ZIP-Dateiname mit Timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const zipFileName = `SalzundSand_Backup_${timestamp}.zip`;
    const zipFilePath = path.join(backupDir, zipFileName);

    // Lösche alte ZIP-Datei, falls vorhanden (mit gleichem Namen)
    if (fs.existsSync(zipFilePath)) {
      fs.unlinkSync(zipFilePath);
    }

    // Erstelle ZIP-Archiv
    output = fs.createWriteStream(zipFilePath);
    archive = archiver('zip', {
      zlib: { level: 9 } // Maximale Kompression
    });

    // Event-Handler für Archiv
    archive.on('error', (err) => {
      throw err;
    });

    // Pipe Archiv-Daten zur Datei
    archive.pipe(output);

    // Füge alle Dateien und Verzeichnisse zum Archiv hinzu
    console.log(`Erstelle ZIP-Backup von ${sourceDir} nach ${zipFilePath}`);
    
    // Zähle Dateien während des Archivierens
    let fileCount = 0;
    let dirCount = 0;

    function addToArchive(dir: string, basePath: string = ''): void {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.join(basePath, entry.name).replace(/\\/g, '/');
        
        // Überspringe nur den Backup-Ordner selbst, um Endlosschleifen zu vermeiden
        if (entry.name === 'SalzundSand_BACKUP' && basePath === '') {
          continue;
        }

        try {
          if (entry.isDirectory()) {
            dirCount++;
            addToArchive(fullPath, relativePath);
          } else {
            fileCount++;
            archive!.file(fullPath, { name: relativePath });
          }
        } catch (error: any) {
          // Überspringe Dateien, die nicht gelesen werden können (z.B. gesperrte Dateien)
          console.warn(`Überspringe ${fullPath}: ${error.message}`);
        }
      }
    }

    // Starte das Archivieren
    addToArchive(sourceDir);

    // Finalisiere das Archiv
    await archive.finalize();

    // Warte, bis die Datei vollständig geschrieben wurde
    await new Promise<void>((resolve, reject) => {
      output!.on('close', () => {
        const fileSize = archive!.pointer();
        console.log(`ZIP-Backup erstellt: ${fileSize} Bytes`);
        resolve();
      });
      output!.on('error', reject);
    });

    // Hole Dateigröße
    const stats = fs.statSync(zipFilePath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    res.json({
      success: true,
      message: `ZIP-Backup erfolgreich erstellt!\n${fileCount} Dateien in ${dirCount} Verzeichnissen.\nDateigröße: ${fileSizeMB} MB`,
      source: sourceDir,
      destination: zipFilePath,
      filename: zipFileName,
      files: fileCount,
      directories: dirCount,
      size: stats.size,
      sizeMB: parseFloat(fileSizeMB),
    });
  } catch (error: any) {
    console.error('Backup-Fehler:', error);
    
    // Cleanup bei Fehler
    if (archive) {
      archive.abort();
    }
    if (output) {
      output.destroy();
    }
    
    res.status(500).json({
      error: 'Fehler beim Erstellen des ZIP-Backups',
      message: error.message,
    });
  }
});

export default router;
