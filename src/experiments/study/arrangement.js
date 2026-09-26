import { compose, MOODS, randomSource } from './composition.js';

export const TUNES = {
  velvet: { label: 'Velvet keys', rhythm: [0, 7, 12], melody: [2, 6, 10, 14], order: [0, 2, 1, 3] },
  drift: { label: 'Slow drift', rhythm: [0], melody: [3, 11], order: [3, 2] },
  bloom: { label: 'Petal dance', rhythm: [0, 6, 10], melody: [0, 3, 6, 9, 12, 15], order: [0, 1, 2, 3, 2, 1] },
  midnight: { label: 'Midnight steps', rhythm: [0, 10], melody: [1, 7, 10, 14], order: [3, 1, 2, 0] },
  jazz: { label: 'Jazz pocket', rhythm: [0, 6, 11], melody: [3, 7, 10, 14], order: [2, 3, 1, 0], chordVoice:'rhodes', leadVoice:'sax' },
  guitar: { label: 'Guitar sunset', rhythm: [0, 4, 8, 12], melody: [2, 5, 9, 13], order: [0, 2, 1, 3], chordVoice:'guitar', leadVoice:'guitar', arpeggio:true },
  rhodes: { label: 'Rhodes lounge', rhythm: [0, 7, 10, 14], melody: [4, 12], order: [3, 1], chordVoice:'rhodes', leadVoice:'melody' },
  sax: { label: 'Sax interlude', rhythm: [0, 10], melody: [1, 4, 8, 11, 15], order: [1, 2, 3, 2, 0], chordVoice:'rhodes', leadVoice:'sax' },
};
export const LANES = ['keys','rhodes','guitar','sax','bass','melody','kick','snare','hat'];
export function makeBar(mood, seed, tune='velvet', chordIndex=0) {
  const preset=MOODS[mood]||MOODS.warm, recipe=TUNES[tune]||TUNES.velvet;
  const chord=preset.chords[chordIndex%4].map(n=>n+preset.root);
  const pitched=['keys','rhodes','guitar','sax','melody'],bar=compose(mood,seed).slice(chordIndex*16,chordIndex*16+16).map(events=>events.filter(e=>![...pitched,'kick','hat'].includes(e.voice)));
  const kicks={velvet:[0,7,10],drift:[0,10],bloom:[0,6,11,14],midnight:[0,3,10],jazz:[0,6,10],guitar:[0,10],rhodes:[0,7,10],sax:[0,10]}[tune]||[0,10];
  kicks.forEach(step=>bar[step].push({voice:'kick',velocity:step===0?.8:.5}));
  for(let step=0;step<16;step+=tune==='drift'?4:2)bar[step].push({voice:'hat',velocity:step%4===0?.3:.18});
  recipe.rhythm.forEach((step,i)=>bar[step].push({voice:recipe.chordVoice||'keys',notes:recipe.arpeggio?[chord[i%4]]:chord,duration:recipe.arpeggio?.75:1.7,velocity:.7}));
  recipe.melody.forEach((step,i)=>bar[step].push({voice:recipe.leadVoice||'melody',notes:[chord[recipe.order[i%recipe.order.length]]+(recipe.leadVoice==='guitar'?0:12)],duration:recipe.leadVoice==='sax'?1.15:.7,velocity:.5}));
  return bar;
}
export function newArrangement(mood,seed) {
  const tunes=Object.keys(TUNES),random=randomSource(seed),progression=Array.from({length:4},()=>Math.floor(random()*4));
  return Array.from({length:8},(_,i)=>makeBar(mood,seed+i,tunes[Math.floor(random()*tunes.length)],progression[i%4])).flat();
}
export function validArrangement(value) {
  return Array.isArray(value)&&value.length===128&&value.every(events=>Array.isArray(events)&&events.length<=12&&events.every(e=>e&&LANES.includes(e.voice)&&Number.isFinite(e.velocity)&&e.velocity>=0&&e.velocity<=1&&(!e.notes||(Array.isArray(e.notes)&&e.notes.length<=4&&e.notes.every(n=>Number.isFinite(n)&&n>=24&&n<=108)&&Number.isFinite(e.duration)&&e.duration>0&&e.duration<=8))));
}
