import './modes.css';
const params=new URLSearchParams(location.hash.slice(1)),query=new URLSearchParams(location.search);
const legacy=!params.has('gift')&&(params.has('u')||query.has('preview')||query.get('mode')==='qr'||query.get('view')==='gift');
const ready=legacy?import('../flowers/main.js'):import('./main.js');
ready.then(()=>{const app=document.querySelector('#app');app.hidden=false;
  if(!params.has('gift')&&!params.has('u')&&query.get('view')!=='gift'&&!query.has('preview')){
    const nav=document.createElement('nav');nav.className='bloom-modes';nav.setAttribute('aria-label','Bloom modes');nav.innerHTML=`<a href="?mode=qr" ${legacy?'aria-current="page"':''}>Bouquet</a><a href="./" ${legacy?'':'aria-current="page"'}>Gift Box</a>`;app.querySelector('header').after(nav);
  }}).catch(()=>{
  const app=document.querySelector('#app');app.textContent='Bloom could not load. Please refresh to try again.';app.hidden=false;
});
// Re-route when a different shared gift is pasted into the current tab.
window.addEventListener('hashchange',()=>location.reload());
