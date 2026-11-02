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
  const portfolioRoot = new URL(document.querySelector('.identity').getAttribute('href'), location.href);
  resume.href = new URL('assets/Vishwa_Belaganti_Resume.pdf', portfolioRoot).href;
  resume.download = 'Vishwa_Belaganti_Resume.pdf';
  resume.title = 'Download resume (PDF)';
  resume.target = '_blank';
  resume.rel = 'noopener';
  resume.textContent = 'Download resume';
  contactLink.before(resume);
}
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
