const imageCache = new Map();

const imageAliases = {
  'assets/prim-home.webp.b64': 'assets/v3/prim-home.webp.b64',
  'assets/prim-catalog.webp.b64': 'assets/v3/prim-catalog.webp.b64',
  'assets/prim-product.webp.b64': 'assets/v3/prim-product.webp.b64',
  'assets/ziren-desktop.webp.b64': 'assets/v3/ziren-desktop.webp.b64',
  'assets/ziren-web-home.webp.b64': 'assets/v3/ziren-web-home.webp.b64',
  'assets/ziren-settings.webp.b64': 'assets/v3/ziren-settings.webp.b64',
  'assets/ziren-chronicle-app.webp.b64': 'assets/v4/ziren-chronicle-app.webp.b64'
};

async function fetchBase64Text(path) {
  path = imageAliases[path] || path;

  const direct = await fetch(path);
  if (direct.ok) return direct.text();

  const parts = [];
  for (let index = 1; index <= 20; index += 1) {
    const response = await fetch(`${path}.part${index}`);
    if (!response.ok) break;
    parts.push(await response.text());
  }

  if (!parts.length) throw new Error(`Не удалось загрузить ${path}`);
  return parts.join('');
}

async function loadBase64Image(path) {
  if (!imageCache.has(path)) {
    imageCache.set(
      path,
      fetchBase64Text(path).then(text => `data:image/webp;base64,${text.trim()}`)
    );
  }
  return imageCache.get(path);
}

[...document.querySelectorAll('[data-b64-src]')].forEach(async element => {
  try {
    const source = await loadBase64Image(element.dataset.b64Src);
    if (element.tagName === 'IMG') element.src = source;
    else element.dataset.src = source;
  } catch (error) {
    console.error(error);
  }
});

[...document.querySelectorAll('[data-b64-data-src]')].forEach(async element => {
  try {
    element.dataset.src = await loadBase64Image(element.dataset.b64DataSrc);
  } catch (error) {
    console.error(error);
  }
});

const chipOne = document.querySelector('.chip-one');
const chipTwo = document.querySelector('.chip-two');
if (chipOne) chipOne.innerHTML = '<b>01</b> Авторский AI-продукт';
if (chipTwo) chipTwo.innerHTML = '<b>02</b> Коммерческий сайт';

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
menuButton?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = Number(entry.target.dataset.delay || 0);
      window.setTimeout(() => entry.target.classList.add('visible'), delay);
      observer.unobserve(entry.target);
    }
  });
}, {threshold: 0.12});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox?.querySelector('img');
const lightboxCaption = lightbox?.querySelector('p');
document.querySelectorAll('.image-button').forEach(button => {
  button.addEventListener('click', () => {
    if (!lightbox || !lightboxImage || !lightboxCaption) return;
    lightboxImage.src = button.dataset.src || button.querySelector('img')?.src || '';
    lightboxImage.alt = button.dataset.alt || button.querySelector('img')?.alt || '';
    lightboxCaption.textContent = lightboxImage.alt;
    lightbox.showModal();
  });
});
lightbox?.querySelector('.lightbox-close')?.addEventListener('click', () => lightbox.close());
lightbox?.addEventListener('click', event => {
  if (event.target === lightbox) lightbox.close();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && lightbox?.open) lightbox.close();
});