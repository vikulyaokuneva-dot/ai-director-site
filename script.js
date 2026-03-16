const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelectorAll('.site-nav a');
const hero = document.querySelector('.hero');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const onScrollHeader = () => {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 18);
};

onScrollHeader();
window.addEventListener('scroll', onScrollHeader, { passive: true });

if (menuToggle && header) {
  menuToggle.addEventListener('click', () => {
    const isOpen = header.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

const closeMenu = () => {
  if (!header || !header.classList.contains('menu-open')) return;
  header.classList.remove('menu-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
};

const smoothScrollTo = (targetId) => {
  const target = document.querySelector(targetId);
  if (!target) return;

  const headerOffset = (header?.offsetHeight || 0) + 12;
  const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

  window.scrollTo({
    top,
    behavior: prefersReducedMotion ? 'auto' : 'smooth'
  });
};

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;

    event.preventDefault();
    smoothScrollTo(href);
    history.replaceState(null, '', href);
    closeMenu();
  });
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 920) closeMenu();
});

window.addEventListener('click', (event) => {
  if (!header || !header.classList.contains('menu-open')) return;
  if (header.contains(event.target)) return;
  closeMenu();
});

const staggerGroups = [
  '.problem-grid .reveal',
  '.feature-grid .reveal',
  '.benefits-grid .reveal',
  '.steps .reveal'
];

staggerGroups.forEach((selector) => {
  const items = document.querySelectorAll(selector);
  items.forEach((item, index) => {
    if (item.style.getPropertyValue('--delay')) return;
    item.style.setProperty('--delay', `${Math.min(index * 0.06, 0.36)}s`);
  });
});

const revealItems = document.querySelectorAll('.reveal');
if (prefersReducedMotion) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: '0px 0px -10% 0px'
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

const sections = document.querySelectorAll('main section[id]');
const setActiveNav = (id) => {
  navLinks.forEach((link) => {
    const linkId = link.getAttribute('href')?.slice(1);
    link.classList.toggle('active', linkId === id);
  });
};

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      setActiveNav(entry.target.id);
    });
  },
  {
    threshold: 0.55,
    rootMargin: '-20% 0px -40% 0px'
  }
);

sections.forEach((section) => sectionObserver.observe(section));

if (hero && !prefersReducedMotion) {
  let rafId = null;
  let targetX = 78;
  let targetY = 16;

  const applyPointerGlow = () => {
    hero.style.setProperty('--hero-x', `${targetX}%`);
    hero.style.setProperty('--hero-y', `${targetY}%`);
    rafId = null;
  };

  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    targetX = ((event.clientX - rect.left) / rect.width) * 100;
    targetY = ((event.clientY - rect.top) / rect.height) * 100;

    if (rafId) return;
    rafId = window.requestAnimationFrame(applyPointerGlow);
  });
}
