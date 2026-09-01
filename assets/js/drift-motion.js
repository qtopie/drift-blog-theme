/**
 * drift-motion.js — 竹筏漂流微交互行为层
 *
 * 职责：
 *   1. driftIn：标题/段落进入视口时的"浮出水面"动画
 *   2. Ripple：点击按钮/TOC 链接时触发水波扩散
 *   3. TOC 浮标：监听活动项位置，驱动 CSS --toc-indicator-top 平滑滑移
 *   4. 表格水雾遮罩：检测横向溢出，包裹表格并监听滚动状态
 *   5. 复制按钮：弹簧反馈动画增强
 */
(function () {
  'use strict';

  function onReady(cb) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', cb);
    } else {
      cb();
    }
  }

  onReady(function () {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ───────────────────────────────────────────
       1. driftIn — 章节标题浮出水面
       只作用于 article 内 h2/h3，不影响正文段落
       ─────────────────────────────────────────── */
    if (!prefersReduced) {
      const driftTargets = document.querySelectorAll(
        'article h2, article h3'
      );

      if (driftTargets.length > 0 && 'IntersectionObserver' in window) {
        driftTargets.forEach((el) => {
          // 跳过已在首屏的元素（top < 80vh）
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.85) return;
          el.setAttribute('data-drift', 'pending');
        });

        const driftObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.target.getAttribute('data-drift') === 'pending') {
              entry.target.setAttribute('data-drift', 'done');
              driftObserver.unobserve(entry.target);
            }
          });
        }, {
          rootMargin: '0px 0px -8% 0px',
          threshold: 0.1,
        });

        document.querySelectorAll('[data-drift="pending"]').forEach((el) => {
          driftObserver.observe(el);
        });
      }
    }

    /* ───────────────────────────────────────────
       2. Ripple — 水波点击态
       为 TOC 链接、nav 链接注入水波
       ─────────────────────────────────────────── */
    function attachRipple(selector) {
      document.querySelectorAll(selector).forEach((el) => {
        el.addEventListener('click', function (e) {
          // 设置水波原点（鼠标相对元素位置）
          const rect = el.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%';
          const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + '%';
          el.style.setProperty('--ripple-x', x);
          el.style.setProperty('--ripple-y', y);

          el.classList.remove('rippling');
          // force reflow
          void el.offsetWidth;
          el.classList.add('rippling');

          // 动画结束后清理
          const done = () => {
            el.classList.remove('rippling');
            el.removeEventListener('animationend', done);
          };
          el.addEventListener('animationend', done, { once: true });
        });
      });
    }

    attachRipple('#TableOfContents a');
    attachRipple('.mobile-toc-body a');
    attachRipple('.nav-links a');

    // 为移动端 TOC 触发按钮和 scrollToTop 加 drift-ripple class
    document.querySelectorAll('.mobile-toc-trigger, .scrollToTop').forEach((btn) => {
      btn.classList.add('drift-ripple');
      btn.addEventListener('click', function (e) {
        btn.classList.remove('rippling');
        void btn.offsetWidth;
        btn.classList.add('rippling');
        const done = () => btn.classList.remove('rippling');
        btn.addEventListener('animationend', done, { once: true });
      });
    });


    /* ───────────────────────────────────────────
       3. TOC 浮标平滑滑移
       读取桌面端 active 链接的 offsetTop，驱动 CSS var
       ─────────────────────────────────────────── */
    const sidebarToc = document.querySelector('.sidebar .toc');
    if (sidebarToc) {
      const tocNav = sidebarToc.querySelector('#TableOfContents');

      function updateIndicator() {
        const activeLink = tocNav?.querySelector('a.is-active');
        if (!activeLink) {
          sidebarToc.classList.remove('has-active');
          return;
        }

        sidebarToc.classList.add('has-active');

        // offsetTop 相对于 .sidebar .toc 容器
        const tocRect = sidebarToc.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        const top = linkRect.top - tocRect.top + sidebarToc.scrollTop;

        sidebarToc.style.setProperty('--toc-indicator-top', `${Math.max(0, top)}px`);
      }

      // 监听 is-active 变化（MutationObserver）
      if (tocNav && 'MutationObserver' in window) {
        const tocMutObs = new MutationObserver(updateIndicator);
        tocMutObs.observe(tocNav, {
          subtree: true,
          attributes: true,
          attributeFilter: ['class'],
        });
      }
    }


    /* ───────────────────────────────────────────
       4. 表格横向惯性滚动 + 水雾遮罩
       ─────────────────────────────────────────── */
    const articleTables = document.querySelectorAll('article table');

    articleTables.forEach((table) => {
      // 检查是否溢出父容器
      const parent = table.parentElement;
      if (!parent) return;

      // 创建包裹层
      const wrap = document.createElement('div');
      wrap.className = 'drift-table-wrap';
      const scroller = document.createElement('div');
      scroller.className = 'drift-table-scroll';

      parent.insertBefore(wrap, table);
      wrap.appendChild(scroller);
      scroller.appendChild(table);

      // 检测溢出状态并切换遮罩
      function checkOverflow() {
        const isOverflowing = scroller.scrollWidth > scroller.clientWidth + 2;
        const atStart = scroller.scrollLeft < 4;
        const atEnd = scroller.scrollLeft >= scroller.scrollWidth - scroller.clientWidth - 4;

        wrap.classList.toggle('can-scroll', isOverflowing);
        wrap.classList.toggle('at-start', atStart);
        wrap.classList.toggle('at-end', atEnd);
        wrap.classList.toggle('scrolling-mid', isOverflowing && !atStart);
      }

      checkOverflow();
      scroller.addEventListener('scroll', checkOverflow, { passive: true });

      // 响应窗口尺寸变化
      if ('ResizeObserver' in window) {
        new ResizeObserver(checkOverflow).observe(scroller);
      }
    });


    /* ───────────────────────────────────────────
       5. 复制按钮弹簧反馈增强
       ─────────────────────────────────────────── */
    // 等待 copy-code.js 创建按钮后再附加（用事件委托）
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('.copy-code-button');
      if (!btn) return;

      // 2s 后检查文字变成 Copied! 则触发动画
      setTimeout(() => {
        if (btn.innerText === 'Copied!' || btn.innerText === '✓') {
          btn.classList.add('copy-success');
          btn.addEventListener('animationend', () => btn.classList.remove('copy-success'), { once: true });
        }
      }, 50);
    });


    /* ───────────────────────────────────────────
       6. 移动端 TOC 抽屉：开合时带轻量弹簧
       （drawer 已有 transform 过渡，这里仅确保
         触发按钮在 open 态停止 idle 漂浮动画）
       ─────────────────────────────────────────── */
    const tocTrigger = document.querySelector('.mobile-toc-trigger');
    const mobileTocDrawer = document.getElementById('mobile-toc');

    if (tocTrigger && mobileTocDrawer) {
      const drawerObs = new MutationObserver(() => {
        const isOpen = mobileTocDrawer.classList.contains('open');
        // open 时停止浮力 idle 动画
        tocTrigger.style.animationPlayState = isOpen ? 'paused' : 'running';
      });
      drawerObs.observe(mobileTocDrawer, { attributes: true, attributeFilter: ['class'] });
    }

  });
})();
