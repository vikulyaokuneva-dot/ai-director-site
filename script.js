const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelectorAll('.site-nav a');
const hero = document.querySelector('.hero');
const auditForm = document.querySelector('#audit-form');
const auditSubmit = document.querySelector('#audit-submit');
const auditSuccess = document.querySelector('#audit-success');
const auditError = document.querySelector('#audit-error');
const auditNameInput = document.querySelector('#audit-name');
const auditTelegramInput = document.querySelector('#audit-telegram');
const auditNameError = document.querySelector('#audit-name-error');
const auditTelegramError = document.querySelector('#audit-telegram-error');
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

const clearFieldError = (input, errorElement) => {
  if (!input) return;
  const field = input.closest('.form-field');
  field?.classList.remove('is-invalid');
  if (errorElement) errorElement.textContent = '';
};

const setFieldError = (input, errorElement, message) => {
  if (!input) return;
  const field = input.closest('.form-field');
  field?.classList.add('is-invalid');
  if (errorElement) errorElement.textContent = message;
};

if (auditForm) {
  const submitDefaultText = auditSubmit?.textContent || 'Получить аудит';

  const validateAuditForm = () => {
    let isValid = true;
    clearFieldError(auditNameInput, auditNameError);
    clearFieldError(auditTelegramInput, auditTelegramError);

    const nameValue = auditNameInput?.value.trim() || '';
    const telegramValue = auditTelegramInput?.value.trim() || '';

    if (!nameValue) {
      setFieldError(auditNameInput, auditNameError, 'Введите имя');
      isValid = false;
    }

    if (!telegramValue) {
      setFieldError(auditTelegramInput, auditTelegramError, 'Укажите Telegram');
      isValid = false;
    }

    return isValid;
  };

  auditNameInput?.addEventListener('input', () => clearFieldError(auditNameInput, auditNameError));
  auditTelegramInput?.addEventListener('input', () => clearFieldError(auditTelegramInput, auditTelegramError));

  auditForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (auditSuccess) auditSuccess.hidden = true;
    if (auditError) auditError.hidden = true;

    if (!validateAuditForm()) return;

    if (auditSubmit) {
      auditSubmit.disabled = true;
      auditSubmit.textContent = 'Отправка...';
    }

    try {
      const formData = new FormData(auditForm);
      const response = await fetch(auditForm.action, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json'
        }
      });

      if (!response.ok) throw new Error('Formspree request failed');

      auditForm.reset();
      clearFieldError(auditNameInput, auditNameError);
      clearFieldError(auditTelegramInput, auditTelegramError);
      if (auditSuccess) auditSuccess.hidden = false;
    } catch (error) {
      if (auditError) auditError.hidden = false;
    } finally {
      if (auditSubmit) {
        auditSubmit.disabled = false;
        auditSubmit.textContent = submitDefaultText;
      }
    }
  });
}

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
