(function () {
  // 查找已渲染的 Markdown 代码块：<code class="language-guitar" data-lang="guitar">...</code>
  var guitarCodes = Array.from(document.querySelectorAll('pre > code.language-guitar, code.language-guitar'));
  if (guitarCodes.length === 0) return;

  // 显式渲染：在每个代码块后插入容器，并调用 jtab.render($(container), phrase)
  guitarCodes.forEach(function (codeEl, idx) {
    var notation = (codeEl.textContent || '').trim();
    if (!notation) return;
    var container = document.createElement('div');
    container.className = 'jtab';
    container.id = 'jtab-container-' + idx;
    var parent = codeEl.parentElement;
    var anchor = parent && parent.tagName.toLowerCase() === 'pre' ? parent : codeEl;
    anchor.insertAdjacentElement('afterend', container);
    // 保留原始代码块或可选择隐藏
    (anchor.style.display = 'none') // 如需隐藏原始代码，可取消注释

    if (window.jtab && typeof window.jtab.render === 'function' && window.jQuery) {
      window.jtab.render(window.jQuery(container), notation);
    }
  });
})();