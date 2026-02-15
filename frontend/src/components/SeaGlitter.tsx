import { useEffect, useRef, useState } from 'react';
import './SeaGlitter.css';

interface SeaGlitterProps {
  clipPathId?: string;
  points?: Array<{ top: number; left: number }>;
}

interface ParticlePosition {
  left: number;
  top: number;
  id: string;
  duration: number;
  delay: number;
}

const SeaGlitter = ({ clipPathId, points }: SeaGlitterProps) => {
  const redContainerRef = useRef<HTMLDivElement>(null);
  const [particlePositions, setParticlePositions] = useState<ParticlePosition[]>([]);
  
  // Berechne Partikelanzahl basierend auf Bildschirmgröße
  const getParticleCount = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const area = width * height;
    
    // Basis: 25 Partikel (50% von ursprünglich 50)
    // Für kleinere Bildschirme: proportional reduzieren
    const baseCount = 25;
    const referenceArea = 1920 * 1080; // Referenz: Full HD
    const scale = Math.min(1, area / referenceArea);
    
    // Minimum: 10 Partikel, Maximum: 25 Partikel
    return Math.max(10, Math.floor(baseCount * scale));
  };
  
  const [particleCount, setParticleCount] = useState(getParticleCount());

  useEffect(() => {
    // Funktion zum Setzen der Größen - Container füllt jetzt den gesamten Viewport
    // Die Form wird durch clipPath definiert
    const setSizes = () => {
      if (redContainerRef.current) {
        // Container füllt gesamten Viewport, Form wird durch clipPath definiert
        redContainerRef.current.style.width = '100vw';
        redContainerRef.current.style.height = '100vh';
        redContainerRef.current.style.top = '0';
        redContainerRef.current.style.left = '0';
        redContainerRef.current.style.bottom = 'auto';
      }
      // Aktualisiere Partikelanzahl basierend auf neuer Bildschirmgröße
      setParticleCount(getParticleCount());
    };

    // Initial setzen
    setSizes();

    // Bei Resize neu setzen (für sofortige Anpassung)
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(setSizes, 50);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', setSizes);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', setSizes);
      clearTimeout(resizeTimeout);
    };
  }, []);
  
  // Berechne Bounding Box des Bereichs für Partikel-Positionierung
  const getBoundingBox = () => {
    if (!points || points.length === 0) {
      return { minLeft: 0, maxLeft: 100, minTop: 0, maxTop: 100 };
    }
    const lefts = points.map(p => p.left);
    const tops = points.map(p => p.top);
    return {
      minLeft: Math.min(...lefts),
      maxLeft: Math.max(...lefts),
      minTop: Math.min(...tops),
      maxTop: Math.max(...tops),
    };
  };

  // Generiere ein einzelnes Partikel mit zufälliger Position und Timing
  const generateParticle = (): ParticlePosition => {
    const boundingBox = getBoundingBox();
    const left = boundingBox.minLeft + Math.random() * (boundingBox.maxLeft - boundingBox.minLeft);
    const top = boundingBox.minTop + Math.random() * (boundingBox.maxTop - boundingBox.minTop);
    // Verschiedene Dauern: 0.8-4 Sekunden (einige kurz, einige lang)
    const duration = 0.8 + Math.random() * 3.2;
    // Verschiedene Delays: 0-2 Sekunden
    const delay = Math.random() * 2;
    return {
      left,
      top,
      id: `${Date.now()}-${Math.random()}`,
      duration,
      delay,
    };
  };

  // Initialisiere Partikel-Positionen mit unterschiedlichen Timings
  useEffect(() => {
    const initialParticles = Array.from({ length: particleCount }).map(() => generateParticle());
    setParticlePositions(initialParticles);
  }, [points, particleCount]);

  // Ersetze einzelne Partikel kontinuierlich (nicht alle auf einmal)
  useEffect(() => {
    if (particlePositions.length === 0) return;

    const interval = setInterval(() => {
      setParticlePositions(prev => {
        // Ersetze zufällig 1-3 Partikel (nicht alle)
        const replaceCount = 1 + Math.floor(Math.random() * 3);
        const newParticles = [...prev];
        
        // Entferne zufällige Partikel
        for (let i = 0; i < replaceCount && newParticles.length > 0; i++) {
          const randomIndex = Math.floor(Math.random() * newParticles.length);
          newParticles.splice(randomIndex, 1);
        }
        
        // Füge neue Partikel hinzu
        for (let i = 0; i < replaceCount; i++) {
          newParticles.push(generateParticle());
        }
        
        return newParticles;
      });
    }, 500 + Math.random() * 1000); // Alle 0.5-1.5 Sekunden

    return () => clearInterval(interval);
  }, [particlePositions.length, points]);

  return (
    <div 
      ref={redContainerRef} 
      className="sea-glitter-container"
      style={clipPathId ? { 
        clipPath: `url(#${clipPathId})`,
        WebkitClipPath: `url(#${clipPathId})`
      } : {}}
    >
      {particlePositions.map((pos) => (
        <div
          key={pos.id}
          className="glitter-particle"
          style={{
            left: `${pos.left}%`,
            top: `${pos.top}%`,
            animationDelay: `${pos.delay}s`,
            animationDuration: `${pos.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

export default SeaGlitter;
