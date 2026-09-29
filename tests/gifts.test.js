import test from 'node:test';
import assert from 'node:assert/strict';
import { deflateSync } from 'node:zlib';
import QRCode from 'qrcode';
import { createCanvas } from '@napi-rs/canvas';
import jsQR from 'jsqr';
import { validateGift, encodeGift, decodeGift } from '../src/experiments/bloom/gift.js';
const gift={version:1,theme:'rosewater',flowers:'peony',style:'basket',title:'For you 🌸',letter:'Thinking of you — మీరు అద్భుతం.',items:[{type:'song',object:'vinyl',label:'A song',url:'https://example.com/song'},{type:'note',object:'envelope',label:'A smile',body:'You belong here.'}]};
test('compressed gift URLs round-trip Unicode, preserve Pages base, and keep edits immutable',async()=>{
 const old=await encodeGift(gift,'https://vishwabelaganti.github.io/personalportfolio/bloom/?mode=qr#old');const url=new URL(old);
 assert.equal(url.pathname,'/personalportfolio/bloom/');assert.equal(url.search,'');assert.match(url.hash,/^#gift=[\w-]+$/);assert.deepEqual(await decodeGift(url.hash),gift);
 const next=await encodeGift({...gift,title:'Changed'},old);assert.notEqual(next,old);assert.equal((await decodeGift(new URL(old).hash)).title,gift.title);
});
test('gift validator rejects dangerous links, unknown versions, oversized content, and too many items',()=>{
 for(const url of ['javascript:alert(1)','data:text/html,hi','https://user:pass@example.com','file:///tmp/file'])assert.throws(()=>validateGift({...gift,items:[{type:'song',label:'Unsafe',url}]}));
 assert.throws(()=>validateGift({...gift,version:2}));assert.throws(()=>validateGift({...gift,letter:'a'.repeat(601)}));assert.throws(()=>validateGift({...gift,items:Array(7).fill(gift.items[0])}));
 assert.throws(()=>validateGift({...gift,items:[{type:'song',label:'Missing'}]}));assert.throws(()=>validateGift({...gift,theme:'__proto__'}));
});
test('decoder rejects broken data and bounded decompression prevents oversized payloads',async()=>{
 await assert.rejects(decodeGift('#gift=broken'));await assert.rejects(decodeGift('#gift=%3Cscript%3E'));
 const bomb=deflateSync(Buffer.from('a'.repeat(100000))).toString('base64url');await assert.rejects(decodeGift('#gift='+bomb),/too large/);assert.equal(await decodeGift('#u=https://example.com'),null);
});
test('gift QR decodes to the complete recipient link',async()=>{
 const url=await encodeGift(gift,'https://vishwabelaganti.github.io/personalportfolio/bloom/');const canvas=createCanvas(1,1);await QRCode.toCanvas(canvas,url,{errorCorrectionLevel:'M',margin:4,scale:6});const data=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height);assert.equal(jsQR(data.data,canvas.width,canvas.height)?.data,url);
});

test('sunflower gifts preserve their appearance in share links',async()=>{const url=await encodeGift({...gift,flowers:'sunflower',theme:'golden',style:'bouquet'},'https://vishwabelaganti.github.io/personalportfolio/bloom/');const restored=await decodeGift(new URL(url).hash);assert.equal(restored.flowers,'sunflower');assert.equal(restored.style,'bouquet');assert.equal(restored.theme,'golden');});
