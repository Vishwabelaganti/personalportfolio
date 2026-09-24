export class StudyAudio {
 constructor(base){this.base=base;this.tracks=new Map();this.muted=false;this.context=null;}
 async setTrack(name,volume){
  let track=this.tracks.get(name);
  if(!track){const audio=new Audio(new URL(`${name}.mp3`,this.base).href);audio.loop=true;audio.preload='none';track={audio,volume:0};this.tracks.set(name,track);}
  track.volume=volume;track.audio.volume=this.muted?0:volume;
  if(volume>0&&!this.muted){try{await track.audio.play();}catch(error){track.volume=0;track.audio.pause();throw error;}}else track.audio.pause();
 }
 async mute(value){this.muted=value;await Promise.all([...this.tracks].map(([name,t])=>this.setTrack(name,t.volume)));}
 async chime(index,volume=.23){
  if(this.muted)return;
  if(!this.context){const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return;this.context=new AudioContext();this.compressor=this.context.createDynamicsCompressor();this.compressor.connect(this.context.destination);}
  await this.context.resume();const t=this.context.currentTime;const base=[293.66,329.63,440,493.88,587.33][index%5];
  [1,2.756,5.404].forEach((harmonic,i)=>{const oscillator=this.context.createOscillator();const gain=this.context.createGain();oscillator.type='sine';oscillator.frequency.setValueAtTime(base*harmonic,t);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(volume/(i+1)*.32,t+.008);gain.gain.exponentialRampToValueAtTime(.0001,t+2.8-i*.5);oscillator.connect(gain);gain.connect(this.compressor);oscillator.start(t);oscillator.stop(t+3);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};});
 }
 dispose(){this.tracks.forEach(t=>{t.audio.pause();t.audio.src='';});this.context?.close();}
}
