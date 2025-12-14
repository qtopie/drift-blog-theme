(function () {
  // 查找已渲染的 Markdown 代码块：<code class="language-guitar" data-lang="guitar">...</code>
  var guitarCodes = Array.from(document.querySelectorAll('pre > code.language-guitar, code.language-guitar'));
  if (guitarCodes.length === 0) return;

  // 显式渲染：在每个代码块后插入容器，并调用 jtab.render($(container), phrase)
  guitarCodes.forEach(function (codeEl, idx) {
    var raw = codeEl.textContent || '';
    var normalized = raw
      .replace(/\r\n/g, '\n')        // 统一行尾
      .replace(/<br\s*\/?>/gi, '\n') // 将 <br> 转换为换行
      .replace(/[ \t]+$/gm, '');       // 去掉每行尾部多余空格
    if (!normalized.trim()) return;

    // 根据 jTab 语法，将内容按 "stave ... end" 片段进行拆分
    // 每个片段代表一段独立的乐谱，逐段渲染以达到换行效果。
    var segments = [];
    var regex = /stave[\s\S]*?end\s*;?/gi; // 最小匹配直到 end（可选分号）
    var match;
    while ((match = regex.exec(normalized)) !== null) {
      var seg = (match[0] || '').trim();
      if (seg) segments.push(seg);
    }
    // 如果没有明确的 stave/end 结构，则退化为按空行拆分
    if (segments.length === 0) {
      segments = normalized.split(/\n\s*\n+/).map(function (s) { return s.trim(); }).filter(Boolean);
    }

    var parent = codeEl.parentElement;
    var anchor = parent && parent.tagName.toLowerCase() === 'pre' ? parent : codeEl;
    // 隐藏原始代码块
    anchor.style.display = 'none';

    // 为每个片段创建并渲染一个 jtab 容器，保持顺序
    var insertionPoint = anchor;
    segments.forEach(function (notation, sIdx) {
      var container = document.createElement('div');
      container.className = 'jtab';
      container.id = 'jtab-container-' + idx + '-' + sIdx;
      insertionPoint.insertAdjacentElement('afterend', container);
      insertionPoint = container;

      if (window.jtab && typeof window.jtab.render === 'function' && window.jQuery) {
        window.jtab.render(window.jQuery(container), notation);
      }
    });
  });
})();