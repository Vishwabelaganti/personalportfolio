import test from 'node:test';
import assert from 'node:assert/strict';
import { createCanvas } from '@napi-rs/canvas';
import jsQR from 'jsqr';
import { normalizeUrl, createCode, encodeShare, decodeShare, drawQR, PALETTES, FLOWERS } from '../src/qr.js';
test('destinations are normalized and unsafe protocols rejected',()=>{
 assert.equal(normalizeUrl('example.com/hello?x=1'),'https://example.com/hello?x=1');
 for(const url of ['javascript:alert(1)','data:text/html,hello','file:///etc/passwd','https://user:secret@example.com',''])assert.throws(()=>normalizeUrl(url));
});
test('share URLs preserve destinations, Unicode and appearances',()=>{
 const state={url:normalizeUrl('https://example.com/?message=flowers 🌸&to=you#hello'),palette:'lavender',flower:'peony',butterflies:false};
 const shared=encodeShare(state,'https://bloom.example/');assert.deepEqual(decodeShare(new URL(shared).hash),state);
 assert.equal(decodeShare('#u=https%3A%2F%2Fexample.com&p=unknown&f=unknown').palette,'rosewater');
});
for(const [paletteKey,palette] of Object.entries(PALETTES))for(const flower of Object.keys(FLOWERS)){
 test(`${paletteKey} ${flower} export decodes at full and display resolution`,()=>{
  const url='https://example.com/a-little-wonder?from=Vishwa&message=hello%20flowers';
  const code=createCode(url);const canvas=createCanvas(1,1);drawQR(canvas,code,palette,flower,40);
  for(const size of [canvas.width,420]){
   const reduced=createCanvas(size,size),ctx=reduced.getContext('2d');ctx.drawImage(canvas,0,0,size,size);const pixels=ctx.getImageData(0,0,size,size);const decoded=jsQR(pixels.data,size,size);assert.equal(decoded?.data,url);
  }
 });
}
test('long destination remains decodable',()=>{
 const url='https://example.com/?note='+('flowers'.repeat(100));const code=createCode(url);const canvas=createCanvas(1,1);drawQR(canvas,code,PALETTES.rosewater,'rose',12);const ctx=canvas.getContext('2d');assert.equal(jsQR(ctx.getImageData(0,0,canvas.width,canvas.height).data,canvas.width,canvas.height)?.data,url);
});
