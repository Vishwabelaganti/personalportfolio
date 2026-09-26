import { compose, frequency, stepDuration, sanitizeMix, MOODS } from './composition.js';

export class LofiEngine {
  constructor(onBeat=()=>{}) {this.settings=sanitizeMix();this.pattern=compose();this.onBeat=onBeat;this.running=false;this.sources=new Set();this.muted=false;}
  async init(offlineContext=null) {
    if(!this.context){
      const Context=window.AudioContext||window.webkitAudioContext;
      if(!Context)throw new Error('Web Audio is unavailable');
      const c=this.context=offlineContext||new Context();this.offline=!!offlineContext;
      this.master=c.createGain();this.master.gain.value=0;
      this.filter=c.createBiquadFilter();this.filter.type='lowpass';
      this.compressor=c.createDynamicsCompressor();this.compressor.threshold.value=-18;this.compressor.ratio.value=4;
      this.filter.connect(this.compressor);this.compressor.connect(this.master);this.master.connect(c.destination);
      this.buses={};for(const name of ['keys','rhodes','guitar','sax','bass','drums','melody','texture']){this.buses[name]=c.createGain();this.buses[name].connect(this.filter);}
      this.delay=c.createDelay(2);this.feedback=c.createGain();this.wet=c.createGain();
      this.delay.delayTime.value=.39;this.feedback.gain.value=.22;
      for(const name of ['keys','rhodes','guitar','sax','melody'])this.buses[name].connect(this.delay);this.delay.connect(this.feedback);this.feedback.connect(this.delay);this.delay.connect(this.wet);this.wet.connect(this.filter);
      this.noise=c.createBuffer(1,c.sampleRate*2,c.sampleRate);const data=this.noise.getChannelData(0);
      let brown=0;for(let i=0;i<data.length;i++){brown=(brown+(Math.random()*2-1)*.02)/1.02;data[i]=brown*3.5;}
      this.drumNoise=c.createBuffer(1,c.sampleRate,c.sampleRate);const drum=this.drumNoise.getChannelData(0);for(let i=0;i<drum.length;i++)drum[i]=Math.random()*2-1;
      this.apply();
    }
    if(!this.offline)await this.context.resume();
  }
  apply() {
    if(!this.context)return;const t=this.context.currentTime;
    for(const name of Object.keys(this.buses))this.buses[name].gain.setTargetAtTime(this.settings[name],t,.04);
    this.filter.frequency.setTargetAtTime(7500-this.settings.warmth*5900,t,.06);
    this.wet.gain.setTargetAtTime(this.settings.space*.6,t,.06);
    this.delay.delayTime.setTargetAtTime(60/this.settings.bpm*.5,t,.15);
    this.master.gain.setTargetAtTime(this.running&&!this.muted?this.settings.volume*.6:0,t,.04);
  }
  configure(patch) {this.settings=sanitizeMix({...this.settings,...patch});this.apply();}
  setMood(mood,seed=this.settings.seed) {
    const preset=MOODS[mood]||MOODS.warm;
    this.configure({mood,seed,bpm:preset.bpm,swing:preset.swing,warmth:preset.warmth,space:preset.space,melody:preset.melody});
    this.queuePattern();
  }
  setArrangement(pattern,focusBar=null) {this.arrangement=structuredClone(pattern);this.queuePattern(focusBar);}
  queuePattern(focusBar=null) {const pattern=this.arrangement||compose(this.settings.mood,this.settings.seed);if(this.running){this.pending=pattern;if(Number.isInteger(focusBar))this.pendingStep=Math.max(0,Math.min(7,focusBar))*16;}else this.pattern=pattern;}
  track(source,nodes,end) {
    this.sources.add(source);source.onended=()=>{source.disconnect();nodes.forEach(n=>n.disconnect());this.sources.delete(source);};source.stop(end);
  }
  tone(note,time,duration,voice,velocity) {
    const c=this.context;
    const voices={
      bass:{partials:[[1,1,'sine']],amp:.22,attack:.012,release:1},
      rhodes:{partials:[[1,.7,'sine'],[2,.2,'sine'],[3,.07,'triangle'],[6,.025,'sine']],amp:.105,attack:.008,release:1.25},
      guitar:{partials:[[1,.62,'triangle'],[2,.22,'sine'],[3,.1,'triangle'],[4,.035,'sine']],amp:.12,attack:.004,release:.62},
      sax:{partials:[[1,.55,'sawtooth'],[2,.18,'triangle'],[3,.06,'sine']],amp:.07,attack:.075,release:1.08},
      melody:{partials:[[1,.78,'sine'],[2,.16,'sine'],[3,.035,'triangle']],amp:.09,attack:.012,release:1},
      keys:{partials:[[1,.78,'sine'],[2,.16,'sine'],[3,.035,'triangle']],amp:.09,attack:.012,release:1},
    },style=voices[voice]||voices.keys,partials=style.partials;
    partials.forEach(([harmonic,level,type],i)=>{
      const oscillator=c.createOscillator(),envelope=c.createGain();oscillator.type=type;oscillator.frequency.value=frequency(note)*harmonic;oscillator.detune.value=i?Math.sin(note)*3:0;
      if(voice==='sax')oscillator.detune.setValueAtTime(-4+Math.sin(note)*2,time);
      const amp=velocity*level*style.amp,end=time+Math.max(.12,duration*style.release);
      envelope.gain.setValueAtTime(.0001,time);envelope.gain.linearRampToValueAtTime(amp,time+style.attack);envelope.gain.exponentialRampToValueAtTime(.0001,end);
      oscillator.connect(envelope);envelope.connect(this.buses[voice]);oscillator.start(time);this.track(oscillator,[envelope],end+.02);
    });
  }
  percussion(voice,time,velocity) {
    const c=this.context,gain=c.createGain();gain.connect(this.buses.drums);
    if(voice==='kick'){
      const o=c.createOscillator();o.frequency.setValueAtTime(125,time);o.frequency.exponentialRampToValueAtTime(43,time+.16);
      gain.gain.setValueAtTime(velocity*.38,time);gain.gain.exponentialRampToValueAtTime(.0001,time+.32);o.connect(gain);o.start(time);this.track(o,[gain],time+.34);
    }else{
      const source=c.createBufferSource(),filter=c.createBiquadFilter();source.buffer=this.drumNoise;filter.type=voice==='hat'?'highpass':'bandpass';filter.frequency.value=voice==='hat'?6500:1700;
      const duration=voice==='hat'?.055:.18;gain.gain.setValueAtTime(velocity*(voice==='hat'?.14:.25),time);gain.gain.exponentialRampToValueAtTime(.0001,time+duration);
      source.connect(filter);filter.connect(gain);source.start(time);this.track(source,[filter,gain],time+duration+.01);
    }
  }
  schedule() {
    if(!this.running)return;const c=this.context;
    // Background throttling must not release a backlog of notes when the tab returns.
    if(this.nextTime<c.currentTime-.15)this.nextTime=c.currentTime+.04;
    while(this.nextTime<c.currentTime+.12){
      if(this.step%16===0&&this.pending){this.pattern=this.pending;this.pending=null;if(Number.isInteger(this.pendingStep)){this.step=this.pendingStep;this.pendingStep=null;}}
      for(const event of this.pattern[this.step]){
        const duration=(event.duration||1)*60/this.settings.bpm;
        if(event.notes)event.notes.forEach((note,i)=>this.tone(note,this.nextTime+i*.008,duration,event.voice,event.velocity));
        else this.percussion(event.voice,this.nextTime,event.velocity);
      }
      this.onBeat(Math.floor(this.step/16)+1,this.step%16,this.nextTime-c.currentTime);
      this.nextTime+=stepDuration(this.settings.bpm,this.settings.swing,this.step);this.step=(this.step+1)%128;
    }
  }
  async start(startBar=0){
    await this.init();if(this.running)return;this.running=true;this.step=Math.max(0,Math.min(7,startBar))*16;this.pattern=this.pending||this.arrangement||compose(this.settings.mood,this.settings.seed);this.pending=null;this.pendingStep=null;this.nextTime=this.context.currentTime+.06;
    this.texture=this.context.createBufferSource();this.texture.buffer=this.noise;this.texture.loop=true;
    const gain=this.context.createGain();gain.gain.value=.035;this.texture.connect(gain);gain.connect(this.buses.texture);this.texture.start();this.textureGain=gain;
    this.apply();this.schedule();this.interval=setInterval(()=>this.schedule(),25);
  }
  stop(){
    if(!this.context)return;this.running=false;clearInterval(this.interval);this.master.gain.cancelScheduledValues(this.context.currentTime);this.master.gain.setTargetAtTime(0,this.context.currentTime,.025);
    this.sources.forEach(source=>{try{source.stop(this.context.currentTime+.12);}catch{}});
    this.pendingStep=null;if(this.texture){this.texture.stop();this.texture.disconnect();this.textureGain.disconnect();this.texture=null;}
  }
  mute(value){this.muted=value;this.apply();}
  async exportWav(){
    const seconds=32*60/this.settings.bpm+3,sampleRate=44100;
    const context=new OfflineAudioContext(2,Math.ceil(seconds*sampleRate),sampleRate);
    const render=new LofiEngine();render.settings={...this.settings};render.running=true;await render.init(context);
    let time=.05;const pattern=this.arrangement||compose(this.settings.mood,this.settings.seed);
    pattern.forEach((events,step)=>{events.forEach(event=>{const duration=(event.duration||1)*60/this.settings.bpm;if(event.notes)event.notes.forEach((note,i)=>render.tone(note,time+i*.008,duration,event.voice,event.velocity));else render.percussion(event.voice,time,event.velocity);});time+=stepDuration(this.settings.bpm,this.settings.swing,step);});
    const texture=context.createBufferSource();texture.buffer=render.noise;texture.loop=true;const gain=context.createGain();gain.gain.value=.035;texture.connect(gain);gain.connect(render.buses.texture);texture.start();texture.stop(seconds);
    render.master.gain.setTargetAtTime(0,seconds-1,.2);
    const buffer=await context.startRendering();
    const wav=new ArrayBuffer(44+buffer.length*4),view=new DataView(wav);
    const text=(offset,value)=>[...value].forEach((c,i)=>view.setUint8(offset+i,c.charCodeAt(0)));
    text(0,'RIFF');view.setUint32(4,wav.byteLength-8,true);text(8,'WAVE');text(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,2,true);view.setUint32(24,sampleRate,true);view.setUint32(28,sampleRate*4,true);view.setUint16(32,4,true);view.setUint16(34,16,true);text(36,'data');view.setUint32(40,buffer.length*4,true);
    const left=buffer.getChannelData(0),right=buffer.getChannelData(1);let peak=0,energy=0;
    for(let i=0;i<buffer.length;i++){for(let channel=0;channel<2;channel++){const value=(channel?right:left)[i];if(!Number.isFinite(value))throw new Error('Invalid audio sample');peak=Math.max(peak,Math.abs(value));energy+=value*value;view.setInt16(44+(i*2+channel)*2,Math.max(-1,Math.min(1,value))*32767,true);}}
    return {blob:new Blob([wav],{type:'audio/wav'}),peak,rms:Math.sqrt(energy/(buffer.length*2)),seconds};
  }
  dispose(){this.stop();this.context?.close();}
}
