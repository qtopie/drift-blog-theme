document.addEventListener("DOMContentLoaded", () => {
  if (typeof panzoom === 'undefined') {
    // If loaded as module or async, it might not be ready. But we used defer.
    // Check if it's available as window.panzoom
    if (window.panzoom) {
      initPanzoom();
    } else {
       // Wait for it? Or just assume it will load.
       // The script tag for panzoom is before this one in head/js.html so it should be fine.
       console.warn('panzoom library not loaded');
    }
  } else {
    initPanzoom();
  }
});

function initPanzoom() {
  document.querySelectorAll('.d2-container').forEach(container => {
    const wrapper = container.querySelector('.d2-wrapper');
    if (!wrapper) return;

    const img = wrapper.querySelector('img');
    if (!img) return;

    // Initialize panzoom
    const instance = panzoom(img, {
      maxZoom: 5,
      minZoom: 0.1,
      initialZoom: 1,
      bounds: false,
      boundsPadding: 0.1
    });

    // Helper to get center of wrapper for zooming
    const getCenter = () => {
       const rect = wrapper.getBoundingClientRect();
       // Return center relative to the transformed element?
       // panzoom smoothZoom expects (x, y, scale) where x,y are client coordinates usually?
       // No, panzoom documentation says x, y are coordinates of the point that should remain stationary.
       // If we want to zoom to center of container...
       // Actually smoothZoom(x, y, zoomFactor) zooms into point (x,y).
       // To zoom in center of container:
       return {
         x: rect.left + rect.width / 2,
         y: rect.top + rect.height / 2
       };
    };

    // Controls
    const btnIn = container.querySelector('.d2-btn-zoom-in');
    const btnOut = container.querySelector('.d2-btn-zoom-out');
    const btnReset = container.querySelector('.d2-btn-reset');

    if (btnIn) {
      btnIn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const center = getCenter();
        instance.smoothZoom(center.x, center.y, 1.25);
      });
    }

    if (btnOut) {
      btnOut.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const center = getCenter();
        instance.smoothZoom(center.x, center.y, 0.8);
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        instance.moveTo(0, 0);
        instance.zoomAbs(0, 0, 1);
      });
    }
  });
}
