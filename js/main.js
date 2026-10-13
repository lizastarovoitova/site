/* Елизавета Старовойтова · лендинг
   1. Меню на телефоне
   2. Тень у шапки при прокрутке
   3. Появление блоков при прокрутке
   4. Подсветка пункта меню текущего раздела
   5. Точки под свайпом отзывов
   6. Липкая кнопка «Написать» на телефоне
   7. В вопросах открыт только один ответ */

document.documentElement.classList.add('js');

(function () {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const mobile = window.matchMedia('(max-width: 767px)');

  /* ---------- 1. Меню ---------- */
  const burger = $('#burger');
  const nav = $('#nav');

  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    if (open) $('a', nav).focus({ preventScroll: true });
  }

  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      burger.focus();
    }
  });
  mobile.addEventListener('change', (e) => { if (!e.matches) setMenu(false); });

  /* ---------- 2. Шапка ---------- */
  const header = $('#header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (!('IntersectionObserver' in window)) {
    $$('.reveal').forEach((el) => el.classList.add('is-in'));
    return;
  }

  /* ---------- 3. Появление блоков ---------- */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      revealIO.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el) => revealIO.observe(el));

  /* ---------- 4. Активный пункт меню ---------- */
  const links = $$('.nav__list a');
  const sections = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  const navIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => navIO.observe(s));

  /* ---------- 5. Точки отзывов ---------- */
  const reviews = $('#reviews');
  const dots = $$('#dots span');
  if (reviews && dots.length) {
    const cards = $$('.review', reviews);
    const dotIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const i = cards.indexOf(entry.target);
        dots.forEach((d, j) => d.classList.toggle('is-active', i === j));
      });
    }, { root: reviews, threshold: 0.6 });
    cards.forEach((c) => dotIO.observe(c));
    dots[0].classList.add('is-active');
  }

  /* ---------- 6. Липкая кнопка ---------- */
  const sticky = $('#stickyCta');
  const heroCta = $('[data-hero-cta]');
  const final = $('#final');
  const stickyBtn = $('a', sticky);
  let heroGone = false;
  let finalSeen = false;

  function updateSticky() {
    const show = mobile.matches && heroGone && !finalSeen && !nav.classList.contains('is-open');
    sticky.classList.toggle('is-visible', show);
    sticky.setAttribute('aria-hidden', String(!show));
    stickyBtn.tabIndex = show ? 0 : -1;
  }

  new IntersectionObserver(([e]) => {
    heroGone = !e.isIntersecting && e.boundingClientRect.top < 0;
    updateSticky();
  }).observe(heroCta);

  new IntersectionObserver(([e]) => {
    finalSeen = e.isIntersecting || e.boundingClientRect.top < 0;
    updateSticky();
  }).observe(final);

  burger.addEventListener('click', updateSticky);
  mobile.addEventListener('change', updateSticky);

  /* ---------- 7. Вопросы ---------- */
  const faq = $$('.faq__item');
  faq.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) faq.forEach((other) => { if (other !== item) other.open = false; });
    });
  });
})();
