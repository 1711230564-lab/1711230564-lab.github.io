/* 许号 XuHao · Portfolio 2026 */
(function () {
  'use strict';

  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var fine   = !!(window.matchMedia && window.matchMedia('(pointer: fine)').matches);

  /* ---------- 标题逐字浮现 ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.split'), function (el) {
    if (el.getAttribute('data-split')) return;
    el.setAttribute('data-split', '1');
    var chars = Array.prototype.slice.call(el.textContent);
    el.textContent = '';
    chars.forEach(function (c, i) {
      var wrap  = document.createElement('span');
      var inner = document.createElement('i');
      wrap.className = 'ch';
      inner.textContent = c === ' ' ? '\u00a0' : c;
      inner.style.transitionDelay = (i * 60) + 'ms';
      wrap.appendChild(inner);
      el.appendChild(wrap);
    });
  });

  /* ---------- 作品页面数据 ---------- */
  var PROJECTS = {
    phototaxis: { title: '趋·镜 PHOTOTAXIS', pages: [3, 4, 5, 6, 7, 8, 9, 10] },
    aigc:       { title: 'AIGC 视觉探索',      pages: [11] },
    website:    { title: '个人作品集网站',      pages: [12, 13] },
    mengzao:    { title: '猛造 MENG ZAO',      pages: [14, 15, 16, 17, 18] }
  };

  function pageSrc(n) {
    return 'assets/page-' + (n < 10 ? '0' + n : String(n)) + '.png';
  }

  /* ---------- 导航：滚动状态 ---------- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 导航：当前区块高亮 ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 滚动进入动画 ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal, .split'));

  function show(el) {
    el.classList.add('in');
    if (io) io.unobserve(el);
  }

  var io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) show(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });

    /* 兜底：无论动画是否触发，首屏内容必须可见 */
    function sweep() {
      reveals.forEach(function (el) {
        if (el.classList.contains('in')) return;
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) show(el);
      });
    }
    window.addEventListener('load', function () {
      sweep();
      setTimeout(sweep, 500);
    });
    setTimeout(sweep, 1200);
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- 页面查看器 ---------- */
  var lb      = document.getElementById('lightbox');
  var lbImg   = document.getElementById('lb-img');
  var lbTitle = document.getElementById('lb-title');
  var lbCount = document.getElementById('lb-count');
  var lbThumbs= document.getElementById('lb-thumbs');
  var lbPrev  = document.getElementById('lb-prev');
  var lbNext  = document.getElementById('lb-next');
  var lbClose = document.getElementById('lb-close');

  var current = { title: '', pages: [], i: 0 };

  function render() {
    var n = current.pages[current.i];
    lbImg.src = pageSrc(n);
    lbImg.alt = current.title + ' 第 ' + (current.i + 1) + ' 页';
    lbCount.textContent = String(current.i + 1).padStart(2, '0') + ' / ' +
                          String(current.pages.length).padStart(2, '0');
    lbPrev.disabled = current.i === 0;
    lbNext.disabled = current.i === current.pages.length - 1;
    Array.prototype.forEach.call(lbThumbs.children, function (btn, idx) {
      btn.classList.toggle('on', idx === current.i);
    });
    if (lbBarFill) {
      lbBarFill.style.width = ((current.i + 1) / current.pages.length * 100) + '%';
    }
    if (lbFrame) {
      lbFrame.classList.remove('swap');
      void lbFrame.offsetWidth;
      lbFrame.classList.add('swap');
    }
  }

  function open(key) {
    var p = PROJECTS[key];
    if (!p) return;
    current = { title: p.title, pages: p.pages, i: 0 };

    lbTitle.textContent = p.title;
    lbThumbs.innerHTML = '';
    p.pages.forEach(function (n, idx) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', '第 ' + (idx + 1) + ' 页');
      var im = document.createElement('img');
      im.src = pageSrc(n);
      im.alt = '';
      b.appendChild(im);
      b.addEventListener('click', function () { current.i = idx; render(); });
      lbThumbs.appendChild(b);
    });

    render();
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('locked');
  }

  function close() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('locked');
    lbImg.src = '';
  }

  function go(step) {
    var n = current.i + step;
    if (n < 0 || n >= current.pages.length) return;
    current.i = n;
    render();
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-project]'), function (el) {
    el.addEventListener('click', function () { open(el.getAttribute('data-project')); });
  });

  lbPrev.addEventListener('click', function () { go(-1); });
  lbNext.addEventListener('click', function () { go(1); });
  lbClose.addEventListener('click', close);
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });

  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'ArrowRight') go(1);
  });

  /* ---------- 触屏左右滑动 ---------- */
  var startX = null;
  var stage = document.getElementById('lb-stage');
  stage.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX;
  }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    startX = null;
  }, { passive: true });

  /* ---------- 查看器：进度与转场元素 ---------- */
  var lbFrame   = document.querySelector('.lb-frame');
  var lbBarFill = document.getElementById('lb-bar-fill');

  /* ---------- 阅读进度条 ---------- */
  var barFill = document.getElementById('progress-bar');
  function updateProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? window.scrollY / max : 0;
    if (barFill) barFill.style.transform = 'scaleX(' + Math.min(1, Math.max(0, p)) + ')';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  /* ---------- 自定义光标 ---------- */
  var cursorEl = document.getElementById('cursor');
  if (cursorEl && fine && !reduce) {
    document.body.classList.add('has-cursor');
    var cDot   = cursorEl.querySelector('.cursor-dot');
    var cRing  = cursorEl.querySelector('.cursor-ring');
    var cLabel = cursorEl.querySelector('.cursor-label');

    var tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    var fx = tx, fy = ty, lx = tx, ly = ty;
    var moved = false, lastLabel = null;

    function put(el, x, y) {
      el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) translate(-50%,-50%)';
    }

    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!moved) { moved = true; fx = lx = tx; fy = ly = ty; }
      var hit = e.target && e.target.closest ? e.target.closest('[data-cursor],a,button') : null;
      var want = hit ? (hit.getAttribute('data-cursor') || '') : '';
      if (want !== lastLabel) {
        lastLabel = want;
        cLabel.textContent = want;
        cursorEl.classList.toggle('with-label', !!want);
      }
      cursorEl.classList.toggle('on-link', !!hit);
    }, { passive: true });

    (function cursorLoop() {
      fx += (tx - fx) * 0.22;
      fy += (ty - fy) * 0.22;
      lx += (tx - lx) * 0.10;
      ly += (ty - ly) * 0.10;
      put(cDot, fx, fy);
      put(cRing, lx, ly);
      put(cLabel, lx, ly);
      requestAnimationFrame(cursorLoop);
    })();
  }

  /* ---------- 首屏鼠标视差 ---------- */
  var heroEl   = document.querySelector('.hero');
  var heroImg  = document.getElementById('hero-img');
  var heroGlow = document.getElementById('hero-glow');

  if (heroEl && heroImg && fine && !reduce) {
    var hT = { x: 0, y: 0 }, hN = { x: 0, y: 0 };
    heroEl.addEventListener('mousemove', function (e) {
      var r = heroEl.getBoundingClientRect();
      hT.x = (e.clientX - r.left) / r.width - .5;
      hT.y = (e.clientY - r.top) / r.height - .5;
      if (heroGlow) {
        heroGlow.style.setProperty('--gx', (e.clientX - r.left) + 'px');
        heroGlow.style.setProperty('--gy', (e.clientY - r.top) + 'px');
      }
    }, { passive: true });

    (function parallaxLoop() {
      hN.x += (hT.x - hN.x) * .05;
      hN.y += (hT.y - hN.y) * .05;
      heroImg.style.transform =
        'scale(1.1) translate3d(' + (hN.x * -26) + 'px,' + (hN.y * -20) + 'px,0)';
      requestAnimationFrame(parallaxLoop);
    })();
  }

  /* ---------- 首屏粒子：趋光 ---------- */
  var canvas = document.getElementById('hero-canvas');
  if (canvas && heroEl && !reduce) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, parts = [];
    var mx = -9999, my = -9999;

    function sizeCanvas() {
      var r = heroEl.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width  = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round(Math.min(120, Math.max(36, W / 15)));
      parts = [];
      for (var i = 0; i < count; i++) {
        parts.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - .5) * .25,
          vy: (Math.random() - .5) * .25,
          r: Math.random() * 1.8 + .45,
          a: Math.random() * .5 + .14,
          ph: Math.random() * Math.PI * 2
        });
      }
    }
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);

    heroEl.addEventListener('mousemove', function (e) {
      var r = heroEl.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    }, { passive: true });
    heroEl.addEventListener('mouseleave', function () { mx = -9999; my = -9999; });

    var t0 = 0;
    (function particles(ts) {
      if (!t0) t0 = ts || 1;
      var time = ((ts || t0) - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        var dx = mx - p.x, dy = my - p.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 52000) {
          var d = Math.sqrt(d2) || 1;
          var f = (1 - d / 228) * .055;
          p.vx += dx / d * f;
          p.vy += dy / d * f;
        }
        p.vx *= .986; p.vy *= .986;
        p.x += p.vx + Math.sin(time * .6 + p.ph) * .07;
        p.y += p.vy + Math.cos(time * .5 + p.ph) * .07;
        if (p.x < -24) p.x = W + 24;
        if (p.x > W + 24) p.x = -24;
        if (p.y < -24) p.y = H + 24;
        if (p.y > H + 24) p.y = -24;
        var tw = .75 + Math.sin(time * 1.4 + p.ph) * .25;
        ctx.beginPath();
        ctx.fillStyle = 'rgba(236,203,133,' + (p.a * tw) + ')';
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(particles);
    })(0);
  }

  /* ---------- 跑马灯 ---------- */
  var track = document.getElementById('marquee');
  if (track && !reduce) {
    track.innerHTML += track.innerHTML;
    var mw = 0, mx2 = 0, boost = 0, lastY = window.scrollY;
    function measureTrack() { mw = track.scrollWidth / 2; }
    measureTrack();
    setTimeout(measureTrack, 800);
    window.addEventListener('resize', measureTrack);
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      boost += (y - lastY) * .55;
      lastY = y;
      if (boost > 34) boost = 34;
      if (boost < -34) boost = -34;
    }, { passive: true });

    (function marqueeLoop() {
      boost *= .93;
      mx2 -= (.45 + boost);
      if (mw > 0) {
        while (mx2 <= -mw) mx2 += mw;
        while (mx2 > 0) mx2 -= mw;
      }
      track.style.transform = 'translate3d(' + mx2 + 'px,0,0)';
      requestAnimationFrame(marqueeLoop);
    })();
  }

  /* ---------- 作品卡片：倾斜与光斑 ---------- */
  if (fine && !reduce) {
    Array.prototype.forEach.call(document.querySelectorAll('.page-card'), function (card) {
      var glow = card.querySelector('.card-glow');
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var u = (e.clientX - r.left) / r.width;
        var v = (e.clientY - r.top) / r.height;
        card.style.setProperty('--rx', ((u - .5) * -6).toFixed(2) + 'deg');
        card.style.setProperty('--ry', ((v - .5) * 6).toFixed(2) + 'deg');
        if (glow) {
          glow.style.setProperty('--gx', (u * 100).toFixed(1) + '%');
          glow.style.setProperty('--gy', (v * 100).toFixed(1) + '%');
        }
      }, { passive: true });
      card.addEventListener('mouseleave', function () {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }
})();
