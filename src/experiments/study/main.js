import { StudyScene } from './scene.js';
import { StudyAudio } from './audio.js';
import { FocusTimer } from './timer.js';
import './style.css';
const $=s=>document.querySelector(s);
const timer=new FocusTimer();const audio=new StudyAudio(new URL('../audio/',location.href));let scene;
function tell(text){$('#study-status').textContent=text;}
function strike(i){scene?.strike(i);audio.chime(i).catch(()=>tell('Sound could not start. Try tapping a chime again.'));}
try{scene=new StudyScene($('#study-scene'),strike);}catch(error){$('#study-scene').innerHTML='<div class="study-fallback">The 3D view is unavailable here.<br>Your timer, notes, and sound mixer still work.</div>';console.warn('Study scene unavailable',error);}
document.querySelectorAll('[data-note]').forEach(b=>b.addEventListener('click',()=>strike(Number(b.dataset.note))));
document.querySelectorAll('[data-mood]').forEach(b=>b.addEventListener('click',()=>{scene?.setMood(b.dataset.mood);document.querySelectorAll('[data-mood]').forEach(el=>el.setAttribute('aria-pressed',el===b));$('#mood-name').textContent=b.textContent;}));
$('#wind').addEventListener('input',e=>{if(scene)scene.wind=Number(e.target.value);});
$('#rainfall').addEventListener('input',e=>{if(scene)scene.rain=Number(e.target.value);});
function updateTimer(){const finished=timer.tick();$('#timer-display').textContent=timer.label;$('#timer-toggle').textContent=timer.running?'Pause session':timer.remaining?'Start focus session':'Session complete';$('#timer-toggle').disabled=!timer.remaining;if(finished){tell('Session complete. Take a breath and a short break.');audio.chime(0,.12).catch(()=>{});}}
$('#timer-toggle').addEventListener('click',()=>{timer.running?timer.pause():timer.start();updateTimer();});
$('#timer-reset').addEventListener('click',()=>{timer.reset();updateTimer();tell('Timer reset. Begin when you’re ready.');});
document.querySelectorAll('[data-minutes]').forEach(b=>b.addEventListener('click',()=>{timer.reset(Number(b.dataset.minutes));document.querySelectorAll('[data-minutes]').forEach(el=>el.setAttribute('aria-pressed',el===b));updateTimer();}));
setInterval(updateTimer,250);
document.querySelectorAll('[data-audio]').forEach(input=>input.addEventListener('input',async()=>{try{await audio.setTrack(input.dataset.audio,Number(input.value));}catch{input.value=0;tell('That sound could not load. The other controls are still available.');}}));
$('#mute-audio').addEventListener('click',async()=>{try{await audio.mute(!audio.muted);$('#mute-audio').textContent=audio.muted?'Unmute sounds':'Mute sounds';$('#mute-audio').setAttribute('aria-pressed',audio.muted);}catch{tell('A sound could not resume. Adjust its slider to try again.');}});
$('#pause-scene').addEventListener('click',()=>{if(!scene)return;scene.motion=!scene.motion;$('#pause-scene').textContent=scene.motion?'Pause motion':'Resume motion';});
const note=$('#session-note');try{note.value=localStorage.getItem('vishwa-study-note')||'';}catch{}
note.addEventListener('input',()=>{try{localStorage.setItem('vishwa-study-note',note.value);}catch{tell('Notes will stay here for this visit, but could not be saved on this device.');}});
$('#focus-mode').addEventListener('click',()=>{const active=document.body.classList.toggle('focus-mode');$('#focus-mode').textContent=active?'Show controls':'Hide controls';$('#focus-mode').setAttribute('aria-pressed',active);});
window.addEventListener('pagehide',event=>{if(event.persisted){audio.tracks.forEach(t=>t.audio.pause());audio.context?.suspend();}else audio.dispose();});
window.addEventListener('pageshow',event=>{if(event.persisted){updateTimer();audio.tracks.forEach((t,name)=>audio.setTrack(name,t.volume).catch(()=>tell('Adjust a sound slider to resume audio.')));}});updateTimer();
