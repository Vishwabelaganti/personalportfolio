import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import arch from './assets/Japanese_Arch.glb?url';
import wall from './assets/Wall_Module_06.glb?url';
import branch from './assets/BranchFlowers01_Art.glb?url';
import lamp from './assets/Lamp04.glb?url';
import outer from './assets/OutterLamp.glb?url';
import wreath from './assets/LampWreath.glb?url';
import sign from './assets/Japanese_Sign_02.glb?url';
import smallSign from './assets/Japanese_Sign_03.glb?url';

export function disposeModels(root) {
  const geometries=new Set(), materials=new Set(), textures=new Set();
  root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));});
  materials.forEach(m=>{Object.values(m).forEach(v=>{if(v?.isTexture)textures.add(v);});m.dispose();});
  geometries.forEach(g=>g.dispose());textures.forEach(t=>{t.dispose();t.source?.data?.close?.();});
}

// Keep the GLB axis correction, scale to a measured footprint, and center at its base.
export function placeModel(source,{width,height,at,rotation=0}) {
  const model=source.clone(true);model.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
  model.scale.multiplyScalar(width?width/size.x:height/size.y);model.updateMatrixWorld(true);
  bounds.setFromObject(model);const center=bounds.getCenter(new THREE.Vector3());
  model.position.add(new THREE.Vector3(-center.x,-bounds.min.y,-center.z));
  const group=new THREE.Group();group.add(model);group.position.set(...at);group.rotation.y=rotation;return group;
}

export async function loadStudyModels(onProgress) {
  const loader=new GLTFLoader();let completed=0;
  const sources={arch,wall,branch,lamp,outer,wreath,sign,smallSign};
  const entries=await Promise.all(Object.entries(sources).map(async([name,url])=>{
    try {const gltf=await loader.loadAsync(url);gltf.scene.traverse(o=>{if(!o.isMesh)return;(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(m.transparent){m.alphaTest=.15;m.depthWrite=true;}});});return[name,gltf.scene];}
    catch(error){console.warn(`Study prop unavailable: ${name}`,error);return[name,null];}
    finally{onProgress?.(++completed,8);}
  }));return Object.fromEntries(entries);
}
