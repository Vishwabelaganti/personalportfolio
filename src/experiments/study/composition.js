export const MOODS = {
  warm: { label: 'Golden hour', bpm: 76, root: 57, chords: [[0,4,7,11],[9,12,16,19],[5,9,12,16],[7,11,14,17]], swing: .15, warmth: .6, space: .35, melody: .32, light: 'dusk' },
  focus: { label: 'Deep focus', bpm: 80, root: 57, chords: [[0,3,7,10],[5,8,12,15],[3,7,10,14],[7,10,14,17]], swing: .1, warmth: .72, space: .25, melody: .16, light: 'day' },
  rain: { label: 'Rainy window', bpm: 68, root: 55, chords: [[0,3,7,10],[5,8,12,15],[8,12,15,19],[3,7,10,14]], swing: .2, warmth: .78, space: .5, melody: .28, light: 'dusk' },
  night: { label: 'After midnight', bpm: 62, root: 54, chords: [[0,3,7,10],[8,12,15,19],[5,8,12,15],[7,10,14,17]], swing: .23, warmth: .84, space: .6, melody: .23, light: 'night' },
};
export function randomSource(seed) {
  let value=seed>>>0;
  return()=>{value+=0x6D2B79F5;let n=value;n=Math.imul(n^(n>>>15),n|1);n^=n+Math.imul(n^(n>>>7),n|61);return((n^(n>>>14))>>>0)/4294967296;};
}
export const frequency = midi => 440 * 2 ** ((midi-69)/12);
export function stepDuration(bpm, swing, step) { return 60/bpm/4*(1+(step%2?-1:1)*swing); }

// Eight bars: four seventh-chord voicings, repeated with small rhythmic variations.
// Melody uses the current chord tones, so every generated phrase stays harmonic.
export function compose(mood='warm', seed=1) {
  const preset=MOODS[mood]||MOODS.warm, random=randomSource(seed);
  const pattern=Array.from({length:128},()=>[]);
  for(let bar=0;bar<8;bar++) {
    const chord=preset.chords[bar%4].map(n=>n+preset.root), offset=bar*16;
    pattern[offset].push({voice:'keys',notes:chord,duration:3.6,velocity:.8+random()*.15});
    if(bar%2)pattern[offset+10].push({voice:'keys',notes:chord,duration:1.2,velocity:.45});
    [0,6,10].forEach((step,i)=>pattern[offset+step].push({voice:'bass',notes:[chord[i===2?2:0]-24],duration:i===0?1.3:.65,velocity:.7}));
    [0,7,10].forEach(step=>pattern[offset+step].push({voice:'kick',velocity:step===0?.8:.5}));
    [4,12].forEach(step=>pattern[offset+step].push({voice:'snare',velocity:.5+random()*.12}));
    for(let step=0;step<16;step+=2)pattern[offset+step].push({voice:'hat',velocity:.22+random()*.16});
    if(bar%2===1)pattern[offset+15].push({voice:'hat',velocity:.16});
    [3,6,11,14].forEach(step=>{if(random()>.32)pattern[offset+step].push({voice:'melody',notes:[chord[Math.floor(random()*4)]+12],duration:.65+random()*.65,velocity:.45});});
  }
  return pattern;
}

export function sanitizeMix(value={}) {
  const clamp=(v,min,max,fallback)=>Number.isFinite(Number(v))?Math.min(max,Math.max(min,Number(v))):fallback;
  return {mood:MOODS[value.mood]?value.mood:'warm',seed:clamp(value.seed,1,2147483647,1),bpm:clamp(value.bpm,55,95,76),swing:clamp(value.swing,0,.35,.15),warmth:clamp(value.warmth,0,1,.6),space:clamp(value.space,0,.8,.35),keys:clamp(value.keys,0,1,.65),bass:clamp(value.bass,0,1,.5),drums:clamp(value.drums,0,1,.48),melody:clamp(value.melody,0,1,.32),texture:clamp(value.texture,0,1,.12),volume:clamp(value.volume,0,1,.65)};
}
