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
  ArrowReset24Regular,
  FullScreenMaximize24Regular,
  FullScreenMinimize24Regular
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);

  const openLightbox = useCallback((src: string) => {
    setCurrentSrc(src);
    setIsImageLoaded(false);
    setIsOpen(true);
    // Disable body scroll
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsOpen(false);
    setCurrentSrc('');
    document.body.style.overflow = '';
    if (panzoomInstance) {
      panzoomInstance.dispose();
      setPanzoomInstance(null);
    }
  }, [panzoomInstance]);

  const toggleFullscreen = useCallback(() => {
    if (!overlayRef.current) return;

    if (!document.fullscreenElement) {
      overlayRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // Sync fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Attach click listeners to D2 diagrams and buttons
  useEffect(() => {
    const handleImageClick = (e: Event) => {
      const target = e.target as HTMLElement;
      // Handle click on the image
      if (target.tagName === 'IMG' && target.closest('.d2-img-container')) {
        e.preventDefault();
        e.stopPropagation(); 
        openLightbox((target as HTMLImageElement).src);
      }
      // Handle click on the fullscreen button
      if (target.closest('.d2-btn-fullscreen')) {
        e.preventDefault();
        e.stopPropagation();
        const wrapper = target.closest('.d2-container');
        const img = wrapper?.querySelector('.d2-img-container img') as HTMLImageElement;
        if (img) {
          openLightbox(img.src);
        }
      }
    };

    // We add listener to document to catch dynamically added elements or just simplfy logic
    // But scoped to specific elements is better.
    // Let's attach to the container level to catch button clicks too.
    const containers = document.querySelectorAll('.d2-container');
    containers.forEach(container => {
      container.addEventListener('click', handleImageClick);
      
      const img = container.querySelector('.d2-img-container img');
      if (img) (img as HTMLElement).style.cursor = 'zoom-in';
    });

    return () => {
      containers.forEach(container => {
        container.removeEventListener('click', handleImageClick);
        const img = container.querySelector('.d2-img-container img');
        if (img) (img as HTMLElement).style.cursor = '';
      });
    };
  }, [openLightbox]);

  // Initialize panzoom when lightbox opens and image is loaded
  useEffect(() => {
    if (isOpen && isImageLoaded && imgRef.current && window.panzoom) {
      const instance = window.panzoom(imgRef.current, {
        maxZoom: 10,
        minZoom: 0.1,
        initialZoom: 1,
        bounds: false,
        boundsPadding: 0.1,
        // autocenter: false - we rely on CSS flexbox for centering
      });
      setPanzoomInstance(instance);
    }
  }, [isOpen, isImageLoaded]);

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
    <div 
      ref={overlayRef}
      className={styles.overlay} 
      onClick={(e) => {
      // Close if clicking outside the image (on the overlay)
      if (e.target === e.currentTarget) {
        closeLightbox();
      }
    }}>
      <div className={styles.controls}>
        <Button 
          icon={isFullscreen ? <FullScreenMinimize24Regular /> : <FullScreenMaximize24Regular />} 
          className={styles.controlButton}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          onClick={toggleFullscreen}
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
          onLoad={() => setIsImageLoaded(true)}
        />
      </div>
    </div>,
    document.body
  );
};

export default D2Lightbox;
