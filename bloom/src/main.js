import './style.css';
import { createIcons, Flower2, Flower, Sprout, Sparkles, ArrowUpRight, Link, ArrowRight, ArrowLeft, Pause, Play, RotateCcw, Download, Heart, Asterisk, X, Check } from 'lucide';
import { BloomScene } from './scene.js';
import { PALETTES, FLOWERS, normalizeUrl, createCode, drawQR, encodeShare, decodeShare } from './qr.js';
const icons={Flower2,Flower,Sprout,Sparkles,ArrowUpRight,Link,ArrowRight,ArrowLeft,Pause,Play,RotateCcw,Download,Heart,Asterisk,X,Check};
const $=s=>document.querySelector(s);
function refreshIcons(){createIcons({icons,attrs:{'aria-hidden':'true'}});}
let initial=null,invalidShare=false;
try{initial=decodeShare(location.hash);}catch{invalidShare=true;}
let state=initial??{url:'https://example.com',palette:'rosewater',flower:'rose',butterflies:true};
const isPreview=new URLSearchParams(location.search).get('preview')==='1';
let isGift=!!initial || new URLSearchParams(location.search).get('view')==='gift';
document.body.classList.toggle('gift-mode',isGift);
document.body.classList.toggle('embed-mode',isPreview);
let code=createCode(state.url),scene,qrVisible=false,toastTimeout;
const input=$('#destination'),feedback=$('#url-feedback');
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>$('#toast').classList.remove('visible'),4200);}
function setIcon(el,name){el.innerHTML=`<i data-lucide="${name}"></i>`;refreshIcons();}
function updateControls(syncInput=false){
 if(syncInput) input.value=state.url;
 document.querySelectorAll('[data-flower]').forEach(b=>{const active=b.dataset.flower===state.flower;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active);});
 document.querySelectorAll('[data-palette]').forEach(b=>{const active=b.dataset.palette===state.palette;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active);});
 $('#palette-label').textContent=PALETTES[state.palette].name;
 $('#specimen-name').textContent=FLOWERS[state.flower];
 $('#specimen-caption').textContent=`ARRANGEMENT Nº ${String(Object.keys(FLOWERS).indexOf(state.flower)+1).padStart(3,'0')}`;
 $('#butterfly-toggle').setAttribute('aria-checked',state.butterflies);
 $('#destination-link').href=state.url;
 $('#gift-open-link').href=state.url;
 $('#gift-url').textContent=state.url;
}
function applyUrl(){
 try{const next=normalizeUrl(input.value);if(next!==state.url){const nextCode=createCode(next);state.url=next;code=nextCode;scene?.setCode(code);updateFallback();}input.value=state.url;feedback.textContent='Your link is tucked into the flowers.';feedback.classList.remove('error');input.removeAttribute('aria-invalid');$('#destination-link').href=state.url;
 $('#gift-open-link').href=state.url;
 $('#gift-url').textContent=state.url;return true;}
 catch(error){feedback.textContent=error.message.includes('Invalid URL')?'That link doesn’t look quite right. Try https://example.com.':error.message;feedback.classList.add('error');input.setAttribute('aria-invalid','true');return false;}
}
function toggle(){if(isPreview)return;if(!isGift&&!applyUrl())return;qrVisible=!qrVisible;scene?.toggle(qrVisible);document.body.classList.toggle('qr-mode',qrVisible);$('#bloom-button span').textContent=qrVisible?'Gather the bouquet':'Tap to bloom your link';$('#stage-hint').textContent=qrVisible?'SCAN WITH YOUR CAMERA · OR OPEN THE LINK':'DRAG TO EXPLORE · CLICK TO TRANSFORM';$('#mode-number').textContent=qrVisible?'02':'01';$('#mode-label').textContent=qrVisible?'THE REVEAL':'THE BOUQUET';$('#scene').setAttribute('aria-label',qrVisible?'Gather the QR code into a bouquet':'Bloom the bouquet into a QR code');}
function updateFallback(){const canvas=$('.scene-fallback');if(canvas)drawQR(canvas,code,PALETTES[state.palette],state.flower);}
function fallback(){scene?.dispose();scene=null;$('#scene').replaceChildren();const canvas=document.createElement('canvas');canvas.className='scene-fallback';canvas.setAttribute('aria-label','Floral QR code');$('#scene').appendChild(canvas);updateFallback();$('#bloom-button').disabled=true;$('#bloom-button span').textContent='Your floral QR is ready';$('#stage-hint').textContent='3D IS UNAVAILABLE HERE · SHARING AND SAVING STILL WORK';$('#loading')?.remove();}
updateControls(true);refreshIcons();
try{scene=new BloomScene($('#scene'),code,state,toggle);scene.isPreview=isPreview;$('#loading').remove();if(!scene.motion){setIcon($('#motion-button'),'play');$('#motion-button').setAttribute('aria-label','Resume ambient motion');}}
catch(error){console.error('Could not initialize the flower scene:',error);fallback();}
$('#scene').addEventListener('renderlost',()=>{fallback();toast('The 3D view stopped. Your floral QR is still available.');});
$('#link-form').addEventListener('submit',e=>{e.preventDefault();if(applyUrl())toast('Your bouquet has a new destination.');});
input.addEventListener('input',()=>{feedback.textContent='Press Enter or the arrow to update your link.';feedback.classList.remove('error');input.removeAttribute('aria-invalid');});
$('#bloom-button').addEventListener('click',toggle);
document.querySelectorAll('[data-flower]').forEach(button=>button.addEventListener('click',()=>{state.flower=button.dataset.flower;scene?.setFlower(state.flower);updateControls();updateFallback();}));
document.querySelectorAll('[data-palette]').forEach(button=>button.addEventListener('click',()=>{state.palette=button.dataset.palette;scene?.setPalette(state.palette);updateControls();updateFallback();}));
$('#butterfly-toggle').addEventListener('click',()=>{state.butterflies=!state.butterflies;if(scene)scene.butterfliesEnabled=state.butterflies;$('#butterfly-toggle').setAttribute('aria-checked',state.butterflies);});
$('#motion-button').addEventListener('click',()=>{if(!scene)return;scene.motion=!scene.motion;setIcon($('#motion-button'),scene.motion?'pause':'play');const label=scene.motion?'Pause ambient motion':'Resume ambient motion';$('#motion-button').setAttribute('aria-label',label);$('#motion-button').title=label;});
$('#reset-view').addEventListener('click',()=>{if(scene)scene.dragRotation=0;if(qrVisible)toggle();});
$('#share-button').addEventListener('click',async()=>{
 if(!applyUrl())return;
 const shared=encodeShare(state,location.href);
 try{await navigator.clipboard.writeText(shared);history.replaceState(null,'',shared);toast(location.hostname==='localhost'||location.hostname==='127.0.0.1'?'Copied! This preview link works on this computer. Deploy to share it online.':'Bouquet link copied. Send a little wonder.');}
 catch{const dialog=document.createElement('dialog');const title=document.createElement('h2');title.textContent='Your bouquet link';const field=document.createElement('textarea');field.value=shared;field.style.cssText='width:100%;height:100px;padding:12px';field.setAttribute('aria-label','Bouquet share link');const close=document.createElement('button');close.className='primary-button';close.textContent='Done';close.onclick=()=>{dialog.close();dialog.remove();};dialog.append(title,field,close);document.body.append(dialog);dialog.showModal();field.select();}
});
$('#download-button').addEventListener('click',()=>{
 if(!applyUrl())return;
 const canvas=document.createElement('canvas');drawQR(canvas,code,PALETTES[state.palette],state.flower,40);
 canvas.toBlob(blob=>{if(!blob){toast('Could not save the QR. Please try again.');return;}const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`bloom-${state.flower}-${state.palette}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('Your floral QR is ready to keep.');},'image/png');
});
const about=$('#about-dialog');$('#about-button').addEventListener('click',()=>about.showModal());$('#close-about').addEventListener('click',()=>about.close());$('#about-done').addEventListener('click',()=>about.close());about.addEventListener('click',e=>{if(e.target===about){const r=about.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)about.close();}});
window.addEventListener('hashchange',()=>{try{const next=decodeShare(location.hash);if(next){isGift=true;document.body.classList.add('gift-mode');state=next;code=createCode(state.url);if(scene){scene.state=state;scene.flowerKind=state.flower;scene.setCode(code);scene.butterfliesEnabled=state.butterflies;}updateControls(true);updateFallback();}}catch{toast('This bouquet link is incomplete. You can create a new one.');}});
if(invalidShare)toast('This bouquet link is incomplete. Start a fresh arrangement below.');
// Progressive enhancement for browsers implementing the WebMCP standard.
const modelContext=document.modelContext ?? navigator.modelContext;
if(modelContext?.registerTool&&!isGift&&!isPreview){
 try { Promise.resolve(modelContext.registerTool({name:'create_bouquet',description:'Set the Bloom bouquet destination and appearance. This changes the local preview only.',inputSchema:{type:'object',properties:{url:{type:'string'},palette:{type:'string',enum:Object.keys(PALETTES)},flower:{type:'string',enum:Object.keys(FLOWERS)}},required:['url'],additionalProperties:false},annotations:{readOnlyHint:false},async execute({url,palette,flower}){if(typeof url!=='string')return {error:'A URL string is required.'};input.value=url;if(!applyUrl())return {content:[{type:'text',text:feedback.textContent}],isError:true};if(palette&&Object.hasOwn(PALETTES,palette)){state.palette=palette;scene?.setPalette(palette);}if(flower&&Object.hasOwn(FLOWERS,flower)){state.flower=flower;scene?.setFlower(flower);}updateControls();updateFallback();return {content:[{type:'text',text:encodeShare(state,location.href)}]};}})).catch(error=>console.warn('Optional browser tool unavailable',error)); } catch (error) { console.warn('Optional browser tool registration unavailable',error); }
}

window.addEventListener("message",event=>{if(isPreview&&event.origin===location.origin&&event.source===window.parent&&event.data?.type==="portfolio-preview-visibility"&&scene)scene.previewVisible=event.data.visible===true;});
