/* Надежда Боярскова — скрипты сайта */
(function () {
  'use strict';
  var html = document.documentElement;
  var body = document.body;

  /* ---------- 1. Определение устройства ----------
     Вёрстка перестраивается CSS-брейкпоинтами по ширине экрана.
     Дополнительно на <html> ставятся классы, которые можно
     использовать в стилях: is-mobile / is-tablet / is-desktop и is-touch. */
  var mqMobile = window.matchMedia('(max-width: 767px)');
  var mqTablet = window.matchMedia('(min-width: 768px) and (max-width: 1099px)');
  var mqTouch = window.matchMedia('(hover: none), (pointer: coarse)');

  function setDevice() {
    var device = mqMobile.matches ? 'mobile' : mqTablet.matches ? 'tablet' : 'desktop';
    html.classList.remove('is-mobile', 'is-tablet', 'is-desktop');
    html.classList.add('is-' + device);
    html.classList.toggle('is-touch', mqTouch.matches);
    html.dataset.device = device;
  }
  setDevice();
  [mqMobile, mqTablet, mqTouch].forEach(function (mq) {
    if (mq.addEventListener) mq.addEventListener('change', setDevice);
    else if (mq.addListener) mq.addListener(setDevice);
  });

  /* ---------- 2. Модальные окна (меню и выбор мессенджера) ---------- */
  var FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  var lastFocus = null;
  var openLayer = null;

  function lockScroll(on) { body.style.overflow = on ? 'hidden' : ''; }

  function open(layer, focusSel) {
    if (!layer) return;
    if (openLayer && openLayer !== layer) close(openLayer, true);
    lastFocus = lastFocus || document.activeElement;
    layer.hidden = false;
    // даём браузеру применить hidden=false перед анимацией
    requestAnimationFrame(function () { layer.classList.add('is-open'); });
    openLayer = layer;
    lockScroll(true);
    var first = layer.querySelector(focusSel || FOCUSABLE);
    setTimeout(function () { if (first) first.focus(); }, 60);
  }

  function close(layer, keepFocus) {
    if (!layer) return;
    layer.classList.remove('is-open');
    if (openLayer === layer) openLayer = null;
    if (!openLayer) lockScroll(false);
    if (!keepFocus && lastFocus) { lastFocus.focus(); lastFocus = null; }
    setTimeout(function () { if (!layer.classList.contains('is-open')) layer.hidden = true; }, 350);
  }

  // удержание фокуса внутри открытого окна
  document.addEventListener('keydown', function (e) {
    if (!openLayer) return;
    if (e.key === 'Escape') { close(openLayer); syncBurger(); return; }
    if (e.key !== 'Tab') return;
    var items = Array.prototype.filter.call(openLayer.querySelectorAll(FOCUSABLE), function (el) {
      return el.offsetParent !== null;
    });
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  var menu = document.getElementById('mmenu');
  var contact = document.getElementById('contact');
  var burger = document.querySelector('[data-menu-open]');

  function syncBurger() {
    if (burger) burger.setAttribute('aria-expanded', menu && menu.classList.contains('is-open') ? 'true' : 'false');
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-menu-open],[data-menu-close],[data-menu-link],[data-contact-open],[data-contact-close]');
    if (!t) return;
    if (t.hasAttribute('data-menu-open')) { open(menu); }
    else if (t.hasAttribute('data-menu-close')) { close(menu); }
    else if (t.hasAttribute('data-menu-link')) { close(menu, true); lastFocus = null; }
    else if (t.hasAttribute('data-contact-open')) { e.preventDefault(); open(contact, '.contact__opt'); }
    else if (t.hasAttribute('data-contact-close')) { close(contact); }
    syncBurger();
  });

  // если меню открыто и экран расширили до десктопа — закрываем
  var mqDesk = window.matchMedia('(min-width: 1100px)');
  function onDesk() { if (mqDesk.matches && menu && menu.classList.contains('is-open')) { close(menu, true); syncBurger(); } }
  if (mqDesk.addEventListener) mqDesk.addEventListener('change', onDesk); else if (mqDesk.addListener) mqDesk.addListener(onDesk);

  /* ---------- 3. Шапка и нижняя плашка при скролле ---------- */
  var header = document.querySelector('.header');
  var mbar = document.querySelector('.mbar');
  var hero = document.querySelector('.hero');
  var footer = document.querySelector('.footer');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (mbar && hero) {
      var pastHero = y > hero.offsetTop + hero.offsetHeight - 80;
      var nearFooter = footer && (y + window.innerHeight > footer.offsetTop + 40);
      var show = pastHero && !nearFooter;
      mbar.classList.toggle('is-visible', show);
      var btn = mbar.querySelector('button');
      mbar.setAttribute('aria-hidden', show ? 'false' : 'true');
      if (btn) btn.tabIndex = show ? 0 : -1;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 4. Плавное появление блоков ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- 5. FAQ: открыт только один ответ ---------- */
  var faqs = document.querySelectorAll('.faq__item');
  faqs.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) faqs.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* ---------- 6. Текущий год в подвале ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
