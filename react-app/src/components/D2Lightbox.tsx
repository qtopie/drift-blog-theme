import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  makeStyles, 
  Button, 
  tokens,
  shorthands
} from '@fluentui/react-components';
import { 
  Dismiss24Regular,
  ZoomIn24Regular,
  ZoomOut24Regular,
  ArrowReset24Regular
} from '@fluentui/react-icons';

// We'll use the global panzoom if available, or just simple scaling
declare global {
  interface Window {
    panzoom?: any;
  }
}

const useStyles = makeStyles({
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...shorthands.padding('20px'),
    backdropFilter: 'blur(5px)',
  },
  content: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden', // panzoom container needs overflow hidden usually
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '90vh',
    objectFit: 'contain',
    cursor: 'grab',
    // Remove transition to avoid conflict with panzoom drag
  },
  controls: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    display: 'flex',
    gap: '8px',
    zIndex: 10001,
  },
  controlButton: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    color: tokens.colorNeutralForegroundOnBrand,
    ':hover': {
      backgroundColor: 'rgba(50, 50, 50, 0.9)',
      color: tokens.colorNeutralForegroundOnBrand,
    }
  }
});

export const D2Lightbox: React.FC = () => {
  const styles = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');
  const [panzoomInstance, setPanzoomInstance] = useState<any>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);

  const openLightbox = useCallback((src: string) => {
    setCurrentSrc(src);
    setIsOpen(true);
    // Disable body scroll
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
    setCurrentSrc('');
    document.body.style.overflow = '';
    if (panzoomInstance) {
      panzoomInstance.dispose();
      setPanzoomInstance(null);
    }
  }, [panzoomInstance]);

  // Attach click listeners to D2 diagrams
  useEffect(() => {
    const handleImageClick = (e: Event) => {
      const target = e.target as HTMLImageElement;
      if (target.closest('.d2-wrapper')) {
        e.preventDefault();
        e.stopPropagation(); // Stop d2-zoom.js or others
        openLightbox(target.src);
      }
    };

    const d2Images = document.querySelectorAll('.d2-wrapper img');
    d2Images.forEach(img => {
      img.addEventListener('click', handleImageClick);
      (img as HTMLElement).style.cursor = 'zoom-in';
    });

    return () => {
      d2Images.forEach(img => {
        img.removeEventListener('click', handleImageClick);
        (img as HTMLElement).style.cursor = '';
      });
    };
  }, [openLightbox]);

  // Initialize panzoom when lightbox opens
  useEffect(() => {
    if (isOpen && imgRef.current && window.panzoom) {
      // Small timeout to ensure image is rendered
      const timer = setTimeout(() => {
        if (imgRef.current) {
          const instance = window.panzoom(imgRef.current, {
            maxZoom: 10,
            minZoom: 0.1,
            initialZoom: 1,
            bounds: false,
            boundsPadding: 0.1,
            autocenter: true, // Attempt to center content
          });
          setPanzoomInstance(instance);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeLightbox();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeLightbox]);

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay} onClick={(e) => {
      // Close if clicking outside the image (on the overlay)
      if (e.target === e.currentTarget) {
        closeLightbox();
      }
    }}>
      <div className={styles.controls}>
        <Button 
          icon={<ZoomIn24Regular />} 
          className={styles.controlButton}
          title="Zoom In"
          onClick={() => {
            if (panzoomInstance) {
              const cx = window.innerWidth / 2;
              const cy = window.innerHeight / 2;
              panzoomInstance.smoothZoom(cx, cy, 1.25);
            }
          }}
        />
        <Button 
          icon={<ZoomOut24Regular />} 
          className={styles.controlButton}
          title="Zoom Out"
          onClick={() => {
            if (panzoomInstance) {
              const cx = window.innerWidth / 2;
              const cy = window.innerHeight / 2;
              panzoomInstance.smoothZoom(cx, cy, 0.8);
            }
          }}
        />
        <Button 
          icon={<ArrowReset24Regular />} 
          className={styles.controlButton}
          title="Reset"
          onClick={() => {
             if (panzoomInstance) {
               panzoomInstance.moveTo(0, 0);
               panzoomInstance.zoomAbs(0, 0, 1);
             }
          }}
        />
        <Button 
          icon={<Dismiss24Regular />} 
          className={styles.controlButton}
          title="Close"
          onClick={closeLightbox}
        />
      </div>
      <div className={styles.content}>
        <img 
          ref={imgRef}
          src={currentSrc} 
          alt="D2 Diagram Fullscreen" 
          className={styles.image}
          onClick={(e) => e.stopPropagation()} 
        />
      </div>
    </div>,
    document.body
  );
};

export default D2Lightbox;
