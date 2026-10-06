import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { encodeShare, decodeShare } from '../src/experiments/flowers/qr.js';
const pages=['index.html','projects.html','experience.html','certificates.html','skills.html','playground.html','bloom/index.html','arcade/index.html','study/index.html','404.html'];
test('local page links and source assets resolve, including the flower route', async()=>{
 for(const page of pages){
  const html=await readFile(page,'utf8');
  for(const [,ref] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
   if(/^(https?:|mailto:|data:|#)/.test(ref))continue;
   const pathname=decodeURIComponent(ref.split(/[?#]/)[0]);
   const path=resolve(dirname(page),pathname.endsWith('/')?pathname+'index.html':pathname);
   await assert.doesNotReject(async()=>{try{await access(path);}catch{await access(resolve('public',pathname.replace(/^\.\.\//,'')));}},`${page}: ${ref}`);
  }
 }
});
test('shared bouquets explicitly request the recipient view and preserve GitHub Pages subpaths',()=>{
 const state={url:'https://large-type.com/#I%20LOVE%20YOU',palette:'rosewater',flower:'rose',butterflies:true};
 const url=new URL(encodeShare(state,'https://vishwa12131396.github.io/personalportfolio/bloom/?preview=1'));
 assert.equal(url.pathname,'/personalportfolio/bloom/');
 assert.equal(url.searchParams.get('view'),'gift');
 assert.equal(url.searchParams.has('preview'),false);
 assert.deepEqual(decodeShare(url.hash),state);
});
test('flower experience carries the portfolio identity',async()=>{
 const html=await readFile('bloom/index.html','utf8');
 assert.match(html,/<title>Bloom · Vishwa Belaganti<\/title>/);
 assert.match(html,/\.\.\/playground.html/);
 assert.doesNotMatch(html,/TypingMind|Ann Nguyen|Bloom home|bloom<span/);
});

 test('all portfolio headers expose Skills and Certifications with correct active pages', async () => {
  for (const page of pages.filter(page => page !== 'bloom/index.html')) {
   const html = await readFile(page, 'utf8');
   const nav = html.match(/<nav id="main-nav"[^>]*>(.*?)<\/nav>/s)?.[1];
   assert.ok(nav, `${page} has main navigation`);
   const prefix = page.includes('/') ? '../' : '';
   for (const [route, label] of [['skills.html', 'Skills'], ['certificates.html', 'Certifications']]) {
    assert.ok(nav.includes(`href="${prefix}${route}"`), `${page} links to ${label}`);
    if (page === route) assert.ok(nav.includes(`href="${route}" aria-current="page">${label}`));
   }
  }
 });
