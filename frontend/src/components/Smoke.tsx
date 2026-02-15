import './Smoke.css';

const Smoke = () => {
  // Erstelle mehrere Rauch-Partikel mit unterschiedlichen Timings
  const smokeParticles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    delay: i * 0.4, // Jeder Partikel startet mit etwas Versatz
    duration: 6 + Math.random() * 3, // 6-9 Sekunden für langsames Steigen
    left: 48 + Math.random() * 4, // Position genau über dem Feuer (48-52%)
    size: 50 + Math.random() * 60, // Größe zwischen 50px und 110px
    opacity: 0.5 + Math.random() * 0.3, // Stärkere Sichtbarkeit (0.5-0.8)
  }));

  return (
    <div className="smoke-container">
      {smokeParticles.map((particle) => (
        <div
          key={particle.id}
          className="smoke-particle"
          style={{
            '--delay': `${particle.delay}s`,
            '--duration': `${particle.duration}s`,
            '--left': `${particle.left}%`,
            '--size': `${particle.size}px`,
            '--opacity': particle.opacity,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default Smoke;
