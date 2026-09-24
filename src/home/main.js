import './hero.css';
const hero = document.querySelector('.spatial-hero');
if (hero) {
  import('./scene.js').then(({ createHero }) => createHero(hero)).catch(error => {
    hero.classList.add('spatial-fallback');
    console.warn('Spatial scene unavailable; portfolio content remains available.', error);
  });
}
