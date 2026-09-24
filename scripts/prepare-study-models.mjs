import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { resolve } from 'node:path';

// Retain the original models; make browser-sized copies with embedded textures.
const source=resolve('glbfiles'),target=resolve('src/experiments/study/assets');
await mkdir(target,{recursive:true});
for(const name of await readdir(source)) {
  if(!name.endsWith('.glb'))continue;
  const input=await readFile(resolve(source,name));
  if(input.readUInt32LE(0)!==0x46546c67||input.readUInt32LE(4)!==2)throw new Error(`Not GLB 2: ${name}`);
  const jsonLength=input.readUInt32LE(12),json=JSON.parse(input.subarray(20,20+jsonLength).toString());
  const binary=input.subarray(28+jsonLength);
  const replacements=new Map();
  for(const image of json.images||[]) {
    if(image.bufferView===undefined)continue;
    const view=json.bufferViews[image.bufferView];
    const original=binary.subarray(view.byteOffset||0,(view.byteOffset||0)+view.byteLength);
    const decoded=await loadImage(original),factor=Math.min(1,1024/Math.max(decoded.width,decoded.height));
    if(factor===1)continue;
    const canvas=createCanvas(Math.round(decoded.width*factor),Math.round(decoded.height*factor));
    canvas.getContext('2d').drawImage(decoded,0,0,canvas.width,canvas.height);
    replacements.set(image.bufferView,await canvas.encode('png'));image.mimeType='image/png';
  }
  const chunks=[];let offset=0;
  for(let i=0;i<json.bufferViews.length;i++) {
    const view=json.bufferViews[i];
    const data=replacements.get(i)||binary.subarray(view.byteOffset||0,(view.byteOffset||0)+view.byteLength);
    const padding=(4-data.length%4)%4;
    view.byteOffset=offset;view.byteLength=data.length;view.buffer=0;
    chunks.push(data,Buffer.alloc(padding));offset+=data.length+padding;
  }
  json.buffers=[{byteLength:offset}];
  const raw=Buffer.from(JSON.stringify(json)),padded=Buffer.concat([raw,Buffer.alloc((4-raw.length%4)%4,0x20)]);
  const header=Buffer.alloc(20);header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(28+padded.length+offset,8);header.writeUInt32LE(padded.length,12);header.writeUInt32LE(0x4e4f534a,16);
  const binHeader=Buffer.alloc(8);binHeader.writeUInt32LE(offset,0);binHeader.writeUInt32LE(0x004e4942,4);
  const output=Buffer.concat([header,padded,binHeader,...chunks]);await writeFile(resolve(target,name),output);
  console.log(`${name}: ${(input.length/1e6).toFixed(2)} MB → ${(output.length/1e6).toFixed(2)} MB`);
}
