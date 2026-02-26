import { forwardRef, useEffect, useRef, useState } from 'react';
import SeaGlitter from './SeaGlitter';
import FireSparks from './FireSparks';

const DESIGN_WIDTH = 2560;
const DESIGN_HEIGHT = 1440;
const AFFE_ANCHOR_TOP_PERCENT = 13.08;
const AFFE_ANCHOR_LEFT_PERCENT = 77.08;
const AFFE_BASE_SIZE_PX = 58.326;
const FEUER_ANCHOR_TOP_PERCENT = 55.50;
const FEUER_ANCHOR_LEFT_PERCENT = 62.32;
const FEUER_BASE_SIZE_PX = 184.68;
const BAMBUS_ANCHOR_TOP_PERCENT = 25;
const BAMBUS_ANCHOR_LEFT_PERCENT = 50;
const BAMBUS_BASE_WIDTH_PX = 301;
const BAMBUS_BASE_HEIGHT_PX = 463;
const CLOUD_SIZE_FACTOR = 1.2;
const CLOUD_POSITIONS = [
  { top: 15.98, left: 36.15, maxWidth: 237.3, height: 170.9 },
  { top: 4.76, left: 44.95, maxWidth: 237.3, height: 170.9 },
  { top: 28.15, left: 22.55, maxWidth: 118.65, height: 85.43 },
  { top: 14.29, left: 16.93, maxWidth: 237.3, height: 170.9 },
  { top: 21.27, left: 30.63, maxWidth: 237.3, height: 170.9 },
] as const;
const GLITTER_POINTS_DESIGN = [
  { top: 42.20, left: 0.16 },
  { top: 43.04, left: 35.52 },
  { top: 46.01, left: 35.31 },
  { top: 51.51, left: 52.60 },
  { top: 83.04, left: 0.16 },
  { top: 42.20, left: 0.16 },
] as const;

export interface AuthBackgroundProps {
  clipPathId?: string;
  /** Optional: eigenes Hintergrundbild (z. B. für Register). Ohne Angabe: login-background.webp aus CSS. */
  backgroundImage?: string;
}

