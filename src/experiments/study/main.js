import { StudyScene } from './scene.js';
import { StudyAudio } from './audio.js';
import { FocusTimer } from './timer.js';
import { createMixer } from './mixer-ui.js';
import { MOODS } from './composition.js';
import './style.css';
import './weather.css';
import { Ambience, AMBIENCES } from './ambience.js';
const $=s=>document.querySelector(s);
const timer=new FocusTimer();const audio=new StudyAudio(new URL('../audio/',location.href));let scene;
const loadStatus=document.createElement('span');loadStatus.id='scene-load-status';loadStatus.className='scene-load-status';loadStatus.setAttribute('role','status');loadStatus.textContent='Arranging the courtyard…';$('.study-view').append(loadStatus);
const ambience=new Ambience();
document.querySelector('label[for="lofi-volume"]').remove();
document.querySelector('.sound-heading').parentElement.insertAdjacentHTML('beforeend',Object.entries(AMBIENCES).map(([id,label])=>`<label class="study-slider" for="ambient-${id}">${label}<input id="ambient-${id}" data-ambient="${id}" type="range" min="0" max="1" step=".05" value="0"></label>`).join(''));
document.querySelectorAll('[data-ambient]').forEach(input=>input.addEventListener('input',()=>ambience.set(input.dataset.ambient,Number(input.value)).catch(()=>tell('Press the sound control again to enable audio.'))));
document.querySelector('.chime-bar>span').textContent='DRAG ACROSS THE CHIMES · TAKE A BREATH';
const fullscreen=document.createElement('button');fullscreen.textContent='Fullscreen';fullscreen.id='study-fullscreen';document.querySelector('.study-scene-actions').append(fullscreen);
let nativeFullscreen=false;
function immersive(active){document.querySelector('.study-view').classList.toggle('is-immersive',active);document.body.classList.toggle('study-immersive',active);fullscreen.textContent=active?'Exit fullscreen':'Fullscreen';scene?.resize();}
fullscreen.addEventListener('click',()=>{if(document.querySelector('.study-view').classList.contains('is-immersive')){immersive(false);if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});}else{immersive(true);document.querySelector('.study-view').requestFullscreen?.().catch(()=>{});}});
document.addEventListener('fullscreenchange',()=>{if(document.fullscreenElement){nativeFullscreen=true;immersive(true);}else if(nativeFullscreen){nativeFullscreen=false;immersive(false);}});
document.addEventListener('keydown',e=>{if(e.key==='Escape')immersive(false);});
const weather=document.createElement('div');weather.className='weather-options';weather.setAttribute('aria-label','Weather');weather.innerHTML='<button data-weather="petals" aria-pressed="true">Petals</button><button data-weather="rain" aria-pressed="false">Rain</button><button data-weather="snow" aria-pressed="false">Snow</button>';document.querySelector('.mood-options').after(weather);
const weatherLabel=document.querySelector('label[for="rainfall"]');weatherLabel.firstChild.textContent='Weather intensity';$('#rainfall').value='.55';
$('.study-heading .eyebrow').textContent='PLAYGROUND / STUDY SPACE';
$('.study-heading h1+p').textContent='A quiet courtyard. A soundtrack of your own. A little room to focus.';
function tell(text){$('#study-status').textContent=text;}
function strike(i){scene?.strike(i);audio.chime(i).catch(()=>tell('Sound could not start. Try tapping a chime again.'));}
try{scene=new StudyScene($('#study-scene'),strike);}catch(error){$('#study-scene').innerHTML='<div class="study-fallback">The 3D view is unavailable here.<br>Your timer, notes, and sound mixer still work.</div>';console.warn('Study scene unavailable',error);}
document.querySelectorAll('[data-note]').forEach(b=>b.addEventListener('click',()=>strike(Number(b.dataset.note))));
document.querySelectorAll('[data-mood]').forEach(b=>b.addEventListener('click',()=>{scene?.setMood(b.dataset.mood);document.querySelectorAll('[data-mood]').forEach(el=>el.setAttribute('aria-pressed',el===b));$('#mood-name').textContent=b.textContent;}));
$('#wind').addEventListener('input',e=>{if(scene)scene.wind=Number(e.target.value);});
$('#rainfall').addEventListener('input',e=>scene?.setWeather(scene.weather,Number(e.target.value)));
document.querySelectorAll('[data-weather]').forEach(button=>button.addEventListener('click',()=>{scene?.setWeather(button.dataset.weather,Number($('#rainfall').value));document.querySelectorAll('[data-weather]').forEach(el=>el.setAttribute('aria-pressed',el===button));tell(`${button.textContent} weather selected.`);}));
function updateTimer(){const finished=timer.tick();$('#timer-display').textContent=timer.label;$('#timer-toggle').textContent=timer.running?'Pause session':timer.remaining?'Start focus session':'Session complete';$('#timer-toggle').disabled=!timer.remaining;if(finished){tell('Session complete. Take a breath and a short break.');audio.chime(0,.12).catch(()=>{});}}
$('#timer-toggle').addEventListener('click',()=>{timer.running?timer.pause():timer.start();updateTimer();});
$('#timer-reset').addEventListener('click',()=>{timer.reset();updateTimer();tell('Timer reset. Begin when you’re ready.');});
document.querySelectorAll('[data-minutes]').forEach(b=>b.addEventListener('click',()=>{timer.reset(Number(b.dataset.minutes));document.querySelectorAll('[data-minutes]').forEach(el=>el.setAttribute('aria-pressed',el===b));updateTimer();}));
setInterval(updateTimer,250);
document.querySelectorAll('[data-audio]').forEach(input=>input.addEventListener('input',async()=>{try{await audio.setTrack(input.dataset.audio,Number(input.value));}catch{input.value=0;tell('That sound could not load. The other controls are still available.');}}));
$('#mute-audio').addEventListener('click',async()=>{try{await audio.mute(!audio.muted);ambience.mute(audio.muted);mixer.engine.mute(audio.muted);$('#mute-audio').textContent=audio.muted?'Unmute sounds':'Mute sounds';$('#mute-audio').setAttribute('aria-pressed',audio.muted);}catch{tell('A sound could not resume. Adjust its slider to try again.');}});
$('#pause-scene').addEventListener('click',()=>{if(!scene)return;scene.motion=!scene.motion;$('#pause-scene').textContent=scene.motion?'Pause motion':'Resume motion';});
const note=$('#session-note');try{note.value=localStorage.getItem('vishwa-study-note')||'';}catch{}
note.addEventListener('input',()=>{try{localStorage.setItem('vishwa-study-note',note.value);}catch{tell('Notes will stay here for this visit, but could not be saved on this device.');}});
$('#focus-mode').addEventListener('click',()=>{const active=document.body.classList.toggle('focus-mode');$('#focus-mode').textContent=active?'Show controls':'Hide controls';$('#focus-mode').setAttribute('aria-pressed',active);});
const mixer=createMixer({onMood(name){document.querySelector(`[data-mood="${MOODS[name].light}"]`).click();document.querySelector(`[data-weather="${name==='rain'?'rain':'petals'}"]`).click();},async onStart(){}});
window.addEventListener('pagehide',event=>{mixer.stop();if(event.persisted){audio.tracks.forEach(t=>t.audio.pause());audio.context?.suspend();ambience.suspend();}else{audio.dispose();ambience.dispose();mixer.dispose();scene?.dispose();}});
window.addEventListener('pageshow',event=>{if(event.persisted){updateTimer();ambience.resume();audio.tracks.forEach((t,name)=>audio.setTrack(name,t.volume).catch(()=>tell('Adjust a sound slider to resume audio.')));}});updateTimer();
