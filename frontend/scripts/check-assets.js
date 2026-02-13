#!/usr/bin/env node

/**
 * Performance-Check Script
 * Prüft Dateigrößen und warnt bei zu großen Assets
 */

const fs = require('fs');
const path = require('path');

const LIMITS = {
  images: 200 * 1024, // 200 KB
  svg: 50 * 1024, // 50 KB
  js: 500 * 1024, // 500 KB
  css: 100 * 1024, // 100 KB
  fonts: 200 * 1024, // 200 KB
};

const WARNINGS = {
  images: 100 * 1024, // 100 KB
  svg: 25 * 1024, // 25 KB
  js: 300 * 1024, // 300 KB
  css: 50 * 1024, // 50 KB
  fonts: 100 * 1024, // 100 KB
};

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function checkDirectory(dir, extensions, type, limit, warning) {
  const files = [];
  
  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        walkDir(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase();
        if (extensions.includes(ext)) {
          const size = getFileSize(fullPath);
          files.push({ path: fullPath, size, name: item });
        }
      }
    }
  }
  
  walkDir(dir);
  
  const issues = [];
  
  for (const file of files) {
    if (file.size > limit) {
      issues.push({
        type: 'ERROR',
        file: file.name,
        path: file.path,
        size: formatBytes(file.size),
        limit: formatBytes(limit),
        message: `❌ ${file.name} ist zu groß! (${formatBytes(file.size)} > ${formatBytes(limit)})`,
      });
    } else if (file.size > warning) {
      issues.push({
        type: 'WARNING',
        file: file.name,
        path: file.path,
        size: formatBytes(file.size),
        warning: formatBytes(warning),
        message: `⚠️ ${file.name} ist groß (${formatBytes(file.size)}). Optimierung empfohlen.`,
      });
    }
  }
  
  return issues;
}

function checkBuildOutput() {
  const distPath = path.join(__dirname, '..', 'dist');
  
  if (!fs.existsSync(distPath)) {
    console.log('⚠️ Build-Output nicht gefunden. Führe zuerst "npm run build" aus.');
    return [];
  }
  
  const issues = [];
  
  // Prüfe JavaScript Bundles
  const jsIssues = checkDirectory(
    distPath,
    ['.js'],
    'JavaScript',
    LIMITS.js,
    WARNINGS.js
  );
  issues.push(...jsIssues);
  
  // Prüfe CSS Bundles
  const cssIssues = checkDirectory(
    distPath,
    ['.css'],
    'CSS',
    LIMITS.css,
    WARNINGS.css
  );
  issues.push(...cssIssues);
  
  return issues;
}

function checkAssets() {
  const assetsPath = path.join(__dirname, '..', 'public');
  const srcPath = path.join(__dirname, '..', 'src');
  
  const issues = [];
  
  // Prüfe Bilder in public
  if (fs.existsSync(assetsPath)) {
    const imageIssues = checkDirectory(
      assetsPath,
      ['.png', '.jpg', '.jpeg', '.webp'],
      'Bilder',
      LIMITS.images,
      WARNINGS.images
    );
    issues.push(...imageIssues);
    
    const svgIssues = checkDirectory(
      assetsPath,
      ['.svg'],
      'SVG',
      LIMITS.svg,
      WARNINGS.svg
    );
    issues.push(...svgIssues);
  }
  
  // Prüfe Bilder in src
  if (fs.existsSync(srcPath)) {
    const imageIssues = checkDirectory(
      srcPath,
      ['.png', '.jpg', '.jpeg', '.webp'],
      'Bilder',
      LIMITS.images,
      WARNINGS.images
    );
    issues.push(...imageIssues);
    
    const svgIssues = checkDirectory(
      srcPath,
      ['.svg'],
      'SVG',
      LIMITS.svg,
      WARNINGS.svg
    );
    issues.push(...svgIssues);
  }
  
  return issues;
}

// Main
console.log('🔍 Performance-Check wird durchgeführt...\n');

const assetIssues = checkAssets();
const buildIssues = checkBuildOutput();

const allIssues = [...assetIssues, ...buildIssues];

if (allIssues.length === 0) {
  console.log('✅ Alle Dateien sind innerhalb der Limits!\n');
  process.exit(0);
}

console.log('\n═══════════════════════════════════════════════════');
console.log('⚠️  PERFORMANCE-WARNUNGEN GEFUNDEN!');
console.log('═══════════════════════════════════════════════════\n');

const errors = allIssues.filter(i => i.type === 'ERROR');
const warnings = allIssues.filter(i => i.type === 'WARNING');

if (errors.length > 0) {
  console.log('❌ FEHLER (Dateien zu groß):\n');
  errors.forEach(issue => {
    console.log(`  ${issue.message}`);
    console.log(`  Pfad: ${issue.path}\n`);
  });
}

if (warnings.length > 0) {
  console.log('⚠️  WARNUNGEN (Optimierung empfohlen):\n');
  warnings.forEach(issue => {
    console.log(`  ${issue.message}`);
    console.log(`  Pfad: ${issue.path}\n`);
  });
}

console.log('═══════════════════════════════════════════════════\n');

if (errors.length > 0) {
  console.log('🚨 SOFORT HANDELN: Dateien überschreiten Limits!');
  console.log('   → Bilder optimieren (TinyPNG, Squoosh)');
  console.log('   → Code Splitting verwenden');
  console.log('   → Unnötige Dependencies entfernen\n');
  process.exit(1);
} else {
  console.log('💡 Optimierung empfohlen, aber nicht kritisch.\n');
  process.exit(0);
}