const AuthBackground = forwardRef<HTMLDivElement, AuthBackgroundProps>(
  ({ clipPathId = 'glitter-clip-path', backgroundImage }, ref) => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const bambusWrapperRef = useRef<HTMLDivElement>(null);
    const affeWrapperRef = useRef<HTMLDivElement>(null);
    const affeImageRef = useRef<HTMLImageElement>(null);
    const cloud1Ref = useRef<HTMLImageElement>(null);
    const cloud2Ref = useRef<HTMLImageElement>(null);
    const cloud3Ref = useRef<HTMLImageElement>(null);
    const cloud4Ref = useRef<HTMLImageElement>(null);
    const cloud5Ref = useRef<HTMLImageElement>(null);
    const feuer1Ref = useRef<HTMLImageElement>(null);
    const feuer2Ref = useRef<HTMLImageElement>(null);
    const fireSparksWrapperRef = useRef<HTMLDivElement>(null);
    const [glitterViewportPoints, setGlitterViewportPoints] = useState<Array<{ top: number; left: number }>>([]);

    useEffect(() => {
      const overlayEl = overlayRef.current;
      if (!overlayEl) return;

      const affeAnchorX = DESIGN_WIDTH * (AFFE_ANCHOR_LEFT_PERCENT / 100);
      const affeAnchorY = DESIGN_HEIGHT * (AFFE_ANCHOR_TOP_PERCENT / 100);
      const feuerAnchorX = DESIGN_WIDTH * (FEUER_ANCHOR_LEFT_PERCENT / 100);
      const feuerAnchorY = DESIGN_HEIGHT * (FEUER_ANCHOR_TOP_PERCENT / 100);
      const bambusAnchorX = DESIGN_WIDTH * (BAMBUS_ANCHOR_LEFT_PERCENT / 100);
      const bambusAnchorY = DESIGN_HEIGHT * (BAMBUS_ANCHOR_TOP_PERCENT / 100);

      const updatePositions = () => {
        const rect = overlayEl.getBoundingClientRect();
        const W = rect.width;
        const H = rect.height;
        const scale = Math.max(W / DESIGN_WIDTH, H / DESIGN_HEIGHT);
        const scaledWidth = DESIGN_WIDTH * scale;
        const scaledHeight = DESIGN_HEIGHT * scale;
        const cropX = Math.max(0, (scaledWidth - W) / 2);
        const cropY = Math.max(0, (scaledHeight - H) / 2);

        if (affeImageRef.current && affeWrapperRef.current) {
          const localX = affeAnchorX * scale - cropX;
          const localY = affeAnchorY * scale - cropY;
          const viewportX = rect.left + localX;
          const viewportY = rect.top + localY;
          const affeWidth = AFFE_BASE_SIZE_PX * scale;
          affeWrapperRef.current.style.left = `${viewportX}px`;
          affeWrapperRef.current.style.top = `${viewportY}px`;
          affeWrapperRef.current.style.minWidth = `${affeWidth}px`;
          affeImageRef.current.style.width = `${affeWidth}px`;
        }

        if (bambusWrapperRef.current) {
          const localX = bambusAnchorX * scale - cropX;
          const localY = bambusAnchorY * scale - cropY;
          const viewportX = rect.left + localX;
          const viewportY = rect.top + localY;
          const bambusWidth = BAMBUS_BASE_WIDTH_PX * scale;
          const bambusHeight = BAMBUS_BASE_HEIGHT_PX * scale;
          bambusWrapperRef.current.style.left = `${viewportX}px`;
          bambusWrapperRef.current.style.top = `${viewportY}px`;
          bambusWrapperRef.current.style.width = `${bambusWidth}px`;
          bambusWrapperRef.current.style.height = `${bambusHeight}px`;
        }

        if (feuer1Ref.current && feuer2Ref.current) {
          const localX = feuerAnchorX * scale - cropX;
          const localY = feuerAnchorY * scale - cropY;
          const viewportX = rect.left + localX;
          const viewportY = rect.top + localY;
          const feuerSize = FEUER_BASE_SIZE_PX * scale;
          [feuer1Ref.current, feuer2Ref.current].forEach((el) => {
            el.style.left = `${viewportX}px`;
            el.style.top = `${viewportY}px`;
            el.style.maxWidth = `${feuerSize}px`;
            el.style.maxHeight = `${feuerSize}px`;
          });
        }

        const cloudRefs = [cloud1Ref, cloud2Ref, cloud3Ref, cloud4Ref, cloud5Ref];
        cloudRefs.forEach((cloudRef, index) => {
          if (cloudRef.current) {
            const pos = CLOUD_POSITIONS[index];
            const anchorX = DESIGN_WIDTH * (pos.left / 100);
            const anchorY = DESIGN_HEIGHT * (pos.top / 100);
            const localX = anchorX * scale - cropX;
            const localY = anchorY * scale - cropY;
            const viewportX = rect.left + localX;
            const viewportY = rect.top + localY;
            const maxWidth = pos.maxWidth * scale * CLOUD_SIZE_FACTOR;
            const height = pos.height * scale * CLOUD_SIZE_FACTOR;
            cloudRef.current.style.left = `${viewportX}px`;
            cloudRef.current.style.top = `${viewportY}px`;
            cloudRef.current.style.maxWidth = `${maxWidth}px`;
            cloudRef.current.style.height = `${height}px`;
          }
        });

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const viewportPoints = GLITTER_POINTS_DESIGN.map((p) => {
          const ax = DESIGN_WIDTH * (p.left / 100);
          const ay = DESIGN_HEIGHT * (p.top / 100);
          const lx = ax * scale - cropX;
          const ly = ay * scale - cropY;
          const vx = rect.left + lx;
          const vy = rect.top + ly;
          return { left: (vx / vw) * 100, top: (vy / vh) * 100 };
        });
        setGlitterViewportPoints(viewportPoints);

        if (fireSparksWrapperRef.current) {
          const localX = feuerAnchorX * scale - cropX;
          const localY = feuerAnchorY * scale - cropY;
          const viewportX = rect.left + localX;
          const viewportY = rect.top + localY;
          fireSparksWrapperRef.current.style.left = `${viewportX}px`;
          fireSparksWrapperRef.current.style.top = `${viewportY}px`;
          fireSparksWrapperRef.current.style.setProperty('--scale', String(scale));
        }
      };

      updatePositions();
      const t1 = setTimeout(updatePositions, 150);
      const t2 = setTimeout(updatePositions, 400);
      const t3 = setTimeout(updatePositions, 800);
      let lastW = 0;
      let lastH = 0;
      let resizeTimeout: ReturnType<typeof setTimeout>;
      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          const r = overlayEl.getBoundingClientRect();
          const w = r?.width ?? 0;
          const h = r?.height ?? 0;
          if (Math.abs(w - lastW) > 1 || Math.abs(h - lastH) > 1) {
            updatePositions();
            lastW = w;
            lastH = h;
          }
        }, 100);
      };
      const handleVisibility = () => {
        if (document.visibilityState === 'visible') updatePositions();
      };
      window.addEventListener('resize', handleResize);
      document.addEventListener('visibilitychange', handleVisibility);
      return () => {
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('visibilitychange', handleVisibility);
        clearTimeout(resizeTimeout);
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }, []);

    const glitterPoints = glitterViewportPoints.length > 0 ? glitterViewportPoints : [...GLITTER_POINTS_DESIGN];

    const setOverlayRef = (el: HTMLDivElement | null) => {
      (overlayRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      if (typeof ref === 'function') ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
    };
    return (
      <>
        <div
          ref={setOverlayRef}
          className="login-hintergrund-overlay"
          aria-hidden="true"
          style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } : undefined}
        />
        <div ref={bambusWrapperRef} className="login-bambus-wrapper" aria-hidden="true">
          <img src="/Login_Bambus.webp" alt="" className="login-bambus" />
        </div>
        <svg
          className="red-line-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 0 }}
        >
          <defs>
            <clipPath id={clipPathId} clipPathUnits="objectBoundingBox">
              <path
                d={glitterPoints
                  .map((point, index) => {
                    const x = point.left / 100;
                    const y = point.top / 100;
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .join(' ') + ' Z'}
              />
            </clipPath>
          </defs>
        </svg>
        <SeaGlitter clipPathId={clipPathId} points={glitterPoints} />
        <img ref={cloud1Ref} src="/Startseite_Wolke1.webp" alt="Wolke" className="cloud-image" />
        <img ref={cloud2Ref} src="/Startseite_Wolke2.webp" alt="Wolke 2" className="cloud-image-2" />
        <img ref={cloud3Ref} src="/Startseite_Wolke3.webp" alt="Wolke 3" className="cloud-image-3" />
        <img ref={cloud4Ref} src="/Startseite_Wolke4.webp" alt="Wolke 4" className="cloud-image-4" />
        <div ref={affeWrapperRef} className="affee-wrapper">
          <img ref={affeImageRef} src="/Affe.webp" alt="Affe" className="affee-image" />
        </div>
        <img ref={cloud5Ref} src="/Wolke5.webp" alt="Wolke 5" className="cloud-image-5" />
        <img ref={feuer1Ref} src="/Feuer1.webp" alt="Feuer 1" className="feuer-animation-image feuer-frame-1" />
        <img ref={feuer2Ref} src="/Feuer2.webp" alt="Feuer 2" className="feuer-animation-image feuer-frame-2" />
        <div ref={fireSparksWrapperRef} className="fire-sparks-wrapper" aria-hidden="true">
          <FireSparks />
        </div>
      </>
    );
  }
);

AuthBackground.displayName = 'AuthBackground';

export default AuthBackground;
