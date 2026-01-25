import { useEffect } from 'react';

// React component that initializes Mermaid diagrams when mounted.
const MermaidLoader = () => {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const blocks = document.querySelectorAll('.mermaid');
    if (!blocks || blocks.length === 0) return;

    let cancelled = false;

    (async () => {
      try {
        const mod = await import('mermaid');
        if (cancelled) return;

        const mermaid = (mod && (mod.default || mod)) as any;
        const prefersDark = document.body.classList.contains('dark') || window.matchMedia('(prefers-color-scheme: dark)').matches;
        mermaid.initialize({ startOnLoad: false, theme: prefersDark ? 'dark' : 'default' });
        mermaid.init && mermaid.init(undefined, blocks as any);
      } catch (e) {
        // keep failure silent but log to console for debugging
        // eslint-disable-next-line no-console
        console.error('Failed to load mermaid', e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
};

export default MermaidLoader;
