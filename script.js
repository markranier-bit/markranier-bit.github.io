/* =====================================================================
   PORTFOLIO SCRIPT (vanilla JavaScript, no libraries)

   1. SETTINGS YOU CAN EDIT   <- start here: social links, email, form endpoints
   2. Helpers
   3. Social links + email
   4. Dark / light theme
   5. Navigation (hamburger menu + highlighting the current section)
   6. Scroll reveal animations
   7. Sending forms (connect a backend here)
   8. Contact form
   9. Anonymous message form
   10. Smooth scrolling for the nav links
   ===================================================================== */

'use strict';


/* =====================================================================
   1. SETTINGS YOU CAN EDIT
   ===================================================================== */

// Your social media links. Replace each YOUR_..._LINK with your full profile URL,
// for example "https://www.facebook.com/your.name".
// Every icon and button on the page that has a data-social attribute is updated automatically.
const socialLinks = {
  facebook: "https://www.facebook.com/share/1EkxqhPBgn/",
  tiktok: "https://www.tiktok.com/@areikpl?_r=1&_t=ZS-99taxUBjFR3",
  instagram: "https://www.instagram.com/_krzymrk?stkn=MTk5cXBpeWJ6bGFrYw=="
};

// Your email address (used by the Contact section).
const contactEmail = "sapieramarkranier@gmail.com";

// WHERE THE FORMS SEND THEIR MESSAGES
// A page made of only HTML/CSS/JavaScript cannot send email or save messages by itself.
// You need a backend or a form service. When you have one, paste its URL below.
//   - Form services: Formspree, Getform, Web3Forms, Netlify Forms (paste the URL they give you)
//   - Your own backend: a PHP or Laravel route that accepts a POST request (e.g. "/api/messages")
// While an endpoint is empty (""), the forms run in DEMO MODE: they show the success
// message, but nothing is actually sent or stored.
const formEndpoints = {
  contact: "",     // e.g. "https://formspree.io/f/xxxxxxx"
  anonymous: ""    // e.g. "https://your-site.com/api/anonymous-messages"
};


/* =====================================================================
   2. HELPERS
   ===================================================================== */

const root = document.documentElement;

// Short version of document.querySelector / querySelectorAll
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

// Small pop-up message at the bottom of the screen
const toast = $('#toast');
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3600);
}

// True if a link still contains a placeholder like YOUR_FACEBOOK_LINK
function isPlaceholder(value) {
  return typeof value === 'string' && value.includes('YOUR_');
}


/* =====================================================================
   3. SOCIAL LINKS + EMAIL
   ===================================================================== */

// Put the URLs from "socialLinks" into every link that has data-social="facebook" (etc.)
$$('[data-social]').forEach((link) => {
  const url = socialLinks[link.dataset.social];
  if (url) link.setAttribute('href', url);
});

// Put the email into the mailto link and into the visible text
$$('[data-email]').forEach((link) => link.setAttribute('href', 'mailto:' + contactEmail));
$$('[data-email-text]').forEach((el) => { el.textContent = contactEmail; });

// If someone clicks a link that still has a placeholder, explain instead of opening a broken page
document.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link) return;
  if (isPlaceholder(link.getAttribute('href'))) {
    event.preventDefault();
    showToast('This link is still a placeholder. Edit it in script.js or index.html.');
  }
});


/* =====================================================================
   4. DARK / LIGHT THEME
   ===================================================================== */

const THEME_KEY = 'portfolio-theme';          // the name used to save your choice in localStorage
const themeToggle = $('#theme-toggle');
const themeColorMeta = $('meta[name="theme-color"]');

function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  const goingTo = theme === 'dark' ? 'light' : 'dark';
  themeToggle.setAttribute('aria-label', 'Switch to ' + goingTo + ' mode');
  if (themeColorMeta) themeColorMeta.setAttribute('content', theme === 'dark' ? '#0F0E0E' : '#FFFFFF');
}

// Use the saved theme if there is one; otherwise start in dark mode
let savedTheme = null;
try { savedTheme = localStorage.getItem(THEME_KEY); } catch (e) { /* storage blocked: ignore */ }
applyTheme(savedTheme === 'light' ? 'light' : 'dark');

themeToggle.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* storage blocked: ignore */ }
});


/* =====================================================================
   5. NAVIGATION
   ===================================================================== */

