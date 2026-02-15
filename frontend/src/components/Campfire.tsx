import './Campfire.css';

const Campfire = () => {
  return (
    <div className="campfire-container">
      <img 
        src="/feuer.png" 
        alt="Lagerfeuer" 
        className="campfire-image"
        onError={(e) => {
          // Versuche andere Formate
          const img = e.target as HTMLImageElement;
          if (img.src.includes('.png')) {
            img.src = '/feuer.webp';
          } else if (img.src.includes('.webp')) {
            img.src = '/feuer.jpg';
          } else {
            console.log('Feuer image not found');
          }
        }}
      />
    </div>
  );
};

export default Campfire;
