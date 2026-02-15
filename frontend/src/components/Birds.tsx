import './Birds.css';

const Birds = () => {
  // Erstelle mehrere Vögel mit unterschiedlichen Timings
  // Erster Vogel startet sofort (delay: 0), dann alle 4 Sekunden ein neuer
  const birds = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    delay: i * 3, // Jeder Vogel startet 3 Sekunden nach dem vorherigen (schnellerer Start)
    duration: 25 + Math.random() * 10, // 25-35 Sekunden für langsames Fliegen
    top: 10 + Math.random() * 60, // Zufällige Höhe zwischen 10% und 70%
    size: 20 + Math.random() * 15, // Größe zwischen 20px und 35px (größer und besser sichtbar)
  }));

  return (
    <div className="birds-container">
      {birds.map((bird) => (
        <div
          key={bird.id}
          className="bird"
          style={{
            '--delay': `${bird.delay}s`,
            '--duration': `${bird.duration}s`,
            '--top': `${bird.top}%`,
            '--size': `${bird.size}px`,
          } as React.CSSProperties}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="bird-svg"
          >
            {/* Vogel-Silhouette: Einfacher Vogel in der Ferne - dunkler für bessere Sichtbarkeit */}
            <path
              d="M12 8 C10 6, 8 7, 8 9 C8 11, 10 12, 12 12 C14 12, 16 11, 16 9 C16 7, 14 6, 12 8 Z"
              fill="rgba(0, 0, 0, 0.75)"
            />
            <path
              d="M6 10 Q4 8, 2 10"
              stroke="rgba(0, 0, 0, 0.75)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M18 10 Q20 8, 22 10"
              stroke="rgba(0, 0, 0, 0.75)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default Birds;
