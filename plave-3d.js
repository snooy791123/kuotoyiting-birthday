import * as T from './three.module.js';
import {createYiTing} from './yiting-rig.js?v=world3d-v1';

export const CAST=[
 {member:'YEJUN',name:'藝俊',hair:0x192951,eyes:0x507ab1,coat:0x56769b,shirt:0xe4e8ef,scale:1.055,plaid:true},
 {member:'NOAH',name:'諾亞',hair:0xe6c385,eyes:0x9a79b9,coat:0x9495af,shirt:0xf1e8df,scale:1.03,plaid:true,parted:true},
 {member:'BAMBY',name:'斑比',hair:0xed8bae,eyes:0x9977b6,coat:0x424457,shirt:0xe9edf3,scale:1.005,parted:true},
 {member:'EUNHO',name:'銀虎',hair:0xd9dce7,eyes:0xc35f64,coat:0x416992,shirt:0xebedf2,scale:1.06,parted:true},
 {member:'HAMIN',name:'河玟',hair:0x101722,eyes:0x50745b,coat:0x3b4858,shirt:0xdfe3de,scale:1.065}
];
function plaidTexture(color){
 const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');
 ctx.fillStyle='#'+color.toString(16).padStart(6,'0');ctx.fillRect(0,0,128,128);
 ctx.fillStyle='#e5edf07a';for(let i=0;i<128;i+=64){ctx.fillRect(i,0,28,128);ctx.fillRect(0,i,128,28);}
 ctx.strokeStyle='#17294080';ctx.lineWidth=3;for(let i=12;i<128;i+=32){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,128);ctx.moveTo(0,i);ctx.lineTo(128,i);ctx.stroke();}
 const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(2,3);return tex;
}
export function createPerformer(index,{textures=true,atlas=null}={}){
 const spec=CAST[index];if(!spec)throw new Error('Unknown performer');
 const regions=[{center:190,faceX:196,faceY:135,faceScale:220,bodyScale:295,shoulder:205,waist:425,top:48,bottom:990},{center:490,faceX:520,faceY:143,faceScale:230,bodyScale:295,shoulder:218,waist:455,top:60,bottom:980},{center:770,faceX:776,faceY:202,faceScale:190,bodyScale:290,shoulder:280,waist:480,top:125,bottom:982},{center:1055,faceX:1057,faceY:129,faceScale:220,bodyScale:295,shoulder:220,waist:450,top:48,bottom:990},{center:1350,faceX:1343,faceY:105,faceScale:220,bodyScale:295,shoulder:190,waist:410,top:22,bottom:990}];
 const actor=createYiTing(null,{...spec,artTexture:atlas,artRegion:regions[index],palette:{hair:spec.hair,eyes:spec.eyes,jacket:spec.coat,shirt:spec.shirt,pants:0x222733,cap:spec.coat,trim:0x788192}});
 actor.name=spec.member+'_3D';actor.userData.castIndex=index;actor.userData.displayName=spec.name;
 if(spec.plaid&&!atlas&&textures&&typeof document!=='undefined'){
  const tex=plaidTexture(spec.coat);const mat=new T.MeshStandardMaterial({map:tex,roughness:.82});
  actor.userData.meshes.filter(m=>m.name==='YiTing_jacket').forEach(m=>m.material=mat);
 }
 // Merge surfaces that share a material: keep the complete skeleton while
 // avoiding one draw call for every finger and hair strand on mobile devices.
 batchRig(actor);
 // The microphone is an actual mesh attached to the hand bone.
 const mic=new T.Group();const body=new T.Mesh(new T.CylinderGeometry(.025,.027,.25,12),new T.MeshStandardMaterial({color:0x182031,metalness:.7,roughness:.3}));body.rotation.x=Math.PI/2;body.position.z=.11;mic.add(body);
 const grille=new T.Mesh(new T.SphereGeometry(.043,12,8),new T.MeshStandardMaterial({color:0x939eaf,metalness:.7,roughness:.45}));grille.position.z=.255;mic.add(grille);
 mic.position.set(0,-.08,.025);actor.userData.bones.RHand.add(mic);mic.visible=false;
 const animate=actor.userData.update;let elapsed=index*.7;
 actor.userData.update=(dt,distance,speed,heading,singing=false)=>{
  animate(dt,distance,speed,heading);elapsed+=dt;mic.visible=singing;
  if(singing){const b=actor.userData.bones;b.RUpperArm.rotation.x=-1.45;b.RUpperArm.rotation.z=.12;b.RForearm.rotation.x=-1.65;b.Chest.rotation.y+=Math.sin(elapsed*1.7)*.07;b.Head.rotation.z=Math.sin(elapsed*1.3)*.035;b.LForearm.rotation.x=-.2-Math.sin(elapsed*1.8)*.10;actor.updateMatrixWorld(true);actor.userData.skeleton.update();}
 };
 return actor;
}

export function batchRig(actor){
 const groups=new Map();for(const mesh of actor.userData.meshes){const key=mesh.material.uuid;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(mesh);}
 const combined=[];
 for(const group of groups.values()){
  const geo=new T.BufferGeometry(),indices=[];let offset=0;
  for(const mesh of group){const source=mesh.geometry,index=source.index;for(let i=0;i<(index?index.count:source.attributes.position.count);i++)indices.push(offset+(index?index.getX(i):i));offset+=source.attributes.position.count;}
  for(const name of ['position','normal','uv','skinIndex','skinWeight']){const size=group[0].geometry.attributes[name].itemSize,values=[];for(const mesh of group)values.push(...mesh.geometry.attributes[name].array);geo.setAttribute(name,name==='skinIndex'?new T.Uint16BufferAttribute(values,size):new T.Float32BufferAttribute(values,size));}
  geo.setIndex(indices);const mesh=new T.SkinnedMesh(geo,group[0].material);mesh.name=actor.name+'_'+group[0].name.replace('YiTing_','');mesh.bind(actor.userData.skeleton,new T.Matrix4());mesh.frustumCulled=false;actor.add(mesh);combined.push(mesh);for(const original of group){actor.remove(original);original.geometry.dispose();}
 }
 actor.userData.meshes=combined;
 return actor;
}
