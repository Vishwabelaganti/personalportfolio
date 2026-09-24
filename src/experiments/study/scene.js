import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { loadStudyModels, placeModel, disposeModels } from './models.js';
const moods={day:{sky:0xdde7e6,fog:0xdde7e6,sun:0xffecd0,light:2.5,ambient:2.1,wood:0x8c7860},dusk:{sky:0xcebbcd,fog:0xcebbcd,sun:0xffc995,light:1.5,ambient:1.55,wood:0x8a6854},night:{sky:0x25334b,fog:0x25334b,sun:0x8badd6,light:.45,ambient:.65,wood:0x554b4d}};
export class StudyScene {
 constructor(container,onChime){
  this.container=container;this.onChime=onChime;this.wind=.35;this.rain=0;this.time=0;this.last=0;this.motion=!matchMedia('(prefers-reduced-motion: reduce)').matches;
  this.renderer=new THREE.WebGLRenderer({antialias:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.15;container.appendChild(this.renderer.domElement);
  this.scene=new THREE.Scene();this.scene.fog=new THREE.Fog(0xcebbcd,12,45);this.camera=new THREE.PerspectiveCamera(43,1,.1,100);this.camera.position.set(0,2.9,8.7);this.camera.lookAt(0,1.65,-.6);
  this.ambient=new THREE.HemisphereLight(0xffe6d2,0x4d6564,1.5);this.scene.add(this.ambient);this.sunLight=new THREE.DirectionalLight(0xffc995,2);this.sunLight.position.set(-8,12,7);this.scene.add(this.sunLight);
  this.wood=new THREE.MeshStandardMaterial({color:0x8a6854,roughness:.85});this.darkWood=new THREE.MeshStandardMaterial({color:0x514a40,roughness:.8});this.stone=new THREE.MeshStandardMaterial({color:0x899696,roughness:1});this.brass=new THREE.MeshStandardMaterial({color:0xc2a975,metalness:.7,roughness:.32});this.lights=[];this.chimes=[];this.hitMeshes=[];
  this.sway=[];this.disposed=false;this.visible=true;this.buildWorld();this.setMood('dusk');this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(container);
  this.camera.position.set(0,3.7,12.8);this.camera.lookAt(0,2.6,-2);
  const room=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(this.renderer);this.environment=pmrem.fromScene(room,.04);this.scene.environment=this.environment.texture;this.scene.environmentIntensity=.45;room.dispose();pmrem.dispose();
  this.intersection=new IntersectionObserver(([entry])=>{this.visible=entry.isIntersecting;});this.intersection.observe(container);
  this.ready=this.installModels();
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  this.pick=e=>{const r=container.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,this.camera);const hit=raycaster.intersectObjects(this.hitMeshes)[0];if(hit)this.onChime(hit.object.userData.note);};
  container.addEventListener('pointerdown',this.pick);this.frame=this.frame.bind(this);this.raf=requestAnimationFrame(this.frame);
 }
 mesh(geometry,material,x,y,z,group=this.scene){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);group.add(m);return m;}
 buildWorld(){
  // Terrace boards, pavilion posts, and a small water garden.
  for(let i=0;i<20;i++)this.mesh(new THREE.BoxGeometry(.47,.12,7),this.wood,-4.75+i*.5,-.06,1.4);
  [-4.15,4.15].forEach(x=>{this.mesh(new THREE.BoxGeometry(.24,5,.24),this.darkWood,x,2.45,-.4);this.mesh(new THREE.BoxGeometry(.45,.18,.45),this.stone,x,.03,-.4);});
  this.fallbackBeam=this.mesh(new THREE.BoxGeometry(9.8,.28,.42),this.darkWood,0,4.65,-.4);
  this.mesh(new THREE.BoxGeometry(9.6,.2,.35),this.wood,0,.52,-2.05);
  for(let i=0;i<17;i++)this.mesh(new THREE.BoxGeometry(.06,.48,.06),this.darkWood,-4+i*.5,.25,-2.05);
  const water=this.mesh(new THREE.PlaneGeometry(70,70),new THREE.MeshStandardMaterial({color:0x84a6a5,roughness:.32,metalness:.25}),0,-.35,-17);water.rotation.x=-Math.PI/2;this.water=water;
  const colors=[0x829b9f,0x9aafb0,0xafb8bc];
  for(let i=0;i<14;i++){const mat=new THREE.MeshStandardMaterial({color:colors[i%3],flatShading:true,roughness:1});const mountain=this.mesh(new THREE.ConeGeometry(3.7,8+(i%4)*2.5,5),mat,-22+i*3.6,2,-19-(i%3)*5);mountain.scale.set(1.4,1,1);mountain.rotation.y=i*.83;}
  this.sun=this.mesh(new THREE.SphereGeometry(1.3,32,16),new THREE.MeshBasicMaterial({color:0xffdbc2}),-7,8,-25);
  // Two warm paper lanterns flank the view.
  this.fallbackLamps=new THREE.Group();this.scene.add(this.fallbackLamps);
  [-3.0,3.0].forEach(x=>{const mat=new THREE.MeshStandardMaterial({color:0xffdeb2,emissive:0xffbd78,emissiveIntensity:1.2,roughness:.9});this.mesh(new THREE.SphereGeometry(.36,24,18),mat,x,3.64,-.4,this.fallbackLamps).scale.y=1.25;const light=new THREE.PointLight(0xffcc8a,5,8);light.position.set(x,3.64,-.1);this.scene.add(light);this.lights.push({light,material:mat});});
  // Five separately playable hollow brass chimes, suspended from a wooden rail.
  this.mesh(new THREE.BoxGeometry(2.65,.14,.3),this.wood,0,4.25,.9);
  [-1.1,1.1].forEach(x=>{const cord=new THREE.LineCurve3(new THREE.Vector3(x,4.25,.9),new THREE.Vector3(x,5.15,-.4));this.mesh(new THREE.TubeGeometry(cord,1,.009,5,false),this.darkWood,0,0,0);});
  for(let i=0;i<5;i++){const pivot=new THREE.Group();pivot.position.set((i-2)*.48,4.18,.9);this.scene.add(pivot);const length=1.1+i*.12;this.mesh(new THREE.CylinderGeometry(.006,.006,.62,5),this.darkWood,0,-.31,0,pivot);const tube=this.mesh(new THREE.CylinderGeometry(.075,.075,length,18,1,true),this.brass,0,-.62-length/2,0,pivot);tube.userData.note=i;this.hitMeshes.push(tube);const ring=this.mesh(new THREE.TorusGeometry(.075,.008,5,18),this.brass,0,-.62-length,0,pivot);ring.rotation.x=Math.PI/2;this.chimes.push({pivot,energy:0,phase:i*.75});}
  const clapper=this.mesh(new THREE.SphereGeometry(.11,16,8),this.wood,0,2.33,1.07);const sail=this.mesh(new THREE.BoxGeometry(.18,.35,.015),this.wood,0,1.8,1.07);this.sail=sail;this.mesh(new THREE.CylinderGeometry(.007,.007,.65,5),this.darkWood,0,2.03,1.07);
  // Bamboo at the edge of the terrace.
  const leafMat=new THREE.MeshStandardMaterial({color:0x6d8460,side:THREE.DoubleSide,roughness:.9});
  for(let i=0;i<8;i++){const x=3.7+Math.sin(i)*.5,z=-1.5+Math.cos(i)*.6,h=2.4+(i%3)*.45;this.mesh(new THREE.CylinderGeometry(.025,.035,h,7),leafMat,x,h/2,z);for(let j=0;j<4;j++){const leaf=this.mesh(new THREE.SphereGeometry(.17,7,5),leafMat,x+(j%2?-.16:.16),h*.5+j*.25,z);leaf.scale.set(1.5,.12,.45);leaf.rotation.z=(j%2?1:-1)*.45;}}
  const rainPositions=new Float32Array(600*3);for(let i=0;i<600;i++){rainPositions[i*3]=(Math.random()-.5)*16;rainPositions[i*3+1]=Math.random()*10;rainPositions[i*3+2]=-3-Math.random()*12;}const rainGeometry=new THREE.BufferGeometry();rainGeometry.setAttribute('position',new THREE.BufferAttribute(rainPositions,3));this.rainPoints=new THREE.Points(rainGeometry,new THREE.PointsMaterial({color:0xdce6f0,size:.025,transparent:true,opacity:.65}));this.scene.add(this.rainPoints);
 }
 async installModels(){
  const status=document.querySelector('#scene-load-status');
  const models=await loadStudyModels((done,total)=>{if(status)status.textContent=`Arranging the courtyard · ${done}/${total}`;});
  if(this.disposed){Object.values(models).filter(Boolean).forEach(disposeModels);return;}
  const put=(name,options,sway=false)=>{if(!models[name])return;const group=placeModel(models[name],options);this.scene.add(group);if(sway)this.sway.push({group,phase:this.sway.length*.9});return group;};
  put('arch',{width:9.8,at:[0,4.3,-.5]});if(models.arch)this.fallbackBeam.visible=false;
  [-1,1].forEach(side=>{
   put('wall',{width:3.6,at:[side*5.2,.05,-1.9]});
   put('outer',{height:1.65,at:[side*3.8,.05,-.7]});
   put('lamp',{height:.95,at:[side*3,3.2,-.4]},true);
   put('branch',{height:3.3,at:[side*4.4,.7,-1.8],rotation:side<0?Math.PI:0},true);
  });
  if(models.lamp)this.fallbackLamps.visible=false;
  put('wreath',{width:6.8,at:[0,3.55,-2.5]},true);
  put('sign',{width:1.8,at:[0,4.7,.05]});put('smallSign',{height:.55,at:[-3.8,1.7,-.4]});
  this.petals=new THREE.InstancedMesh(new THREE.SphereGeometry(.045,5,4),new THREE.MeshStandardMaterial({color:0xe8abc3,roughness:.8}),60);this.petals.frustumCulled=false;this.scene.add(this.petals);this.dummy=new THREE.Object3D();
  const loaded=Object.values(models).filter(Boolean).length;if(status){status.textContent=loaded===8?'Courtyard ready':`${loaded}/8 props loaded · some props unavailable`;status.dataset.loaded=String(loaded);}
 }
 resize(){const w=this.container.clientWidth,h=this.container.clientHeight;this.renderer.setSize(w,h);this.camera.aspect=w/Math.max(h,1);this.camera.updateProjectionMatrix();}
 setMood(name){const m=moods[name];this.scene.background=new THREE.Color(m.sky);this.scene.fog.color.set(m.fog);this.sunLight.color.set(m.sun);this.sunLight.intensity=m.light;this.ambient.intensity=m.ambient;this.wood.color.set(m.wood);this.sun.material.color.set(name==='night'?0xcbd7ee:0xffdbc2);this.lights.forEach(({light,material})=>{light.intensity=name==='night'?8:name==='dusk'?5:1.5;material.emissiveIntensity=name==='night'?1.8:name==='dusk'?1.2:.2;});this.water.material.color.set(name==='night'?0x334962:name==='dusk'?0x8b969f:0x91b3b0);}
 strike(index){this.chimes[index].energy=1;}
 frame(time){this.raf=requestAnimationFrame(this.frame);const dt=Math.min((time-(this.last||time))/1000,.05);this.last=time;if(document.hidden||!this.visible)return;if(this.motion)this.time+=dt;this.chimes.forEach(c=>{if(this.motion)c.energy=Math.max(0,c.energy-dt*.5);c.pivot.rotation.z=Math.sin(this.time*2.4+c.phase)*(this.wind*.065+c.energy*.28);c.pivot.rotation.x=Math.sin(this.time*1.7+c.phase)*this.wind*.035;});this.sail.rotation.z=Math.sin(this.time*1.7)*this.wind*.16;this.sway.forEach(({group,phase})=>{group.rotation.z=Math.sin(this.time*.8+phase)*this.wind*.025;});if(this.petals){for(let i=0;i<60;i++){this.dummy.position.set(Math.sin(i*19.3)*5+Math.sin(this.time*.3+i)*this.wind,((i*.73-this.time*(.09+this.wind*.16))%7+7)%7,-2+Math.cos(i*7.7)*3);this.dummy.rotation.set(this.time*.3+i,0,this.time*.5+i);this.dummy.scale.set(1.3,.25,.8);this.dummy.updateMatrix();this.petals.setMatrixAt(i,this.dummy.matrix);}this.petals.instanceMatrix.needsUpdate=true;}this.rainPoints.visible=this.rain>.01;if(this.rainPoints.visible&&this.motion){const a=this.rainPoints.geometry.attributes.position;for(let i=0;i<a.count;i++){let y=a.getY(i)-dt*(4+this.rain*4);if(y<-.4)y=10;a.setY(i,y);}a.needsUpdate=true;this.rainPoints.material.opacity=this.rain*.75;}this.renderer.render(this.scene,this.camera);}
 dispose(){this.disposed=true;cancelAnimationFrame(this.raf);this.resizeObserver.disconnect();this.intersection.disconnect();this.container.removeEventListener('pointerdown',this.pick);disposeModels(this.scene);this.environment.dispose();this.petals?.dispose();this.renderer.dispose();this.renderer.domElement.remove();}
}
