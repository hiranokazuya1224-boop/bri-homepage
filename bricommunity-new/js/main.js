(function () {
  'use strict';

  /* ---------- スマホメニュー ---------- */
  var toggle = document.querySelector('.menu-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    });
    document.querySelectorAll('.global-nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- ページトップへ ---------- */
  var toTop = document.querySelector('.to-top');
  if (toTop) {
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('is-show', window.scrollY > 500);
    }, { passive: true });
  }

  /* ---------- 写真の差し込み ----------
     data-photo="images/xxx.jpg" の写真が images フォルダにあれば背景に表示し、
     なければイラスト・色のまま表示する */
  document.querySelectorAll('[data-photo]').forEach(function (el) {
    var img = new Image();
    img.onload = function () {
      el.style.backgroundImage = 'url("' + img.src + '")';
      el.classList.add('has-photo');
    };
    img.src = el.getAttribute('data-photo');
  });

  /* ---------- メインビジュアルのスライド ---------- */
  var hero = document.querySelector('.hero');
  if (!hero) return;

  var slides = hero.querySelectorAll('.slide');
  var tabs = hero.querySelectorAll('.hero-tabs button');
  var pauseBtn = hero.querySelector('.hero-pause');
  var INTERVAL = 6000;
  var current = 0;
  var timer = null;
  var userPaused = false;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  hero.style.setProperty('--slide-time', INTERVAL / 1000 + 's');

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (s, i) {
      var active = i === current;
      s.classList.toggle('is-active', active);
      s.setAttribute('aria-hidden', active ? 'false' : 'true');
      s.tabIndex = active ? 0 : -1;
    });
    tabs.forEach(function (t, i) {
      t.setAttribute('aria-selected', i === current ? 'true' : 'false');
      // 進行バーのアニメーションを最初からやり直す
      var bar = t.querySelector('.bar i');
      if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
    });
  }

  function start() {
    stop();
    if (userPaused || reduceMotion) return;
    hero.classList.remove('is-paused');
    timer = setInterval(function () { show(current + 1); }, INTERVAL);
  }
  function stop() {
    clearInterval(timer);
    timer = null;
    hero.classList.add('is-paused');
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { show(i); start(); });
  });
  hero.querySelector('.hero-prev').addEventListener('click', function () { show(current - 1); start(); });
  hero.querySelector('.hero-next').addEventListener('click', function () { show(current + 1); start(); });

  pauseBtn.addEventListener('click', function () {
    userPaused = !userPaused;
    pauseBtn.textContent = userPaused ? '▶ 再生' : 'Ⅱ 停止';
    pauseBtn.setAttribute('aria-label', userPaused ? 'スライドを再生' : 'スライドを停止');
    userPaused ? stop() : start();
  });

  // マウスを乗せている間・キーボード操作中は止める
  var track = hero.querySelector('.hero-track');
  track.addEventListener('mouseenter', stop);
  track.addEventListener('mouseleave', start);
  hero.addEventListener('focusin', stop);
  hero.addEventListener('focusout', start);

  // スマホのスワイプ
  var startX = null, startY = null, swiped = false;
  track.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX; startY = e.touches[0].clientY; swiped = false;
  }, { passive: true });
  track.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    var dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      swiped = true;
      show(current + (dx < 0 ? 1 : -1));
      start();
    }
    startX = null;
  });
  // スワイプした直後はリンクとして反応させない
  slides.forEach(function (s) {
    s.addEventListener('click', function (e) { if (swiped) { e.preventDefault(); swiped = false; } });
  });

  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });

  show(0);
  start();
})();
