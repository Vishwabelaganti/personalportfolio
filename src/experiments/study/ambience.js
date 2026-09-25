export const AMBIENCES = {wind:'Bamboo breeze',stream:'Garden stream',ocean:'Ocean wash',brown:'Brown noise',pink:'Soft pink noise'};

// Procedural ambience: filtered noise with slow, continuous modulation.
export class Ambience {
 constructor(){this.layers=new Map();this.muted=false;}
 async set(name,volume){
  if(!AMBIENCES[name])return;
  if(!this.context)this.context=new (window.AudioContext||window.webkitAudioContext)();
  const c=this.context;await c.resume();let layer=this.layers.get(name);
  if(!layer){
   const buffer=c.createBuffer(1,c.sampleRate*8,c.sampleRate),data=buffer.getChannelData(0);let brown=0,p0=0,p1=0,p2=0;
   for(let i=0;i<data.length;i++){const white=Math.random()*2-1;brown=(brown+white*.025)/1.025;p0=.99765*p0+white*.099046;p1=.963*p1+white*.2965164;p2=.57*p2+white*1.0526913;const sample=name==='brown'?brown*3:name==='pink'?(p0+p1+p2+white*.1848)*.12:white*.35;data[i]=sample*Math.min(1,i/400,(data.length-1-i)/400);}
   const source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain(),swell=c.createGain(),lfo=c.createOscillator(),depth=c.createGain();source.buffer=buffer;source.loop=true;filter.type=name==='stream'?'bandpass':'lowpass';filter.frequency.value={wind:700,stream:1800,ocean:1000,brown:450,pink:1300}[name];filter.Q.value=.5;
   swell.gain.value=.65;lfo.frequency.value=name==='ocean'?.09:name==='wind'?.15:.3;depth.gain.value=name==='brown'||name==='pink'?.025:.3;lfo.connect(depth);depth.connect(swell.gain);source.connect(filter);filter.connect(swell);swell.connect(gain);gain.connect(c.destination);gain.gain.value=0;source.start();lfo.start();layer={source,filter,gain,swell,lfo,depth,volume:0};this.layers.set(name,layer);
  }
  layer.volume=volume;layer.gain.gain.setTargetAtTime(this.muted?0:volume*.35,c.currentTime,.15);
 }
 mute(value){this.muted=value;this.layers.forEach(layer=>layer.gain.gain.setTargetAtTime(value?0:layer.volume*.35,this.context.currentTime,.08));}
 suspend(){this.context?.suspend();}
 resume(){if([...this.layers.values()].some(l=>l.volume>0)&&!this.muted)this.context?.resume();}
 dispose(){this.layers.forEach(l=>{l.source.stop();l.lfo.stop();Object.values(l).forEach(n=>n?.disconnect?.());});this.context?.close();}
}