const navToggle = $('#nav-toggle');
const navMenu = $('#nav-menu');

function setMenu(open) {
  navMenu.classList.toggle('is-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

navToggle.addEventListener('click', () => {
  setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
});

// Close the mobile menu after choosing a link, pressing Escape, or clicking outside it
$$('.nav-link').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    navToggle.focus();
  }
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('.nav')) setMenu(false);
});

// Highlight the nav link of the section that is currently on screen.
// (Smooth scrolling itself is done by "scroll-behavior: smooth" in style.css.)
const navLinks = $$('.nav-link');
const sections = $$('main section[id]');

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        const isCurrent = link.getAttribute('href') === '#' + entry.target.id;
        link.classList.toggle('active', isCurrent);
        if (isCurrent) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });   // a section counts when it crosses the middle of the screen

  sections.forEach((section) => sectionObserver.observe(section));
}


/* =====================================================================
   6. SCROLL REVEAL
   Elements with class="reveal" fade in the first time they enter the screen.
   ===================================================================== */

const revealItems = $$('.reveal');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);   // only animate once
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  // Very old browsers: just show everything
  revealItems.forEach((item) => item.classList.add('is-visible'));
}


/* =====================================================================
   7. SENDING FORMS  <-- connect your backend here
   ===================================================================== */

/**
 * Sends form data to a backend and resolves when it worked.
 * Both forms use this one function, so you only need to change it in one place.
 *
 * @param {string} endpoint - the URL from "formEndpoints" above
 * @param {object} payload  - the data to send, e.g. { message: "Hello!" }
 */
async function sendToBackend(endpoint, payload) {

  // DEMO MODE: no endpoint yet, so pretend to send. NOTHING is stored or delivered.
  if (!endpoint) {
    console.warn('[Demo mode] No endpoint is set in formEndpoints, so this message was NOT sent or saved:', payload);
    await new Promise((resolve) => setTimeout(resolve, 700));
    return { ok: true, demo: true };
  }

  // REAL MODE: send the data as JSON. This format works with Formspree, Web3Forms and most APIs.
  // If you use a Laravel route, remember to allow the request (CSRF token or an API route)
  // and to add spam protection (rate limiting, a captcha, or a honeypot field),
  // because anonymous forms attract spam.
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error('The server answered with status ' + response.status);
  return { ok: true };
}


/* =====================================================================
   8. CONTACT FORM
   ===================================================================== */

const contactForm = $('#contact-form');
const contactStatus = $('#contact-status');

// Show or clear an error under a field
function setFieldError(input, errorEl, message) {
  errorEl.textContent = message;
  if (message) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
}

// Returns an error message, or "" if the value is fine
function validateName(value) {
  return value.trim() ? '' : 'Please enter your name.';
}
function validateEmail(value) {
  const v = value.trim();
  if (!v) return 'Please enter your email address.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Please enter a valid email address, like name@example.com.';
  return '';
}
function validateMessage(value) {
  return value.trim().length >= 10 ? '' : 'Please write a message of at least 10 characters.';
}

// Each field: its input, its error paragraph, and the rule that checks it
const contactFields = [
  { input: $('#contact-name'), error: $('#contact-name-error'), validate: validateName },
  { input: $('#contact-email'), error: $('#contact-email-error'), validate: validateEmail },
  { input: $('#contact-message'), error: $('#contact-message-error'), validate: validateMessage }
];

// Re-check a field as soon as the visitor leaves it or fixes it
contactFields.forEach(({ input, error, validate }) => {
  input.addEventListener('blur', () => setFieldError(input, error, validate(input.value)));
  input.addEventListener('input', () => {
    if (input.hasAttribute('aria-invalid')) setFieldError(input, error, validate(input.value));
  });
});

contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  contactStatus.className = 'form-status';
  contactStatus.textContent = '';

  // Check every field and remember the first one with a problem
  let firstInvalid = null;
  contactFields.forEach(({ input, error, validate }) => {
    const message = validate(input.value);
    setFieldError(input, error, message);
    if (message && !firstInvalid) firstInvalid = input;
  });
  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  const button = $('button[type="submit"]', contactForm);
  const buttonText = button.textContent;
  button.disabled = true;
  button.textContent = 'Sending...';

  try {
    await sendToBackend(formEndpoints.contact, {
      name: contactFields[0].input.value.trim(),
      email: contactFields[1].input.value.trim(),
      message: contactFields[2].input.value.trim()
    });
    contactForm.reset();
    contactStatus.className = 'form-status is-success';
    contactStatus.textContent = 'Your message has been sent. Thank you for reaching out!';
  } catch (error) {
    console.error(error);
    contactStatus.className = 'form-status is-error';
    contactStatus.textContent = 'Your message could not be sent. Please try again, or email me directly.';
  } finally {
    button.disabled = false;
    button.textContent = buttonText;
  }
});


