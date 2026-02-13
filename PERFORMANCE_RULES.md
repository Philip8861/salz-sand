# 🚀 Performance-Regeln für Salz&Sand

## ⚠️ WICHTIG: Performance-Hinweise

**Wenn eine Datei oder ein Asset zu groß wird und die Performance leidet, muss dies SOFORT gemeldet werden!**

---

## 📊 Performance-Limits

### Dateigrößen-Limits

| Asset-Typ | Max. Größe | Warnung bei |
|-----------|------------|-------------|
| **Bilder (PNG/JPG)** | 200 KB | 100 KB |
| **SVG** | 50 KB | 25 KB |
| **JavaScript Bundle** | 500 KB | 300 KB |
| **CSS Bundle** | 100 KB | 50 KB |
| **Fonts** | 200 KB | 100 KB |
| **Videos** | 5 MB | 2 MB |
| **Audio** | 500 KB | 200 KB |

### Performance-Metriken

| Metrik | Ziel | Warnung bei |
|--------|------|-------------|
| **First Contentful Paint (FCP)** | < 1.8s | > 2.5s |
| **Largest Contentful Paint (LCP)** | < 2.5s | > 4.0s |
| **Time to Interactive (TTI)** | < 3.8s | > 5.0s |
| **Total Blocking Time (TBT)** | < 200ms | > 300ms |
| **Cumulative Layout Shift (CLS)** | < 0.1 | > 0.25 |

---

## 🔍 Was zu prüfen ist

### Bei jedem Feature/Update:

1. **Dateigrößen prüfen**
   - Bilder optimiert?
   - JavaScript Bundle zu groß?
   - CSS zu groß?

2. **Ladezeiten prüfen**
   - Seite lädt schnell?
   - API-Responses schnell?
   - Keine unnötigen Requests?

3. **Browser-Performance**
   - Keine Lag-Spikes?
   - Smooth Animations?
   - Keine Memory Leaks?

---

## 🚨 Sofort melden bei:

- ✅ Datei > Limit (siehe Tabelle oben)
- ✅ Ladezeit > 3 Sekunden
- ✅ Sichtbare Performance-Probleme
- ✅ Bundle-Größe wächst stark
- ✅ API-Responses > 1 Sekunde
- ✅ Browser wird langsam

---

## 🛠️ Performance-Optimierungen

### Bilder
- ✅ WebP Format verwenden
- ✅ Lazy Loading für Bilder
- ✅ Responsive Images (srcset)
- ✅ Compression (TinyPNG, Squoosh)

### JavaScript
- ✅ Code Splitting
- ✅ Tree Shaking
- ✅ Lazy Loading für Routes
- ✅ Minimize Bundle Size

### CSS
- ✅ PurgeCSS (unused CSS entfernen)
- ✅ CSS Minification
- ✅ Critical CSS inline

### API
- ✅ Caching wo möglich
- ✅ Pagination für große Daten
- ✅ Optimierte Queries
- ✅ Rate Limiting (bereits aktiv)

---

## 📝 Checkliste vor jedem Commit

- [ ] Dateigrößen geprüft?
- [ ] Performance getestet?
- [ ] Bundle-Größe akzeptabel?
- [ ] Ladezeiten OK?
- [ ] Keine Performance-Warnungen?

---

## 🔧 Tools zum Prüfen

- **Chrome DevTools**: Lighthouse, Performance Tab
- **Bundle Analyzer**: `npm run build -- --analyze`
- **Network Tab**: Request-Größen prüfen
- **Vercel Analytics**: Real User Metrics

---

**WICHTIG: Performance hat oberste Priorität! Bei Problemen sofort melden!**
