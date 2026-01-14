(function () {
  const renderMath = () => {
    // Retry if katex is not loaded yet (up to 3 seconds)
    if (typeof katex === 'undefined') {
      let retries = 0;
      const interval = setInterval(() => {
        if (typeof katex !== 'undefined') {
          clearInterval(interval);
          renderMath();
        } else if (retries > 30) {
           clearInterval(interval);
           console.warn('KaTeX failed to load after 3s.');
        }
        retries++;
      }, 100);
      return;
    }

    // Select code blocks with language-latex, language-math, or language-tex
    const blocks = document.querySelectorAll('pre code.language-latex, pre code.language-math, pre code.language-tex');
    
    blocks.forEach((block) => {
      const tex = block.textContent;
      const pre = block.closest('pre');
      // If pre is inside a highlighting container (Hugo usually wraps in div.highlight), use that
      const container = pre.closest('.highlight') || pre;

      const div = document.createElement('div');
      div.className = 'katex-display-block';
      div.style.overflowX = "auto";
      div.style.overflowY = "hidden";
      div.style.margin = "1em 0";
      div.style.textAlign = "center"; // Typically centered

      try {
        katex.render(tex, div, {
          displayMode: true,
          throwOnError: false,
          output: 'html'
        });

        // Replace the entire container
        container.replaceWith(div);
      } catch (e) {
        console.error('KaTeX rendering error:', e);
      }
    });
  };
    
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderMath);
  } else {
    renderMath();
  }
})();
