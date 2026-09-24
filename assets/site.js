import { createIcons, ArrowUpRight, ArrowDownRight, ArrowUp, ArrowLeft, MapPin, Asterisk, Menu, X, MousePointer2, Headphones, ShieldCheck, PenTool, Code2, Network, Terminal, ScanLine, LockKeyhole, Braces } from 'lucide';
const icons = { ArrowUpRight, ArrowDownRight, ArrowUp, ArrowLeft, MapPin, Asterisk, Menu, X, MousePointer2, Headphones, ShieldCheck, PenTool, Code2, Network, Terminal, ScanLine, LockKeyhole, Braces };
createIcons({ icons });
const menu = document.querySelector('.menu-button');
const nav = document.querySelector('#main-nav');
function closeMenu() {
  menu?.setAttribute('aria-expanded', 'false');
  menu?.setAttribute('aria-label', 'Open navigation');
  nav?.classList.remove('is-open');
}
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  nav.classList.toggle('is-open', open);
});
nav?.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeMenu(); menu?.focus(); } });
// Keep off-screen live project previews from consuming rendering time.
const observer = new IntersectionObserver((entries) => {
  entries.forEach(({ target, isIntersecting }) => target.contentWindow?.postMessage({ type: 'portfolio-preview-visibility', visible: isIntersecting }, location.origin));
});
document.querySelectorAll('.flower-preview iframe').forEach(frame => observer.observe(frame));
