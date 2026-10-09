import * as T from './three.module.js';

// Original procedural model built from the supplied three-view outfit.
// Every surface is bound to the same articulated skeleton; no billboard player.
export function footTarget(phase){
 const p=((phase%1)+1)%1;
 if(p<.5)return {z:.625-2.5*p,y:.17,pitch:.08*Math.cos(p*Math.PI*2),stance:true};
 const u=(p-.5)*2,s=u*u*(3-2*u);
 return {z:-.625+1.25*s,y:.17+.22*Math.sin(Math.PI*u),pitch:-.18*Math.sin(Math.PI*u),stance:false};
}
export function solveLeg(height,z){
 const a=.76,b=.74,d=Math.min(a+b-.001,Math.max(.05,Math.hypot(height,z)));
 const hip=Math.atan2(-z,height)-Math.acos(T.MathUtils.clamp((a*a+d*d-b*b)/(2*a*d),-1,1));
 const knee=Math.PI-Math.acos(T.MathUtils.clamp((a*a+b*b-d*d)/(2*a*b),-1,1));
 return {hip,knee,ankle:-hip-knee};
}
export function createYiTing(atlas=null){
 const model=new T.Group();model.name='YiTing_3D';
 const bones=[],byName={},meshes=[];
 function bone(name,parent,x,y,z){const b=new T.Bone();b.name=name;b.position.set(x,y,z);(parent?byName[parent]:model).add(b);byName[name]=b;bones.push(b);return b;}
 bone('Root',null,0,0,0);bone('Hips','Root',0,1.65,0);bone('Spine','Hips',0,.25,0);bone('Chest','Spine',0,.36,0);bone('Neck','Chest',0,.27,0);bone('Head','Neck',0,.18,0);
 for(const [side,sign] of [['L',-1],['R',1]]){
  bone(side+'Clavicle','Chest',sign*.29,.10,0);bone(side+'UpperArm',side+'Clavicle',sign*.16,-.02,0);bone(side+'Forearm',side+'UpperArm',0,-.48,0);bone(side+'Hand',side+'Forearm',0,-.44,0);
  for(let f=0;f<5;f++){bone(side+'Finger'+f+'A',side+'Hand',(f-2)*.026,-.105,.018);bone(side+'Finger'+f+'B',side+'Finger'+f+'A',0,-.055,.005);bone(side+'Finger'+f+'C',side+'Finger'+f+'B',0,-.04,0);}
  bone(side+'Thigh','Hips',sign*.20,0,0);bone(side+'Shin',side+'Thigh',0,-.76,0);bone(side+'Foot',side+'Shin',0,-.74,0);bone(side+'Toe',side+'Foot',0,-.06,.19);
 }
 bone('Hair','Head',0,-.15,-.15);bone('HairTip','Hair',0,-.45,0);
 model.updateMatrixWorld(true);const skeleton=new T.Skeleton(bones);skeleton.calculateInverses();
 const idx=name=>bones.indexOf(byName[name]);
 const palette={skin:0xf2c4b5,jacket:0xb8bbc9,trim:0x777c8f,shirt:0x681f38,pants:0x30313e,hair:0x12121d,cap:0x8e93a5,shoe:0xb3b6c5,sole:0xe2dfdc,eyes:0x4e3034,white:0xfff6ed};
 const mats={};for(const [key,color] of Object.entries(palette))mats[key]=new T.MeshStandardMaterial({color,roughness:.88,metalness:key==='hair'?.08:0,side:T.DoubleSide});
 function skin(geo,mat,weights){const pos=geo.attributes.position,indices=[],values=[];
  for(let i=0;i<pos.count;i++){const w=weights(pos.getX(i),pos.getY(i),pos.getZ(i));indices.push(idx(w[0]),idx(w[1]??w[0]),0,0);values.push(1-(w[2]??0),w[2]??0,0,0);}
  geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));geo.setAttribute('skinWeight',new T.Float32BufferAttribute(values,4));
  let surface=mats[mat];
  if(atlas&&['jacket','shirt','pants','cap','shoe','skin'].includes(mat)&&(mat!=='skin'||pos.getY(0)>2.65)){
   if(!mats[mat+'_texture'])mats[mat+'_texture']=new T.MeshStandardMaterial({map:atlas,color:0xffffff,roughness:1,side:T.DoubleSide});surface=mats[mat+'_texture'];
   const uv=[];for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),back=z<-.035;uv.push((back?1235-x*318:320+x*318)/1536,T.MathUtils.clamp(y/3.25,.005,.995));}
   geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  }
  const m=new T.SkinnedMesh(geo,surface);m.name='YiTing_'+mat;model.add(m);m.bind(skeleton,new T.Matrix4());m.frustumCulled=false;meshes.push(m);return m;
 }
 const fixed=name=>()=>[name];
 function ellipsoid(mat,position,scale,name,segments=20){const g=new T.SphereGeometry(1,segments,12);g.scale(...scale);g.translate(...position);return skin(g,mat,fixed(name));}
 function loft(mat,rings,weights,segments=20){const positions=[],uv=[],indices=[];
  rings.forEach(([x,y,z,rx,rz],j)=>{for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2;positions.push(x+Math.cos(a)*rx,y,z+Math.sin(a)*rz);uv.push(i/segments,j/(rings.length-1));}});
  for(let j=0;j<rings.length-1;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,b,a+1,b,b+1,a+1);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return skin(g,mat,weights);
 }
 function curve(mat,points,radius,name){const c=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return skin(new T.TubeGeometry(c,18,radius,7,false),mat,fixed(name));}
 const torso=(x,y)=>y<1.9?['Hips','Spine',T.MathUtils.clamp((y-1.65)/.25,0,1)]:['Spine','Chest',T.MathUtils.clamp((y-1.9)/.36,0,1)];
 loft('shirt',[[0,1.58,0,.27,.16],[0,1.8,0,.25,.145],[0,2.03,0,.28,.18],[0,2.25,0,.32,.19],[0,2.4,0,.28,.15]],torso);
 loft('shirt',[[0,2.35,0,.13,.12],[0,2.53,0,.12,.115]],fixed('Neck'));
 // Open jacket panels keep the burgundy top visible from the front.
 for(const sign of [-1,1])loft('jacket',[[sign*.21,1.55,0,.13,.18],[sign*.22,1.8,0,.12,.18],[sign*.24,2.1,0,.14,.20],[sign*.27,2.3,0,.16,.19],[sign*.22,2.4,0,.12,.16]],torso);
 loft('jacket',[[0,1.55,-.15,.30,.07],[0,1.85,-.15,.29,.065],[0,2.15,-.15,.34,.08],[0,2.38,-.10,.32,.08]],torso);
 ellipsoid('jacket',[0,2.23,-.13],[.34,.23,.13],'Chest');
 curve('trim',[[-.11,2.4,.17],[-.18,2.2,.21],[-.12,1.92,.19],[-.10,1.57,.18]],.012,'Chest');curve('trim',[[.11,2.4,.17],[.18,2.2,.21],[.12,1.92,.19],[.10,1.57,.18]],.012,'Chest');
 ellipsoid('pants',[0,1.56,0],[.31,.18,.19],'Hips');
 for(const [side,sign] of [['L',-1],['R',1]]){
  const x=sign*.20,leg=(px,y)=>y>.95?[side+'Thigh',side+'Shin',T.MathUtils.clamp((1.02-y)/.20,0,1)]:[side+'Shin'];
  loft('pants',[[x,1.66,0,.16,.19],[x,1.45,0,.17,.19],[x,1.2,0,.155,.17],[x,.93,0,.14,.155],[x,.77,0,.135,.15],[x,.52,0,.125,.13],[x,.23,0,.13,.13]],leg);
  ellipsoid('trim',[x+sign*.135,1.17,.04],[.055,.14,.10],side+'Thigh');
  const armX=sign*.45,arm=(px,y)=>y>1.91?[side+'UpperArm',side+'Forearm',T.MathUtils.clamp((2.02-y)/.20,0,1)]:[side+'Forearm'];
  loft('jacket',[[armX,2.39,0,.13,.15],[armX,2.20,0,.135,.15],[armX,1.99,0,.12,.13],[armX,1.82,0,.11,.12],[armX,1.54,0,.10,.105]],arm);
  loft('trim',[[armX,1.56,0,.103,.11],[armX,1.48,0,.085,.09]],fixed(side+'Forearm'));
  ellipsoid('skin',[armX,1.39,.015],[.078,.12,.06],side+'Hand');
  for(let f=0;f<5;f++){const fx=armX+(f-2)*.026;loft('skin',[[fx,1.365,.018,.012,.014],[fx,1.31,.023,.012,.014],[fx,1.275,.023,.008,.011]],()=>[side+'Finger'+f+'A',side+'Finger'+f+'B',.4],8);}
  ellipsoid('shoe',[x,.145,.075],[.15,.13,.255],side+'Foot');ellipsoid('sole',[x,.060,.08],[.155,.050,.26],side+'Foot');
  ellipsoid('trim',[x,.19,-.075],[.13,.065,.12],side+'Foot');
  for(let i=0;i<3;i++)curve('white',[[x-.07,.235,.055+i*.04],[x,.25,.068+i*.04],[x+.07,.235,.055+i*.04]],.007,side+'Foot');
 }
 // Rounded anime head, eyes and small facial details on true 3D surfaces.
 ellipsoid('skin',[0,2.87,.015],[.22,.29,.19],'Head',28);
 loft('skin',[[0,2.4,0,.09,.09],[0,2.65,0,.09,.09]],fixed('Neck'));
 ellipsoid('skin',[-.222,2.85,0],[.038,.065,.027],'Head');ellipsoid('skin',[.222,2.85,0],[.038,.065,.027],'Head');
 for(const sign of [-1,1]){
  ellipsoid('white',[sign*.085,2.91,.181],[.061,.041,.018],'Head');ellipsoid('eyes',[sign*.08,2.91,.196],[.026,.034,.012],'Head');ellipsoid('hair',[sign*.08,2.91,.204],[.012,.027,.007],'Head');ellipsoid('white',[sign*.071,2.925,.211],[.008,.01,.003],'Head',10);
  curve('hair',[[sign*.145,2.942,.182],[sign*.09,2.955,.199],[sign*.035,2.94,.193]],.010,'Head');
  curve('hair',[[sign*.139,2.987,.163],[sign*.095,2.997,.183],[sign*.05,2.985,.18]],.009,'Head');
 }
 ellipsoid('skin',[0,2.856,.204],[.023,.043,.034],'Head');curve('shirt',[[-.038,2.769,.175],[0,2.761,.188],[.038,2.769,.175]],.008,'Head');
 // Long dark hair with a joint-driven lower section, keeping the jacket visible.
 loft('hair',[[0,3.07,-.06,.235,.18],[0,2.91,-.065,.242,.20],[0,2.64,-.17,.23,.13],[0,2.40,-.20,.24,.11],[0,2.17,-.21,.20,.09],[0,2.06,-.21,.10,.07]],(x,y)=>y>2.68?['Head']:['Head','HairTip',T.MathUtils.clamp((2.68-y)/.62,0,1)]);
 for(let i=0;i<13;i++){const x=(i-6)*.029;curve('hair',[[x,3.02,-.23],[x*1.1,2.75,-.28],[x*1.15+.025*Math.sin(i),2.43,-.29],[x*.85+.035*Math.sin(i),2.12+(i%3)*.025,-.27]],.021,'Hair');}
 for(const sign of [-1,1]){
  curve('hair',[[sign*.20,3.02,.04],[sign*.21,2.86,.07],[sign*.235,2.67,.09],[sign*.22,2.46,.14],[sign*.25,2.30,.14]],.040,'Head');
  curve('trim',[[sign*.195,3.0,-.16],[sign*.215,2.72,-.24],[sign*.17,2.37,-.30]],.008,'Hair');
 }
 // Cap crown is a half sphere; curved visor projects forward rather than a box.
 const cap=new T.SphereGeometry(1,28,12,0,Math.PI*2,0,Math.PI/2);cap.scale(.25,.22,.225);cap.translate(0,3.025,-.01);skin(cap,'cap',fixed('Head'));
 const brim=new T.SphereGeometry(1,28,8,0,Math.PI*2,0,Math.PI);brim.scale(.25,.020,.23);brim.translate(0,3.038,.19);skin(brim,'cap',fixed('Head'));
 curve('trim',[[-.24,3.024,-.01],[0,3.016,.212],[.24,3.024,-.01]],.01,'Head');
 // Neck pendant, jacket drawstrings and hip chain reflect the supplied outfit.
 ellipsoid('sole',[0,2.10,.198],[.025,.032,.012],'Chest',12);
 for(const sign of [-1,1])curve('sole',[[sign*.10,2.4,.18],[sign*.13,2.27,.21],[sign*.13,2.12,.22]],.006,'Chest');
 curve('sole',[[.25,1.64,.14],[.33,1.48,.17],[.29,1.40,.17],[.23,1.47,.18]],.010,'Hips');
 const times=[0,.25,.5,.75,1],tracks=[],idleTracks=[];
 function rot(name,axis,values){tracks.push(new T.NumberKeyframeTrack(name+'.rotation['+axis+']',times,values));}
 rot('Spine','y',[0,.07,0,-.07,0]);rot('Chest','y',[0,-.05,0,.05,0]);rot('Head','z',[0,-.018,0,.018,0]);
 rot('LUpperArm','x',[.34,0,-.34,0,.34]);rot('RUpperArm','x',[-.34,0,.34,0,-.34]);
 rot('LUpperArm','z',[-.10,-.13,-.10,-.08,-.10]);rot('RUpperArm','z',[.10,.08,.10,.13,.10]);
 rot('LForearm','x',[-.17,-.25,-.22,-.15,-.17]);rot('RForearm','x',[-.22,-.15,-.17,-.25,-.22]);
 rot('LThigh','x',[-.38,0,.38,0,-.38]);rot('RThigh','x',[.38,0,-.38,0,.38]);
 rot('LShin','x',[.15,.12,.2,.8,.15]);rot('RShin','x',[.2,.8,.15,.12,.2]);
 tracks.push(new T.NumberKeyframeTrack('Hips.position[y]',times,[1.50,1.515,1.50,1.515,1.50]));rot('Hips','z',[.025,0,-.025,0,.025]);
 rot('Hair','x',[0,.035,0,-.035,0]);rot('HairTip','z',[.025,0,-.025,0,.025]);
 idleTracks.push(new T.NumberKeyframeTrack('Hips.position[y]',[0,1.5,3],[1.65,1.659,1.65]));
 idleTracks.push(new T.NumberKeyframeTrack('Spine.rotation[x]',[0,1.5,3],[0,.012,0]));
 for(const side of ['L','R'])for(let f=0;f<5;f++){const name=side+'Finger'+f+'A';rot(name,'x',[.18,.20,.18,.16,.18]);idleTracks.push(new T.NumberKeyframeTrack(name+'.rotation[x]',[0,1.5,3],[.14,.17,.14]));}
 const idleClip=new T.AnimationClip('YiTing_Idle',3,idleTracks),walkClip=new T.AnimationClip('YiTing_Walk',1,tracks);
 const greetClip=new T.AnimationClip('YiTing_Greeting',1.6,[new T.NumberKeyframeTrack('RUpperArm.rotation[z]',[0,.4,.8,1.2,1.6],[-1.1,-1.1,-1.1,-1.1,-1.1]),new T.NumberKeyframeTrack('RForearm.rotation[x]',[0,.4,.8,1.2,1.6],[-1.25,-1.25,-1.25,-1.25,-1.25]),new T.NumberKeyframeTrack('RHand.rotation[z]',[0,.4,.8,1.2,1.6],[-.18,.18,-.18,.18,-.18])]);
 const mixer=new T.AnimationMixer(model),idle=mixer.clipAction(idleClip).play(),walk=mixer.clipAction(walkClip).play();walk.timeScale=0;walk.setEffectiveWeight(0);const greetAction=mixer.clipAction(greetClip).play();greetAction.setEffectiveWeight(0);let weight=0,elapsed=0,greeting=false,greetWeight=0;model.rotation.y=Math.PI;
 function update(dt,distance,speed,heading){elapsed+=dt;weight=T.MathUtils.damp(weight,Math.min(speed/2.0,1),11,dt);greetWeight=T.MathUtils.damp(greetWeight,greeting?1:0,8,dt);idle.setEffectiveWeight((1-weight)*(1-greetWeight));walk.setEffectiveWeight(weight*(1-greetWeight));greetAction.setEffectiveWeight(greetWeight);walk.time=(distance/2.5)%1;mixer.update(dt);
  const phase=walk.time;
  for(const [side,offset] of [['L',0],['R',.5]]){const f=footTarget(phase+offset),ik=solveLeg(byName.Hips.position.y-f.y,f.z);const thigh=byName[side+'Thigh'],shin=byName[side+'Shin'],foot=byName[side+'Foot'];
   thigh.rotation.x=T.MathUtils.lerp(thigh.rotation.x,ik.hip,weight);shin.rotation.x=T.MathUtils.lerp(shin.rotation.x,ik.knee,weight);foot.rotation.x=T.MathUtils.lerp(foot.rotation.x,ik.ankle+f.pitch,weight);byName[side+'Toe'].rotation.x=f.stance?Math.max(0,-f.z)*.25*weight:0;
  }
  byName.Hair.rotation.x+=Math.sin(elapsed*3.5)*.012*(.3+weight);byName.Head.rotation.y=T.MathUtils.damp(byName.Head.rotation.y,0,8,dt);
  model.rotation.y+=Math.atan2(Math.sin(heading-model.rotation.y),Math.cos(heading-model.rotation.y))*(1-Math.exp(-dt*15));model.updateMatrixWorld(true);skeleton.update();
 }
 model.userData={skeleton,bones:byName,meshes,clips:[idleClip,walkClip,greetClip],heading:Math.PI,update,greet:value=>{greeting=value;}};
 update(0,0,0,Math.PI);return model;
}
