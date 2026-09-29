const params=new URLSearchParams(location.hash.slice(1)),query=new URLSearchParams(location.search);
const legacy=!params.has('gift')&&(params.has('u')||query.has('preview')||query.get('mode')==='qr'||query.get('view')==='gift');
const ready=legacy?import('../flowers/main.js'):import('./main.js');
ready.then(()=>{document.querySelector('#app').hidden=false;}).catch(()=>{
  const app=document.querySelector('#app');app.textContent='Bloom could not load. Please refresh to try again.';app.hidden=false;
});
// Re-route when a different shared gift is pasted into the current tab.
window.addEventListener('hashchange',()=>location.reload());
