import './Sparkles.css';

const Sparkles = () => {
  // Erstelle mehrere Funkenpartikel mit unterschiedlichen Timings
  const sparkles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    delay: i * 0.5, // Jeder Funke startet mit etwas Versatz
    duration: 6 + Math.random() * 4, // 6-10 Sekunden für langsames, realistisches Wegfliegen
    distance: 100 + Math.random() * 150, // Entfernung: 100-250px nach oben
    size: 2 + Math.random() * 3, // Größe zwischen 2px und 5px (kleinere, realistischere Funken)
    startX: 48 + Math.random() * 4, // Startposition: 48-52% (über dem Feuer)
  }));

  return (
    <div className="sparkles-container">
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="sparkle"
          style={{
            '--delay': `${sparkle.delay}s`,
            '--duration': `${sparkle.duration}s`,
            '--angle': `${sparkle.angle}deg`,
            '--distance': `${sparkle.distance}px`,
            '--size': `${sparkle.size}px`,
            '--startX': `${sparkle.startX}%`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default Sparkles;
