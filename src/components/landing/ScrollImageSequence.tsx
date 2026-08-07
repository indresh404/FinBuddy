import React, { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Eagerly load all hero animation frame URLs in Vite ─────────────────────
const rawModules = import.meta.glob(
  '../../assets/images/hero_animation/Comp 1/hero*.png',
  { eager: true, import: 'default', query: '?url' }
) as Record<string, string>;

// Sort keys numerically to ensure frame ordering (e.g. hero00000 -> hero00115)
const sortedKeys = Object.keys(rawModules).sort((a, b) => {
  const getNum = (s: string) => parseInt(s.match(/hero(\d+)/)?.[1] ?? '0', 10);
  return getNum(a) - getNum(b);
});

// We only want exactly the first 116 frames (0 to 115)
const FRAME_URLS: string[] = sortedKeys.slice(0, 116).map((k) => rawModules[k]);
const TOTAL_FRAMES = FRAME_URLS.length;

interface ScrollImageSequenceProps {
  sectionRef: React.RefObject<HTMLDivElement | null>;
  pinnedRef: React.RefObject<HTMLDivElement | null>;
  scrollDistance: number;
  onProgressUpdate?: (progress: number, frame: number) => void;
}

export const ScrollImageSequence: React.FC<ScrollImageSequenceProps> = ({
  sectionRef,
  pinnedRef,
  scrollDistance,
  onProgressUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const dimsRef = useRef({ w: 0, h: 0, dpr: 1 });

  // Render a specific frame on the canvas with object-contain aspect ratio
  const renderFrame = (index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img || !img.complete) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { w, h } = dimsRef.current;
    ctx.clearRect(0, 0, w, h);

    const imageRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = w / h;
    let drawWidth = w;
    let drawHeight = h;
    let drawX = 0;
    let drawY = 0;

    if (canvasRatio > imageRatio) {
      drawWidth = h * imageRatio;
      drawX = (w - drawWidth) / 2;
    } else {
      drawHeight = w / imageRatio;
      drawY = (h - drawHeight) / 2;
    }

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    currentFrameRef.current = index;
  };

  // Update canvas sizing dynamically using bounding client rect of parent element
  const updateCanvasSize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height || 500;
    const dpr = window.devicePixelRatio || 1;

    dimsRef.current = { w, h, dpr };
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }

    renderFrame(currentFrameRef.current);
  };

  useLayoutEffect(() => {
    if (TOTAL_FRAMES === 0) return;

    // Size canvas immediately on mounting
    updateCanvasSize();

    // Preload images; render frame 0 as soon as it's cached
    FRAME_URLS.forEach((url, i) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        imagesRef.current[i] = img;
        if (i === 0) renderFrame(0);
      };
    });

    const handleResize = () => {
      updateCanvasSize();
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Create single master ScrollTrigger for pinning, scroll progress and scrubbing
    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: `+=${scrollDistance}`,
        pin: pinnedRef.current,
        pinSpacing: true,
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress;

          // Map progress 0.0 -> 0.95 to frame 0 -> 115
          // Hold frame 115 for the remaining 0.95 -> 1.0 progress
          let frame = 0;
          if (progress < 0.95) {
            frame = Math.round((progress / 0.95) * (TOTAL_FRAMES - 1));
          } else {
            frame = TOTAL_FRAMES - 1;
          }

          // Render only when frame has changed and frame image is available
          if (imagesRef.current[frame]) {
            renderFrame(frame);
          }

          // Callback for debugging and copying progress updates
          if (onProgressUpdate) {
            onProgressUpdate(progress, frame);
          }
        },
        onRefresh: () => {
          updateCanvasSize();
        },
      });

      return () => {
        st.kill();
      };
    });

    return () => {
      ctx.revert();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [sectionRef, pinnedRef, scrollDistance]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
        backgroundColor: 'transparent',
      }}
    />
  );
};