/* =====================================================================
   9. ANONYMOUS MESSAGE FORM
   Only one field: the message. No name, email, or account is asked for.
   ===================================================================== */

const anonForm = $('#anon-form');
const anonMessage = $('#anon-message');
const anonError = $('#anon-error');
const anonCount = $('#anon-count');
const anonSuccess = $('#anon-success');
const anonReset = $('#anon-reset');

// Live character counter
anonMessage.addEventListener('input', () => {
  anonCount.textContent = anonMessage.value.length + ' / ' + anonMessage.maxLength;
  if (anonMessage.hasAttribute('aria-invalid') && anonMessage.value.trim()) {
    setFieldError(anonMessage, anonError, '');
  }
});

anonForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const text = anonMessage.value.trim();
  if (!text) {
    setFieldError(anonMessage, anonError, 'Please write a message before sending.');
    anonMessage.focus();
    return;
  }
  setFieldError(anonMessage, anonError, '');

  const button = $('button[type="submit"]', anonForm);
  const buttonText = button.textContent;
  button.disabled = true;
  button.textContent = 'Sending...';

  try {
    // Only the message text is sent. Nothing about the visitor is collected by this code.
    if (window.saveAnonymousMessage) {
  await window.saveAnonymousMessage(text);
  if (formEndpoints.anonymous) {
    sendToBackend(formEndpoints.anonymous, { message: text }).catch(() => {});
  }
} else {
  await sendToBackend(formEndpoints.anonymous, { message: text });
}

    // Show the confirmation with the check-mark animation
    anonForm.hidden = true;
    anonSuccess.hidden = false;
    anonSuccess.focus();
    anonForm.reset();
    anonCount.textContent = '0 / ' + anonMessage.maxLength;
  } catch (error) {
    console.error(error);
    setFieldError(anonMessage, anonError, 'Your message could not be sent. Please try again in a moment.');
  } finally {
    button.disabled = false;
    button.textContent = buttonText;
  }
});

// "Send another message" brings the form back
anonReset.addEventListener('click', () => {
  anonSuccess.hidden = true;
  anonForm.hidden = false;
  anonMessage.focus();
});


/* =====================================================================
   10. SMOOTH SCROLLING FOR THE NAV LINKS
   Clicking a link that points to a section (href="#work", etc.) glides there
   instead of jumping. This works even if the browser's built-in smooth
   scrolling is turned off.
   ===================================================================== */

const SCROLL_DURATION = 900;   // how long the glide takes, in milliseconds (try 600 for faster, 1200 for slower)
let scrollFrame = null;        // remembers the running animation so it can be stopped

// Starts slow, speeds up in the middle, and slows down again at the end
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothScrollTo(targetY) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  let startTime = null;

  function step(now) {
    if (startTime === null) startTime = now;
    const progress = Math.min((now - startTime) / SCROLL_DURATION, 1);
    // behavior: 'instant' makes each frame jump exactly where we want, so the CSS setting can't interfere
    window.scrollTo({ top: startY + distance * easeInOutCubic(progress), behavior: 'instant' });
    if (progress < 1) scrollFrame = requestAnimationFrame(step);
  }

  cancelAnimationFrame(scrollFrame);
  scrollFrame = requestAnimationFrame(step);
}

// Stop the glide if the visitor grabs the scroll wheel, touches the screen, or presses a key
['wheel', 'touchstart', 'keydown'].forEach((type) => {
  window.addEventListener(type, () => cancelAnimationFrame(scrollFrame), { passive: true });
});

// Use the glide for every link that points to a section on this page
$$('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const id = link.getAttribute('href');
    if (id.length < 2) return;                 // ignore plain "#"
    const target = document.querySelector(id);
    if (!target) return;

    event.preventDefault();
    smoothScrollTo(target.getBoundingClientRect().top + window.scrollY);
  });
});