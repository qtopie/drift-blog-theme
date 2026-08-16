// Table of Contents interactions: smooth scroll and active state
(function () {
  function onReady(cb) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', cb);
    } else {
      cb();
    }
  }

  onReady(function () {
    const mainToc = document.querySelector('#TableOfContents');
    if (!mainToc) return;

    // Smooth scroll for TOC links
    const handleTocClick = (e, opts = { closeDrawer: false }) => {
      const a = e.target.closest('a');
      if (!a) return;
      const id = a.getAttribute('href')?.replace('#', '');
      const target = id ? document.getElementById(id) : null;
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', `#${id}`);
        
        // Highlight feedback
        target.classList.remove('target-highlight');
        void target.offsetWidth; // trigger reflow
        target.classList.add('target-highlight');
        setTimeout(() => target.classList.remove('target-highlight'), 1500);

        if (opts.closeDrawer) closeMobileDrawer();
      }
    };

    mainToc.addEventListener('click', (e) => handleTocClick(e));

    // Build heading numbers for body h2–h5 (skip h1) and apply to TOC links only
    const headings = Array.from(document.querySelectorAll('article h2, article h3, article h4, article h5'))
      .filter((h) => !h.closest('.metadata'));

    // Conditional Display: Hide TOC if article is too short (<=3 headings AND <1000 chars)
    const articleBody = document.querySelector('article');
    const wordCount = articleBody ? articleBody.textContent.trim().length : 0;
    
    if (headings.length <= 3 && wordCount < 1000) {
      // Hide Desktop Sidebar TOC
      const sidebarToc = document.querySelector('.sidebar .toc');
      if (sidebarToc) sidebarToc.style.display = 'none';
      
      // Hide Mobile TOC Trigger (ensure it stays hidden)
      const mobileTrigger = document.querySelector('.mobile-toc-trigger');
      if (mobileTrigger) {
        mobileTrigger.style.setProperty('display', 'none', 'important');
      }
      // If hidden, no need to run other logic, but let's just return to stop execution
      return; 
    }

    // Clone TOC into mobile container if present
    const mobileList = document.querySelector('.mobile-toc-list');
    if (mobileList && mobileList.childElementCount === 0) {
      mobileList.innerHTML = mainToc.innerHTML;
    }

    // --- TOC 三级目录（H3）默认折叠 ---
    // 给含子级（H3）的 H2 项注入展开按钮并默认折叠；点击按钮切换展开/收起。
    // 渐进增强：JS 禁用时保持 Hugo 输出的完整目录。
    const setupCollapse = (tocRoot) => {
      if (!tocRoot) return;

      tocRoot.querySelectorAll(':scope > ul > li').forEach((li) => {
        const sub = li.querySelector(':scope > ul');
        const link = li.querySelector(':scope > a');
        if (!link) return;

        // 无子目录的项：插入圆圈占位，与带折叠箭头的兄弟项标题起始位置对齐
        if (!sub) {
          if (!li.classList.contains('toc-leaf')) {
            li.classList.add('toc-leaf');
            const marker = document.createElement('span');
            marker.className = 'toc-marker';
            marker.setAttribute('aria-hidden', 'true');
            marker.textContent = '\u25CB'; // ○
            li.insertBefore(marker, link);
          }
          return;
        }

        if (li.querySelector(':scope > .toc-toggle')) return;

        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'toc-toggle';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', '展开子目录');
        toggle.textContent = '\u25B8'; // ▸

        li.classList.add('toc-has-children', 'toc-collapsed');
        sub.hidden = true;
        li.insertBefore(toggle, link);
      });

      tocRoot.addEventListener('click', (e) => {
        const toggle = e.target.closest('.toc-toggle');
        if (!toggle || !tocRoot.contains(toggle)) return;
        e.preventDefault();
        const li = toggle.closest('li');
        const sub = li.querySelector(':scope > ul');
        const collapsed = li.classList.toggle('toc-collapsed');
        if (sub) sub.hidden = collapsed;
        toggle.setAttribute('aria-expanded', String(!collapsed));
      });
    };
    setupCollapse(mainToc);
    setupCollapse(mobileList);

    // Build a map id -> anchors (both desktop and mobile)
    const linkMap = new Map();
    const collectLinks = (root) => {
      root?.querySelectorAll('a[href^="#"]').forEach((a) => {
        const id = a.getAttribute('href').slice(1);
        const arr = linkMap.get(id) || [];
        arr.push(a);
        linkMap.set(id, arr);
      });
    };
    collectLinks(mainToc);
    if (mobileList) collectLinks(mobileList);

    // Ensure headings have ids before mapping
    headings.forEach((h) => {
      if (!h.id) {
        h.id = h.textContent.trim().toLowerCase().replace(/\s+/g, '-');
      }
    });

    const counters = [0, 0, 0, 0]; // for h2-h5

    const formatNumber = (depth) => counters.slice(0, depth + 1).join('.') + '.';

    headings.forEach((h) => {
      const level = Number(h.tagName[1]);
      if (!level || level < 2 || level > 5) return;

      const depth = level - 2; // h2 -> 0
      counters[depth] += 1;
      for (let i = depth + 1; i < counters.length; i++) counters[i] = 0;

      const number = formatNumber(depth);
      const links = h.id ? linkMap.get(h.id) : null;
      if (links) {
        links.forEach((lnk) => {
          if (!lnk.dataset.numbered) {
            const text = lnk.textContent.trim();
            lnk.textContent = `${number} ${text}`;
            lnk.dataset.numbered = 'true';
          }
        });
      }

      // Prefix visible heading text
      if (!h.dataset.numbered) {
        const label = h.textContent.trim();
        const span = document.createElement('span');
        span.className = 'heading-number';
        span.textContent = `${number} `;
        h.prepend(span);
        h.dataset.numbered = 'true';
      }
    });

    const setActive = (id) => {
      // clear all
      for (const anchors of linkMap.values()) {
        anchors.forEach((a) => a.classList.remove('is-active'));
      }
      const anchors = linkMap.get(id);
      if (anchors) {
        anchors.forEach((a) => {
          a.classList.add('is-active');
          // 自动展开激活链接的所有折叠祖先（保证激活项可见）
          let ancestor = a.closest('li') ? a.closest('li').parentElement : null;
          while (ancestor) {
            if (ancestor.classList && ancestor.classList.contains('toc-has-children')) {
              ancestor.classList.remove('toc-collapsed');
              const sub = ancestor.querySelector(':scope > ul');
              if (sub) sub.hidden = false;
              const toggle = ancestor.querySelector(':scope > .toc-toggle');
              if (toggle) toggle.setAttribute('aria-expanded', 'true');
            }
            ancestor = ancestor.parentElement;
          }
        });
      }
    };

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top);
      if (visible.length) {
        const id = visible[0].target.id;
        if (id) setActive(id);
      }
    }, {
      root: null,
      rootMargin: '-96px 0px -60% 0px',
      threshold: [0, 1e-3, 0.25],
    });

    headings.forEach((h) => {
      if (!h.id) {
        h.id = h.textContent.trim().toLowerCase().replace(/\s+/g, '-');
      }
      observer.observe(h);
    });

    if (location.hash) {
      const target = document.getElementById(location.hash.slice(1));
      if (target) {
        setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
      }
    }

    // --- Mobile drawer interactions ---
    const drawer = document.getElementById('mobile-toc');
    const overlay = document.querySelector('.mobile-toc-overlay');
    const trigger = document.querySelector('.mobile-toc-trigger');
    const closeBtn = document.querySelector('.mobile-toc-close');
    const mobileBody = document.querySelector('.mobile-toc-body');

    function openMobileDrawer() {
      if (!drawer) return;
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      trigger?.setAttribute('aria-expanded', 'true');
      if (overlay) {
        overlay.hidden = false;
        overlay.style.display = 'block';
      }
      document.body.style.overflow = 'hidden';
    }

    function closeMobileDrawer() {
      if (!drawer) return;
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      trigger?.setAttribute('aria-expanded', 'false');
      if (overlay) {
        overlay.hidden = true;
        overlay.style.display = 'none';
      }
      document.body.style.overflow = '';
    }

    trigger?.addEventListener('click', () => openMobileDrawer());
    overlay?.addEventListener('click', () => closeMobileDrawer());
    closeBtn?.addEventListener('click', () => closeMobileDrawer());

    // Delegate clicks in mobile list to smooth-scroll and close drawer
    if (mobileBody) {
      mobileBody.addEventListener('click', (e) => handleTocClick(e, { closeDrawer: true }));
    }
  });
})();
