import './FireSparks.css';

const FireSparks = () => {
  // Erstelle weniger kleine Funkenpartikel mit unterschiedlichen Timings
  const sparks = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    delay: i * 0.4 + Math.random() * 0.5, // Jeder Funke startet mit etwas Versatz
    duration: 6 + Math.random() * 3, // 6-9 Sekunden für langsames Aufsteigen
    distance: 100 + Math.random() * 150, // Entfernung: 100-250px nach oben
    size: 1.5 + Math.random() * 2.5, // Größe zwischen 1.5px und 4px (kleine Funken)
    horizontalOffset: (Math.random() - 0.5) * 60, // Breitere horizontale Variation: -30px bis +30px
    wiggle1: (Math.random() - 0.5) * 40, // Zufällige Bewegung 1: -20px bis +20px
    wiggle2: (Math.random() - 0.5) * 50, // Zufällige Bewegung 2: -25px bis +25px
    wiggle3: (Math.random() - 0.5) * 60, // Zufällige Bewegung 3: -30px bis +30px
  }));

  return (
    <div className="fire-sparks-container">
      {sparks.map((spark) => (
        <div
          key={spark.id}
          className="fire-spark"
          style={{
            '--delay': `${spark.delay}s`,
            '--duration': `${spark.duration}s`,
            '--distance': `${spark.distance}px`,
            '--size': `${spark.size}px`,
            '--horizontalOffset': `${spark.horizontalOffset}px`,
            '--wiggle1': `${spark.wiggle1}px`,
            '--wiggle2': `${spark.wiggle2}px`,
            '--wiggle3': `${spark.wiggle3}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default FireSparks;
