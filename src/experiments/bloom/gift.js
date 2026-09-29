import { ITEM_TYPES } from './types.js';
// Versioned, self-contained gifts. Nothing is sent to a server.
export const THEMES = {rosewater:['Rosewater','#c57b91','#f8e3e8'],golden:['Golden hour','#ba853a','#fcf0d4'],lavender:['Lavender','#9580b6','#eee7f6'],scarlet:['Scarlet','#b95e63','#f9e2dd'],blue:['Blue hour','#6f96ad','#e3eff5']};
export const FLOWERS = ['peony','rose','dahlia','sunflower'];
export const OBJECTS = {envelope:'✉',vinyl:'◉',ticket:'🎟',charm:'✧',postcard:'▧',tea:'☕',book:'▤',cassette:'▣',film:'▰',article:'▥'};
export const TYPES = ['song','playlist','map','ticket','book','movie','article','note'];
const LINK_TYPES = ['song','playlist','article'];
const text=(value,max,label)=>{if(typeof value!=='string'||value.length>max)throw new Error(`${label} must be at most ${max} characters.`);return value.trim();};
export function validateGift(value){
  if(!value||value.version!==1)throw new Error('This gift version is not supported.');
  if(!Object.hasOwn(THEMES,value.theme)||!FLOWERS.includes(value.flowers))throw new Error('This gift has an unknown flower or palette.');
  const style=value.style??'basket';if(!['box','basket','bouquet'].includes(style))throw new Error('Choose a gift box, basket, or bouquet.');
  const title=text(value.title,80,'Title');if(!title)throw new Error('Give your gift a title.');
  if(!Array.isArray(value.items)||value.items.length>6)throw new Error('Choose up to six little gifts.');
  return {version:1,theme:value.theme,flowers:value.flowers,style,title,letter:text(value.letter,600,'Letter'),items:value.items.map(item=>{
    if(!item||!TYPES.includes(item.type))throw new Error('Unknown gift item.');
    const label=text(item.label,80,'Item label');if(!label)throw new Error('Give each item a label.');
    const object=item.object??(item.type==='note'?'envelope':item.type==='song'||item.type==='playlist'?'vinyl':item.type==='ticket'?'ticket':'book');
    if(!Object.hasOwn(OBJECTS,object))throw new Error('Unknown gift object.');
    const result={type:item.type,label,object};
    if(item.details!==undefined){
      if(!item.details||typeof item.details!=='object'||Array.isArray(item.details))throw new Error('Invalid item details.');
      const details={};for(const [key,label,,max] of ITEM_TYPES[item.type].fields){if(item.details[key])details[key]=text(item.details[key],max,label);}
      if(details.date&&!/^\d{4}-\d{2}-\d{2}$/.test(details.date))throw new Error('Use a valid invitation date.');
      if(details.minutes&&!/^\d{1,3}$/.test(details.minutes))throw new Error('Reading time must be a number of minutes.');
      if(details.year&&!/^\d{4}$/.test(details.year))throw new Error('Use a four-digit movie year.');
      if(Object.keys(details).length)result.details=details;
    }
    if(item.body)result.body=text(item.body,300,'Item note');
    if(item.url){const raw=text(item.url,600,'Item link');let url;try{url=new URL(raw);}catch{throw new Error('Use a complete link beginning with https:// or http://.');}if(!['https:','http:'].includes(url.protocol)||url.username||url.password)throw new Error('Use an http or https link without login details.');result.url=url.href;}
    if(item.type==='map'&&!result.url&&!result.details?.address)throw new Error('Add an address or map link for this place.');
    if(LINK_TYPES.includes(item.type)&&!result.url)throw new Error(`Add a link for your ${item.type}.`);
    return result;
  })};
}
async function transform(bytes,format,max){
  const stream=new Blob([bytes]).stream().pipeThrough(format),reader=stream.getReader();const chunks=[];let size=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max)throw new Error('This gift is too large. Shorten the letter or remove an item.');chunks.push(value);}}finally{await reader.cancel();}
  const result=new Uint8Array(size);let offset=0;for(const chunk of chunks){result.set(chunk,offset);offset+=chunk.length;}return result;
}
export async function encodeGift(value,base){
  if(typeof CompressionStream==='undefined')throw new Error('This browser cannot compress gifts. Try a current browser.');
  const gift=validateGift(value),bytes=await transform(new TextEncoder().encode(JSON.stringify(gift)),new CompressionStream('deflate'),4000);
  const encoded=btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
  const url=new URL(base);url.search='';url.hash=`gift=${encoded}`;
  if(url.href.length>2200)throw new Error('This gift link is too long for easy sharing. Shorten the letter, notes, or links.');
  return url.href;
}
export async function decodeGift(hash){
  const encoded=new URLSearchParams(hash.replace(/^#/, '')).get('gift');if(encoded===null)return null;
  if(!encoded||encoded.length>4000||!/^[\w-]+$/.test(encoded))throw new Error('This gift link is incomplete or damaged.');
  if(typeof DecompressionStream==='undefined')throw new Error('Open this gift in a current browser to unwrap it.');
  try{const binary=atob(encoded.replaceAll('-','+').replaceAll('_','/')),bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));const raw=await transform(bytes,new DecompressionStream('deflate'),16000);return validateGift(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(raw)));}catch(error){throw new Error(`This gift could not be opened. ${error.message}`);}
}
