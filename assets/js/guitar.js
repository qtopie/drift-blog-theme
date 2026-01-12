(function () {
  function whenReady(checkFn, cb, opts) {
    opts = opts || {};
    var interval = opts.interval || 50;
    var timeout = opts.timeout || 5000;
    var start = Date.now();
    (function poll() {
      try {
        if (checkFn()) return cb();
      } catch (e) { /* ignore */ }
      if (Date.now() - start > timeout) {
        console.warn('[jtab] whenReady timeout');
        return;
      }
      setTimeout(poll, interval);
    })();
  }

  function libsReady() {
    return (typeof window.jQuery !== 'undefined') &&
           (typeof window.Raphael !== 'undefined') &&
           (typeof window.jtab !== 'undefined');
  }

  function runRenderer() {
    var guitarCodes = Array.from(document.querySelectorAll('pre > code.language-guitar, code.language-guitar'));
    if (guitarCodes.length === 0) return;

    guitarCodes.forEach(function (codeEl, idx) {
      // normalize text: keep newlines, support <br>
      var raw = (codeEl.textContent || '')
        .replace(/\r\n?/g, '\n')
        .replace(/<br\s*\/?>/gi, '\n');

      var parent = codeEl.parentElement;
      var anchor = parent && parent.tagName.toLowerCase() === 'pre' ? parent : codeEl;
      anchor.style.display = 'none';

      // segment by explicit stave...end; blocks, fallback to blank lines
      var segments = [];
      var matches = raw.match(/stave[\s\S]*?end\s*;?/gi);
      if (matches && matches.length) {
        segments = matches;
      } else {
        segments = raw.split(/\n\s*\n+/).filter(function (s) { return s.trim().length > 0; });
      }

      var insertionPoint = anchor;

      segments.forEach(function (segment, segIdx) {
        var container = document.createElement('div');
        container.className = 'jtab';
        container.id = 'jtab-container-' + idx + '-' + segIdx;
        insertionPoint.insertAdjacentElement('afterend', container);
        insertionPoint = container;

        try {
          window.jtab.render(window.jQuery(container), segment.trim());
        } catch (err) {
          console.error('[jtab] render error at idx', idx, 'segment', segIdx, err);
        }
      });
    });
  }

  // Ensure DOM parsed before trying to find code blocks
  function onDomReady(cb) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', cb);
    } else {
      cb();
    }
  }

  onDomReady(function () {
    // Wait for libraries to be available, then run renderer.
    whenReady(libsReady, runRenderer, { interval: 50, timeout: 5000 });
  });
})();