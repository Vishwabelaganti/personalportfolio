import './companion.css';

const companion=document.createElement('aside');companion.className='arcade-companion';companion.setAttribute('aria-label','Arcade companion');
companion.innerHTML=`<span class="companion-kicker">PLAYER TWO</span><button class="masked-friend" aria-label="Say hello to your arcade companion"><span class="friend-hood"><span class="friend-face"><span class="friend-eye"></span><span class="friend-eye"></span></span><span class="friend-mask"><i></i><i></i><i></i></span></span><span class="friend-scarf"></span></button><p id="companion-speech" role="status">Back for another round? I kept your seat warm.</p><div class="arcade-best">PERSONAL BEST <strong id="arcade-best">0</strong></div>`;
document.querySelector('.arcade-menu').append(companion);
const marquee=document.createElement('div');marquee.className='arcade-marquee';marquee.innerHTML='<span class="arcade-led"></span><span>THE POCKET ARCADE</span><span class="marquee-star">✦</span>';
document.querySelector('.arcade-console').prepend(marquee);
const speech=companion.querySelector('#companion-speech'),face=companion.querySelector('.masked-friend'),best=companion.querySelector('#arcade-best');
let game='snake',greeting=0,bests={};
try{bests=JSON.parse(localStorage.getItem('vishwa-arcade-bests')||'{}');if(!bests||typeof bests!=='object')bests={};}catch{}
const lines={snake:'Tiny turns. Big ambitions. Watch your tail!',pong:'I believe in your backhand. First to five!',hangman:'A programmer’s favorite sport: guessing names.',number:'Between one and a hundred. You’ve got this.',quiz:'One question at a time. Curiosity wins.'};
const greetings=['You play. I’ll handle moral support.','A tiny break is part of the process.','The mask? Strictly for dramatic effect.','Ready when you are, player one.'];
function say(text){speech.textContent=text;face.classList.remove('friend-cheer');requestAnimationFrame(()=>face.classList.add('friend-cheer'));}
face.addEventListener('click',()=>say(greetings[greeting++%greetings.length]));
document.querySelectorAll('[data-game]').forEach(button=>button.addEventListener('click',()=>{game=button.dataset.game;say(lines[game]);updateBest();}));
function updateBest(){best.textContent=['snake','pong','quiz'].includes(game)?String(bests[game]||0):'—';}
const score=document.querySelector('#game-score');
const observer=new MutationObserver(()=>{
  const active=document.querySelector('[data-game][aria-pressed="true"]')?.dataset.game||game;game=active;
  if(['snake','pong','quiz'].includes(game)){const value=parseInt(score.textContent,10)||0;if(value>(Number(bests[game])||0)){bests[game]=value;try{localStorage.setItem('vishwa-arcade-bests',JSON.stringify(bests));}catch{}say('New personal best. That one’s going on the wall!');}}
  updateBest();
});observer.observe(score,{childList:true,characterData:true,subtree:true});
const hintObserver=new MutationObserver(()=>{const hint=document.querySelector('#game-hint').textContent;if(/Round over|wins|win!/i.test(hint))say(/You win/i.test(hint)?'That’s my player one. Beautifully played.':'Good round. Take a breath, then one more?');});hintObserver.observe(document.querySelector('#game-hint'),{childList:true,subtree:true});
updateBest();
if(import.meta.hot)import.meta.hot.dispose(()=>{observer.disconnect();hintObserver.disconnect();companion.remove();marquee.remove();});
