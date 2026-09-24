import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { PALETTES, drawQR, isReserved } from './qr.js';
const TAU=Math.PI*2;
const clamp=THREE.MathUtils.clamp;
const smooth=(a,b,t)=>{const x=clamp((t-a)/(b-a),0,1);return x*x*(3-2*x);};
const rand=i=>{const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v);};
function petalGeometry(kind='rose') {
  const pos=[],uv=[],indices=[],colors=[];const rows=9,cols=8;
  for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){
    const t=j/rows,u=i/cols*2-1;
    const width=Math.pow(Math.sin(Math.PI*t),kind==='dahlia'?.9:.58)*(kind==='peony'?.63:.56);
    const x=u*width;
    const y=t;
    const z=.33*Math.sin(t*Math.PI*.9)+.23*u*u*Math.sin(t*Math.PI)-.16*Math.pow(t,5)+Math.sin(u*9+t*15)*.018*t;
    pos.push(x,y,z);uv.push(i/cols,t);
    const shade=.74+.26*t-.05*Math.abs(u);colors.push(shade,shade,shade);
    if(j<rows&&i<cols){const a=j*(cols+1)+i,b=a+cols+1;indices.push(a,b,a+1,b,b+1,a+1);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
function leafGeometry(){const g=petalGeometry('dahlia');g.scale(.55,1.2,.7);return g;}
function wingGeometry(){const s=new THREE.Shape();s.moveTo(0,0);s.bezierCurveTo(.12,.40,.49,.45,.48,.18);s.bezierCurveTo(.51,-.01,.26,-.04,.18,-.08);s.bezierCurveTo(.48,-.12,.38,-.43,.19,-.30);s.bezierCurveTo(.05,-.22,.04,-.08,0,0);const g=new THREE.ShapeGeometry(s,20);return g;}
export class BloomScene {
 constructor(container,code,state,onToggle) {
  this.container=container;this.state=state;this.code=code;this.progress=0;this.target=0;this.reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;this.motion=!this.reducedMotion;this.butterfliesEnabled=state.butterflies;this.flowerKind=state.flower;this.lastFrame=0;this.time=0;this.dragRotation=0;this.currentRotation=0;this.needsUpdate=true;this.onToggle=onToggle;
  this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance',preserveDrawingBuffer:false});
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.45;
  container.appendChild(this.renderer.domElement);
  this.scene=new THREE.Scene();this.camera=new THREE.OrthographicCamera(-5,5,5,-5,.1,100);this.camera.position.set(0,.8,18);this.camera.lookAt(0,.8,0);
  this.scene.add(new THREE.HemisphereLight(0xfff8ed,0x718060,2.5));const sun=new THREE.DirectionalLight(0xffecda,3.4);sun.position.set(-4,8,8);this.scene.add(sun);const fill=new THREE.DirectionalLight(0xf6f0ff,1.9);fill.position.set(6,3,-2);this.scene.add(fill);
  this.bouquet=new THREE.Group();this.scene.add(this.bouquet);
  this.makeVase();this.makeFoliage();this.makeButterflies();this.buildFlowers(code);this.updateQR(code);
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(container);this.resize();
  let down=null;
  container.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,start:this.dragRotation};container.setPointerCapture(e.pointerId);});
  container.addEventListener('pointermove',e=>{if(down&&this.target===0){this.dragRotation=down.start+(e.clientX-down.x)*.006;}});
  container.addEventListener('pointerup',e=>{if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<5)this.onToggle();down=null;});
  container.addEventListener('pointercancel',()=>down=null);
  container.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();this.onToggle();}});
  this.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();container.dispatchEvent(new CustomEvent('renderlost'));});
  this.frame=this.frame.bind(this);this.raf=requestAnimationFrame(this.frame);
 }
 resize(){const w=this.container.clientWidth,h=this.container.clientHeight;this.renderer.setSize(w,h);const aspect=w/h;const height=new URLSearchParams(location.search).get('preview')==='1'?7.7:9.6;this.camera.left=-height*aspect/2;this.camera.right=height*aspect/2;this.camera.top=height/2;this.camera.bottom=-height/2;this.camera.updateProjectionMatrix();this.centerX=new URLSearchParams(location.search).get('preview')==='1'?0:aspect>1?.45:.28;this.scene.position.x=this.centerX;this.scene.position.y=.35;this.needsUpdate=true;}
 makeVase(){
  this.vase=new THREE.Group();this.bouquet.add(this.vase);
  const profile=[];for(let i=0;i<=60;i++){const t=i/60;const radius=.53+.18*Math.sin(t*Math.PI*.94)+.035*Math.cos(t*Math.PI*2);profile.push(new THREE.Vector2(radius,-2.75+t*1.85));}
  const geo=new THREE.LatheGeometry(profile,128);const p=geo.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),a=Math.atan2(z,x);const factor=1+.021*Math.cos(a*40);p.setXYZ(i,x*factor,p.getY(i),z*factor);}geo.computeVertexNormals();
  const mat=new THREE.MeshStandardMaterial({color:0xebe5d8,roughness:.32,metalness:.06});const body=new THREE.Mesh(geo,mat);this.vase.add(body);
  const lip=new THREE.Mesh(new THREE.TorusGeometry(.578,.035,12,100),mat);lip.rotation.x=Math.PI/2;lip.position.y=-.9;this.vase.add(lip);
  const water=new THREE.Mesh(new THREE.CircleGeometry(.54,64),new THREE.MeshStandardMaterial({color:0x515945,roughness:.32}));water.rotation.x=-Math.PI/2;water.position.y=-.935;this.vase.add(water);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(.57,.57,.08,80),mat);base.position.y=-2.72;this.vase.add(base);
  const ribbon=new THREE.Mesh(new THREE.CylinderGeometry(.705,.68,.11,96,1,true),new THREE.MeshStandardMaterial({color:0xa2a989,roughness:.75}));ribbon.position.y=-1.65;this.vase.add(ribbon);
  // A soft contact shadow, separate from the QR's clean white presentation.
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const ctx=shadowCanvas.getContext('2d');const grad=ctx.createRadialGradient(64,64,0,64,64,64);grad.addColorStop(0,'rgba(63,68,48,.24)');grad.addColorStop(.4,'rgba(63,68,48,.12)');grad.addColorStop(1,'rgba(63,68,48,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,128,128);
  this.shadow=new THREE.Mesh(new THREE.PlaneGeometry(4.4,1),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));this.shadow.position.set(0,-2.9,-.4);this.bouquet.add(this.shadow);
 }
 makeFoliage(){
  this.foliage=new THREE.Group();this.bouquet.add(this.foliage);const stems=[];
  const leafMat=new THREE.MeshStandardMaterial({color:0x69844e,roughness:.8,side:THREE.DoubleSide,vertexColors:true});this.leafMaterial=leafMat;
  this.leaves=new THREE.InstancedMesh(leafGeometry(),leafMat,160);const d=new THREE.Object3D();
  for(let i=0;i<32;i++){
   const a=i*2.39996;const r=1.45+rand(i)*.85;const y=.0+rand(i+90)*1.4;
   const end=new THREE.Vector3(Math.cos(a)*r,y,Math.sin(a)*r*.65);
   const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(Math.cos(a)*.2,-1.8,Math.sin(a)*.2),new THREE.Vector3(end.x*.45,y*.55-.2,end.z*.5),end);
   stems.push(new THREE.TubeGeometry(curve,12,.012+rand(i)*.009,5,false));
   for(let j=0;j<5;j++){
    const t=.46+j*.13;const point=curve.getPoint(t);d.position.copy(point);d.rotation.set(-.1+rand(i+j)*.8,a+(j%2)*Math.PI,.6*(j%2?1:-1));d.scale.setScalar(.39+rand(i*5+j)*.25);d.updateMatrix();this.leaves.setMatrixAt(i*5+j,d.matrix);
   }
  }
  this.foliage.add(this.leaves);const merged=mergeGeometries(stems);stems.forEach(g=>g.dispose());this.foliage.add(new THREE.Mesh(merged,new THREE.MeshStandardMaterial({color:0x658045,roughness:.9})));
 }
 makeButterflies(){
  this.butterflies=[];const geom=wingGeometry();
  for(let i=0;i<5;i++){
   const butterfly=new THREE.Group();const mat=new THREE.MeshStandardMaterial({color:0xe6b276,side:THREE.DoubleSide,roughness:.65});
   const right=new THREE.Group(),left=new THREE.Group();
   for(const [group,sign] of [[right,1],[left,-1]]){
    const wing=new THREE.Mesh(geom,mat);wing.scale.x=sign;group.add(wing);
    // Fine dark veins and cream eye spots give the wings an organic silhouette.
    const veinMat=new THREE.LineBasicMaterial({color:0x855947,transparent:true,opacity:.5});
    for(let j=0;j<4;j++){const dest=new THREE.Vector3(sign*(.22+j*.065),.3-j*.16,.006);const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,.008),dest]),veinMat);group.add(line);}
    for(let j=0;j<4;j++){const dot=new THREE.Mesh(new THREE.CircleGeometry(.018,8),new THREE.MeshBasicMaterial({color:0xffebc8,side:THREE.DoubleSide}));dot.position.set(sign*(.32+.025*Math.sin(j)),.27-j*.15,.01);group.add(dot);}
    butterfly.add(group);
   }
   const body=new THREE.Mesh(new THREE.CapsuleGeometry(.018,.24,4,6),new THREE.MeshStandardMaterial({color:0x4b4438}));butterfly.add(body);
   butterfly.scale.setScalar(.35+rand(i)*.2);this.scene.add(butterfly);this.butterflies.push({group:butterfly,left,right,mat,offset:i*1.65});
  }
 }
 buildFlowers(code){
  if(this.petals){this.bouquet.remove(this.petals);this.petals.geometry.dispose();this.petals.material.dispose();}
  this.code=code;this.flowers=[];const n=code.modules.size,unit=6.1/(n+8);
  for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(code.modules.get(r,c)&&!isReserved(code,r,c))this.flowers.push({r,c});
  // Spatially shuffle destinations so the bouquet unravels in a flowing, interlaced arc.
  this.flowers.sort((a,b)=>rand(a.r*101+a.c)-rand(b.r*101+b.c));
  this.flowers=this.flowers.slice(0,700);
  const visible=Math.min(85,this.flowers.length);
  this.visibleFlowers=visible;
  this.flowers.forEach((f,i)=>{
   const k=i%visible;const theta=k*2.399963;const t=(k+.5)/visible;const y=1-1.75*t;const rad=Math.sqrt(1-y*y);
   f.home=new THREE.Vector3(Math.cos(theta)*rad*1.95,.85+y*1.63,Math.sin(theta)*rad*1.38);
   f.homeSize=i<visible?.34+rand(i+50)*.16:.0001;
   f.rotation=new THREE.Quaternion().setFromEuler(new THREE.Euler(-.25-f.home.y*.14,f.home.x*.37,rand(i)*TAU));
   f.dest=new THREE.Vector3((cFor(f)+4.5)*unit-3.05,3.05-(f.r+4.5)*unit+.55,.32);
   f.qrSize=unit*.45;f.phase=rand(i+12);f.color=Math.floor(rand(i+2)*5);
  });
  this.localPetals=[];const layers=this.flowerKind==='peony'?5:this.flowerKind==='dahlia'?5:4;
  const d=new THREE.Object3D();
  for(let ring=0;ring<layers;ring++){
   const count=this.flowerKind==='dahlia'?12:10;
   for(let j=0;j<count;j++){
    const a=j/count*TAU+ring*.39;const radius=.27-ring*.044;const length=(this.flowerKind==='dahlia'?.75:.9)-ring*.135;
    d.position.set(Math.sin(a)*radius,Math.cos(a)*radius,ring*.11);
    d.rotation.set(.22+ring*.24,0,-a);
    d.scale.set(this.flowerKind==='dahlia'?.56:1,length/.9,length/.9);d.scale.multiplyScalar(length);
    d.updateMatrix();this.localPetals.push(d.matrix.clone());
   }
  }
  this.petals=new THREE.InstancedMesh(petalGeometry(this.flowerKind),new THREE.MeshStandardMaterial({roughness:.59,metalness:0,side:THREE.DoubleSide,vertexColors:true}),this.flowers.length*this.localPetals.length);
  this.petals.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.petals.frustumCulled=false;this.bouquet.add(this.petals);this.setPalette(this.state.palette);this.needsUpdate=true;
 }
 updateQR(code){
  const canvas=document.createElement('canvas');drawQR(canvas,code,PALETTES[this.state.palette],this.flowerKind,24);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.NearestFilter;texture.generateMipmaps=false;
  if(!this.qr){this.qr=new THREE.Mesh(new THREE.PlaneGeometry(6.1,6.1),new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity:0,depthWrite:false,toneMapped:false}));this.qr.position.set(0,.55,.25);this.scene.add(this.qr);}else{this.qr.material.map.dispose();this.qr.material.map=texture;this.qr.material.needsUpdate=true;}
 }
 setPalette(key){
  this.state.palette=key;const palette=PALETTES[key];const col=new THREE.Color();
  if(this.petals){this.flowers.forEach((f,i)=>{for(let p=0;p<this.localPetals.length;p++){col.set(palette.petals[f.color]);col.multiplyScalar(.87+rand(i*73+p)*.19);this.petals.setColorAt(i*this.localPetals.length+p,col);}});this.petals.instanceColor.needsUpdate=true;}
  this.leafMaterial.color.set(palette.leaf);this.butterflies?.forEach(b=>b.mat.color.set(palette.butterfly));if(this.qr)this.updateQR(this.code);this.needsUpdate=true;
 }
 setFlower(kind){this.flowerKind=kind;this.buildFlowers(this.code);this.updateQR(this.code);}
 setCode(code){this.buildFlowers(code);this.updateQR(code);}
 toggle(show){this.target=show?1:0;this.needsUpdate=true;}
 updatePetals(){
  const d=new THREE.Object3D(),m=new THREE.Matrix4(),identity=new THREE.Quaternion();const p=this.progress;
  this.flowers.forEach((f,i)=>{
   const t=smooth(f.phase*.2,.76+f.phase*.2,p);const arc=Math.sin(t*Math.PI);
   d.position.lerpVectors(f.home,f.dest,t);d.position.x+=Math.sin(f.phase*TAU)*arc*.8;d.position.y+=arc*(.6+f.phase*.8);d.position.z+=arc*(1+f.phase*1.6);
   d.quaternion.copy(f.rotation).slerp(identity,t);d.rotateZ(arc*(f.phase-.5)*2);
   const size=THREE.MathUtils.lerp(f.homeSize,f.qrSize,t)*(1-smooth(.87,1,p));d.scale.setScalar(Math.max(.00001,size));d.updateMatrix();
   for(let j=0;j<this.localPetals.length;j++){m.multiplyMatrices(d.matrix,this.localPetals[j]);this.petals.setMatrixAt(i*this.localPetals.length+j,m);}
  });this.petals.instanceMatrix.needsUpdate=true;
  this.petals.count=p===0?this.visibleFlowers*this.localPetals.length:p===1?0:this.flowers.length*this.localPetals.length;
 }
 frame(now){
  this.raf=requestAnimationFrame(this.frame);if(document.hidden||this.previewVisible===false){this.lastFrame=now;return;}
  const dt=Math.min((now-(this.lastFrame||now))/1000,.05);this.lastFrame=now;if(this.motion)this.time+=dt;
  if(this.progress!==this.target){const step=dt/(this.reducedMotion?.15:2.8);this.progress=this.target>this.progress?Math.min(this.target,this.progress+step):Math.max(this.target,this.progress-step);this.needsUpdate=true;}
  if(this.needsUpdate){this.updatePetals();this.needsUpdate=false;}
  const p=this.progress;
  this.currentRotation=THREE.MathUtils.lerp(this.currentRotation,this.dragRotation,.07);
  this.bouquet.rotation.y=(this.currentRotation+Math.sin(this.time*.2)*.035)*(1-smooth(0,.5,p));
  this.vase.scale.setScalar(Math.max(.001,1-smooth(.03,.55,p)));this.vase.position.y=-smooth(.03,.55,p)*.7;
  this.foliage.scale.setScalar(Math.max(.001,1-smooth(0,.6,p)));this.shadow.material.opacity=1-smooth(.05,.5,p);
  this.qr.material.opacity=smooth(.58,.95,p);
  this.butterflies.forEach((b,i)=>{
   b.group.visible=this.butterfliesEnabled;
   const t=this.time*.37+b.offset;const spread=2.65+p*.65;
   b.group.position.set(Math.sin(t)*spread,1.1+Math.sin(t*1.6+i)*1.85,1.6+Math.cos(t)*.7);
   b.group.rotation.set(Math.sin(t)*.3,Math.sin(t*.9)*.7,Math.cos(t)*.3);
   const flap=Math.sin(this.time*10+i)*.85;b.left.rotation.y=flap;b.right.rotation.y=-flap;
   b.group.scale.setScalar((.35+rand(i)*.2)*(1-smooth(.55,.9,p)*.45));
   // Keep the QR's quiet zone free of moving decorations.
   if(p>.8){b.group.position.x=Math.sign(Math.sin(t)||1)*(3.55+Math.abs(Math.sin(t))*.25);}
  });
  this.renderer.render(this.scene,this.camera);
 }
 dispose(){cancelAnimationFrame(this.raf);this.resizeObserver.disconnect();this.scene.traverse(o=>{o.geometry?.dispose();if(o.material){const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>{m.map?.dispose();m.dispose();});}});this.renderer.dispose();}
}
function cFor(f){return f.c;}
