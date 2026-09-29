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

test('typed gifts keep their own details and support invitations without links',async()=>{
 const items=[{type:'song',label:'A song',url:'https://example.com/song',details:{artist:'An artist',album:'A record',venue:'discard me'}},{type:'playlist',label:'A mixtape',url:'https://example.com/list',details:{curator:'Me',tracks:'Track one\nTrack two'}},{type:'map',label:'Meet here',details:{address:'Central Park, New York'}},{type:'ticket',label:'Coffee together',details:{date:'2026-10-03',time:'10 am CDT',venue:'Our favorite café'}},{type:'book',label:'A good read',details:{author:'An author',quote:'A short line.'}},{type:'movie',label:'Movie night',details:{year:'2020',watch:'At home'}}];
 const link=await encodeGift({...gift,style:'box',items},'https://vishwabelaganti.github.io/personalportfolio/bloom/');const decoded=await decodeGift(new URL(link).hash);
 assert.equal(decoded.style,'box');assert.equal(decoded.items[0].details.artist,'An artist');assert.equal(decoded.items[0].details.venue,undefined);assert.equal(decoded.items[3].details.venue,'Our favorite café');assert.equal(decoded.items[3].url,undefined);
});
test('recipient actions are specific to the item and reject unsafe URLs',async()=>{
 const {recipientLink,detailSummary,ITEM_TYPES}=await import('../src/experiments/bloom/types.js');
 assert.match(recipientLink({type:'map',details:{address:'A & B café'}}),/query=A%20%26%20B%20caf%C3%A9/);assert.equal(recipientLink({type:'song',url:'javascript:alert(1)'}),null);
 assert.equal(detailSummary({type:'book',details:{author:'A writer'}}),'by A writer');assert.notEqual(ITEM_TYPES.song.action,ITEM_TYPES.movie.action);assert.notDeepEqual(ITEM_TYPES.song.fields,ITEM_TYPES.ticket.fields);
 assert.throws(()=>validateGift({...gift,items:[{type:'article',label:'Reading',url:'https://example.com',details:{minutes:'bad'}}]}));
});
