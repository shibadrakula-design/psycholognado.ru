/* Страница политики: оглавление и год в подвале */
(function () {
  'use strict';
  var toc = document.querySelector('.toc');
  var links = Array.prototype.slice.call(document.querySelectorAll('.toc__list a'));
  var mqDesk = window.matchMedia('(min-width: 1100px)');

  // На широком экране оглавление всегда раскрыто, на узком — свёрнуто
  function syncToc() { if (toc) toc.open = mqDesk.matches; }
  syncToc();
  if (mqDesk.addEventListener) mqDesk.addEventListener('change', syncToc);
  else if (mqDesk.addListener) mqDesk.addListener(syncToc);

  // На узком экране после перехода по пункту сворачиваем оглавление
  links.forEach(function (a) {
    a.addEventListener('click', function () { if (!mqDesk.matches && toc) toc.open = false; });
  });

  // Активный пункт: aria-current + жирный шрифт и полоса (не только цвет)
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  function setActive(id) {
    links.forEach(function (a) {
      if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }
  function onScroll() {
    var offset = Math.max(160, window.innerHeight * 0.3), current = sections[0] && sections[0].id;
    sections.forEach(function (s) { if (s.getBoundingClientRect().top - offset <= 0) current = s.id; });
    if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 4 && sections.length) {
      current = sections[sections.length - 1].id;
    }
    if (current) setActive(current);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
