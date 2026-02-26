const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3001; // Anderer Port als der Hauptserver

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/backup') {
    console.log('Backup-Anfrage erhalten...');
    
    // Starte backup.js Script
    const backupScriptPath = path.join(__dirname, 'backup.js');
    
    exec(`node "${backupScriptPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('Backup-Fehler:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          error: error.message,
          stderr: stderr 
        }));
        return;
      }

      console.log('Backup erfolgreich!');
      console.log(stdout);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: true, 
        message: 'Backup erfolgreich erstellt!',
        output: stdout 
      }));
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Backup-Server läuft auf Port ${PORT}`);
  console.log('Drücke Ctrl+C zum Beenden');
});

// Server läuft dauerhaft (nur beenden mit Ctrl+C)
// Kein automatisches Beenden mehr
