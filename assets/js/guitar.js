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
      var raw = codeEl.textContent || '';
      // 若你按段拆分/转义 <br>，在此处理 raw
      var parent = codeEl.parentElement;
      var anchor = parent && parent.tagName.toLowerCase() === 'pre' ? parent : codeEl;
      // 隐藏原始代码（可选）
      anchor.style.display = 'none';

      // 如果整块直接交给 jtab 也可以：
      var container = document.createElement('div');
      container.className = 'jtab';
      container.id = 'jtab-container-' + idx;
      anchor.insertAdjacentElement('afterend', container);

      try {
        window.jtab.render(window.jQuery(container), raw);
      } catch (err) {
        console.error('[jtab] render error at idx', idx, err);
      }
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