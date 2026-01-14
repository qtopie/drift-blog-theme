(function () {
  function onReady(cb) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', cb);
    } else {
      cb();
    }
  }

  onReady(function () {
    document.querySelectorAll('pre').forEach((codeBlock) => {
      // Avoid adding button twice
      if (codeBlock.querySelector('.copy-code-button')) return;

      // Ensure position relative so absolute button is positioned correctly
      codeBlock.style.position = 'relative';

      const button = document.createElement('button');
      button.className = 'copy-code-button';
      button.type = 'button';
      button.innerText = 'Copy';

      button.addEventListener('click', () => {
        // Hugo often wraps code in <code>. If not, fallback to textContent
        const codeElement = codeBlock.querySelector('code');
        const codeText = codeElement ? codeElement.innerText : codeBlock.innerText;

        navigator.clipboard.writeText(codeText).then(() => {
          button.innerText = 'Copied!';
          setTimeout(() => {
            button.innerText = 'Copy';
          }, 2000);
        }).catch((err) => {
          console.error('Failed to copy: ', err);
          button.innerText = 'Error';
        });
      });

      codeBlock.appendChild(button);
    });
  });
})();
