import QRCode from 'qrcode';
export const PALETTES = {
  rosewater: { name:'Rosewater', petals:['#dc8c9e','#edafb9','#f4c9cb','#c66a88','#f0b8ad'], dark:'#72354d', leaf:'#647947', butterfly:'#df996f' },
  golden: { name:'Golden hour', petals:['#e7a54e','#f4c67a','#ffdb9d','#cf802e','#ecb251'], dark:'#784920', leaf:'#70804a', butterfly:'#b96249' },
  lavender: { name:'Lavender', petals:['#aa90cc','#c9b8e2','#e0d2ed','#9478b5','#bda5d6'], dark:'#53436d', leaf:'#658064', butterfly:'#d8b071' },
  scarlet: { name:'Scarlet', petals:['#cc5c60','#e0847b','#f0a18e','#a9344b','#d66c6e'], dark:'#712c38', leaf:'#657943', butterfly:'#efbe75' },
  blue: { name:'Blue hour', petals:['#729dbb','#a3c9d9','#c2dce5','#587f9e','#86b3c8'], dark:'#304f67', leaf:'#6a8267', butterfly:'#d7a276' }
};
export const FLOWERS = { rose:'Rosa · garden rose', peony:'Paeonia · garden peony', dahlia:'Dahlia · café au lait' };
export function normalizeUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) throw new Error('Add a link to tuck into your bouquet.');
  if (trimmed.length > 1000) throw new Error('Use a link shorter than 1,000 characters.');
  const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`);
  if (!['https:','http:'].includes(url.protocol) || !url.hostname || url.username || url.password) throw new Error('Please use a valid http or https link without login details.');
  if (url.href.length > 1000) throw new Error('Use a shorter link for a clearer floral QR.');
  return url.href;
}
export function createCode(url) { return QRCode.create(url, { errorCorrectionLevel:'H' }); }
export function encodeShare(state, base) {
  const result = new URL(base); result.searchParams.delete('preview'); result.searchParams.set('view','gift'); result.hash = new URLSearchParams({ u:state.url, p:state.palette, f:state.flower, b:state.butterflies ? '1':'0' }).toString(); return result.href;
}
export function decodeShare(hash) {
  const p = new URLSearchParams(hash.replace(/^#/,''));
  if (!p.has('u')) return null;
  return { url: normalizeUrl(p.get('u')), palette: Object.hasOwn(PALETTES,p.get('p')) ? p.get('p'):'rosewater', flower: Object.hasOwn(FLOWERS,p.get('f')) ? p.get('f'):'rose', butterflies:p.get('b') !== '0' };
}
// Keep every function module untouched, including timing, alignment and format bits.
export function isReserved(code,row,col) { return !!code.modules.reservedBit[row*code.modules.size+col]; }
export function drawQR(canvas, code, palette, flower='rose', cell=32) {
  const n=code.modules.size, margin=4;
  canvas.width=canvas.height=(n+margin*2)*cell;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);
  for(let r=0;r<n;r++)for(let c=0;c<n;c++) {
    if(!code.modules.get(r,c))continue;
    const x=(c+margin)*cell,y=(r+margin)*cell;
    ctx.fillStyle=palette.dark;ctx.fillRect(x,y,cell,cell);
    if(isReserved(code,r,c))continue;
    // Low-contrast petals stay wholly inside dark modules so scanners still see a solid cell.
    const count=flower==='dahlia'?9:flower==='peony'?7:6;
    ctx.save();ctx.translate(x+cell/2,y+cell/2);
    for(let p=0;p<count;p++) {
      ctx.rotate(Math.PI*2/count);ctx.beginPath();
      ctx.ellipse(0,-cell*.19,cell*.115,cell*.20,0,0,Math.PI*2);
      ctx.fillStyle=blendHex(palette.dark,palette.petals[(r+c)%palette.petals.length],.09);ctx.fill();
    }
    ctx.beginPath();ctx.arc(0,0,cell*.095,0,Math.PI*2);ctx.fillStyle=blendHex(palette.dark,'#f5cb82',.09);ctx.fill();ctx.restore();
  }
  return canvas;
}
function blendHex(a,b,t){const c=[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t));return '#'+c.map(v=>v.toString(16).padStart(2,'0')).join('');}
