import './header-resume.css';
import { createIcons, ArrowUpRight, ArrowDownRight, ArrowUp, ArrowLeft, MapPin, Asterisk, Menu, X, MousePointer2, Headphones, ShieldCheck, PenTool, Code2, Network, Terminal, ScanLine, LockKeyhole, Braces, Gamepad2, Move, Type, Hash, Lightbulb } from 'lucide';
import { initChatbot } from './chatbot.js';
const icons = { ArrowUpRight, ArrowDownRight, ArrowUp, ArrowLeft, MapPin, Asterisk, Menu, X, MousePointer2, Headphones, ShieldCheck, PenTool, Code2, Network, Terminal, ScanLine, LockKeyhole, Braces, Gamepad2, Move, Type, Hash, Lightbulb };
createIcons({ icons });
const menu = document.querySelector('.menu-button');
const nav = document.querySelector('#main-nav');
const contactLink = document.querySelector('.nav-contact');
if (contactLink) {
  const resume = document.createElement('a');
  resume.className = 'nav-resume';
  const inExperiment = /\/(study|arcade)\//.test(location.pathname);
  resume.href = `${inExperiment ? '../' : ''}files/Vishwa_Belaganti_Resume.pdf`;
  resume.target = '_blank';
  resume.rel = 'noopener';
  resume.textContent = 'Résumé ↗';
  contactLink.before(resume);
}
const internship = [...document.querySelectorAll('.timeline-entry')]
  .find(entry => entry.querySelector('h2')?.textContent.trim() === 'Automation Intern');
if (internship) internship.querySelector('.eyebrow').textContent = 'JUN 2026 — AUG 2026';
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
initChatbot();
