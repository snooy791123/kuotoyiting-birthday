import * as T from './three.module.js';

export const SCENE_REFERENCES={city:['002','006','010'],portal:['013','014','015'],castle:['016','017','018','019'],concert:['023','027']};
export function createWorld3D({textures={}}={}){
 const root=new T.Group(),city=new T.Group(),asterum=new T.Group();root.add(city,asterum);
 const skyMaterial=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{time:{value:0},magic:{value:0}},vertexShader:'varying vec3 direction;void main(){direction=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:`varying vec3 direction;uniform float time;uniform float magic;
 void main(){vec3 d=normalize(direction);float ribbon=sin(d.x*8.0+d.y*11.0+d.z*5.0+sin(d.z*9.0)*1.6+time*.008);float cloud=smoothstep(.1,1.0,ribbon)*smoothstep(-.1,.65,d.y);vec3 night=mix(vec3(.025,.037,.10),vec3(.08,.045,.17),max(d.y,0.0));vec3 nebula=mix(vec3(.06,.09,.25),vec3(.20,.10,.32),cloud);vec3 color=mix(night,nebula,cloud*(.2+magic*.7));gl_FragColor=vec4(color,1.0);}`});
 const sky=new T.Mesh(new T.SphereGeometry(85,32,16),skyMaterial);sky.position.set(0,0,-20);root.add(sky);
 const boxes=[],occluders=[],materials=new Map(),windows={blue:[],pink:[],gold:[]},animated=[];
 const cube=new T.BoxGeometry(1,1,1),sphere=new T.SphereGeometry(1,12,8);
 function mat(color,glow=0,roughness=.7){const key=[color,glow,roughness].join();if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,roughness,metalness:roughness<.3?.45:.1,emissive:glow?color:0,emissiveIntensity:glow}));return materials.get(key);}
 function block(group,color,x,y,z,w,h,d,glow=0,roughness=.7){const m=new T.Mesh(cube,mat(color,glow,roughness));m.position.set(x,y,z);m.scale.set(w,h,d);group.add(m);return m;}
 function orb(group,color,x,y,z,r,glow=1){const m=new T.Mesh(sphere,mat(color,glow));m.position.set(x,y,z);m.scale.setScalar(r);group.add(m);return m;}
 function ring(group,color,x,y,z,r,vertical=false){const m=new T.Mesh(new T.TorusGeometry(r,.035,6,64),mat(color,1.8));m.position.set(x,y,z);if(!vertical)m.rotation.x=-Math.PI/2;group.add(m);return m;}
 function screen(group,texture,x,y,z,w,h,angle=0){const board=block(group,0x22233b,x,y,z,w+.3,h+.3,.18);board.rotation.y=angle;const face=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture??null,color:texture?0xffffff:0x8169d5}));face.position.set(x+Math.sin(angle)*.12,y,z+Math.cos(angle)*.12);face.rotation.y=angle;group.add(face);return face;}
 function textTexture(text,sub='',color='#c3b5ff'){
  if(typeof document==='undefined')return null;const c=document.createElement('canvas');c.width=1024;c.height=512;const ctx=c.getContext('2d');const g=ctx.createLinearGradient(0,0,1024,512);g.addColorStop(0,'#111831');g.addColorStop(1,'#49325e');ctx.fillStyle=g;ctx.fillRect(0,0,1024,512);ctx.strokeStyle=color;ctx.lineWidth=6;ctx.strokeRect(15,15,994,482);ctx.fillStyle=color;ctx.textAlign='center';ctx.font='bold 76px Georgia';ctx.fillText(text,512,250);ctx.font='32px sans-serif';ctx.fillText(sub,512,335);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;
 }
 // A real street, sidewalks, crossed lanes and buildings on both sides.
 block(city,0x151a2b,0,-.12,-12,70,.24,90,0,.18);
 for(const sign of [-1,1])block(city,0x343348,sign*7.7,.005,-12,4,.12,74,0,.3);
 for(let z=-40;z<24;z+=7)block(city,0xd2cde2,0,.017,z,.10,.012,2.8,.1);
 for(const z of [-4,-20])for(let x=-5;x<=5;x+=1.5)block(city,0xced0e2,x,.025,z,.75,.018,2.4,0,.3);
 for(const sign of [-1,1])for(let row=0;row<2;row++)for(let j=0;j<7;j++){
  const x=sign*(14+row*13),z=22-j*12,h=10+((j*7+row*5+(sign+1)*3)%14),w=7+row*2;
  const tower=block(city,[0x242337,0x202c43,0x34283e][j%3],x,h/2,z,w,h,9);occluders.push(tower);boxes.push({x,z,w,d:9,city:true});
  block(city,0x11182a,x,h+.18,z,w+.4,.35,9.3);block(city,j%2?0x8874e1:0xe178bb,x,h-.6,z+4.57,w,.08,.06,1.8);
  // Ground-floor storefronts, roof piping and illuminated facade edges.
  for(const side of [-1,1]){block(city,0x65779f,x+side*w/2,.9,z+4.58,.08,1.8,.05);block(city,0x76618b,x+side*w/2,h/2,z+4.58,.035,h,.04,.3);}
  block(city,0x382d53,x,2.4,z+4.7,w,.35,.35);block(city,j%2?0xd477ad:0x76a1d6,x,2.45,z+4.91,w-.3,.10,.025,.9);
  for(let k=-2;k<=2;k++)block(city,0x172d48,x+k*.8,1.2,z+4.56,.65,1.65,.035,.1,.20);
  block(city,0x4c526d,x+w/4,h+.6,z,.7,.8,1.4);
  for(let floor=1;floor<h-1;floor+=1.3)for(let col=-w/2+.7;col<w/2;col+=1.1){if((j+Math.round(floor)+Math.round(col)*2)%5===0)continue;windows[['blue','pink','gold'][(j+Math.round(floor))%3]].push([x+col,floor,z+4.54,.46,.63,.025]);windows.blue.push([x-sign*(w/2+.02),floor,z+col,.025,.62,.45]);}
 }
 const dummy=new T.Object3D();for(const [name,color] of [['blue',0x67aaff],['pink',0xea8fce],['gold',0xe5c69e]]){const data=windows[name],inst=new T.InstancedMesh(cube,mat(color,.7),data.length);data.forEach((p,i)=>{dummy.position.set(...p.slice(0,3));dummy.scale.set(...p.slice(3));dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);});city.add(inst);}
 // Elevated pedestrian bridge from 002; it leaves the road passable beneath it.
 block(city,0x323a53,0,6.9,-10,27,.6,2.4);for(const z of [-11.1,-8.9]){block(city,0x7084ac,0,7.6,z,27,.07,.06);for(let x=-13;x<14;x+=1.2)block(city,0x526789,x,7.25,z,.05,.75,.05);}
 screen(city,textures.billboard,10,8,-5,12,6,-.28);
 screen(city,textTexture('PLAVE','YEJUN · NOAH · BAMBY · EUNHO · HAMIN'),-11,9,-18,7,12,.35);
 screen(city,textTexture('10:20 PM','MUSIC CONNECTS OUR WORLDS'),0,10,-36,10,4);
 for(let z=-32;z<18;z+=10)for(const sign of [-1,1]){block(city,0x43485e,sign*8.8,2.7,z,.10,5.4,.10);block(city,0xe7caaf,sign*8.3,5.3,z,1.3,.08,.2,2);for(let n=0;n<3;n++)block(city,n===1?0x8d72c1:0x3e658d,sign*(6.2+n*.55),.034,z+.4,n===1?.6:.22,.01,4+n,.4,.12);}
 const phone=block(city,0x161b2c,0,.9,1,.35,.65,.08);phone.rotation.x=-.25;screen(city,textures.phone,0,.93,1.08,.30,.55);
 const portal=new T.Group();portal.position.set(0,3.3,-26);city.add(portal);
 for(let i=0;i<3;i++){const r=ring(portal,[0xb7a5ff,0x7089ff,0xf4b8ec][i],0,0,-i*.22,2.85+i*.13,true);animated.push({object:r,kind:'portal',phase:i});}
 const portalFace=new T.Mesh(new T.CircleGeometry(2.75,64),new T.MeshBasicMaterial({map:textures.portal??null,color:0xb7b1ff,side:T.DoubleSide}));portalFace.position.z=-.3;portal.add(portalFace);
 // The luminous walkway and crystalline architecture of 014–017.
 block(asterum,0x252344,0,-.12,-23,43,.24,82,0,.20);
 for(let z=12;z>=-55;z-=3){block(asterum,0x9cb2e6,0,.025,z,39,.012,.035,.6);for(const x of [-19,-6,6,19])block(asterum,0x8975bf,x,.03,z+1.5,.028,.012,3,.6);}
 for(const sign of [-1,1])for(let j=0;j<9;j++){
  const x=sign*20,z=9-j*7,h=4+(j%3)*2;
  const pillar=new T.Mesh(new T.CylinderGeometry(.32,.55,h,6),mat(0x8193c9,0,.25));pillar.position.set(x,h/2,z);asterum.add(pillar);
  const crystal=new T.Mesh(new T.ConeGeometry(.7,2.8,5),mat(j%2?0xb4b5ed:0x90bde1,.18,.18));crystal.position.set(x,h+1.35,z);asterum.add(crystal);
  orb(asterum,0xa7b7ff,x,1,z,.14,2);block(asterum,0x9f96d9,x,.08,z-3.5,.05,.08,7,1);
 }
 const colors=[0x59a8ff,0xaf85ff,0xff83c8,0x6ee9b6,0xff727e],locations=[[-10,-7],[10,-12],[-11,-23],[11,-30],[0,-39]],gardens=[];
 locations.forEach(([x,z],i)=>{const g=new T.Group();g.position.set(x,0,z);asterum.add(g);gardens.push(g);ring(g,colors[i],0,.055,0,3.4);for(let j=0;j<8;j++){const a=j/8*Math.PI*2;orb(g,colors[i],Math.cos(a)*3, .23,Math.sin(a)*3,.08,1.4);}
  if(i===0){for(let j=0;j<9;j++){const a=j/9*Math.PI*2;orb(g,0x8cb9e6,Math.cos(a)*4,.55,Math.sin(a)*4,.23,.3);}screen(g,textTexture('HOPE','讓音樂陪妳前進'),-5.5,3,-4.3,3.4,1.3);}
  if(i===1){for(const side of [-1,1]){block(g,0x6b659e,side*3.8,2,-1,.12,4,.12);block(g,0x6b659e,side*3.8,2,-5,.12,4,.12);}const arch=ring(g,0xb9a2ee,0,3.6,-4,3,true);arch.scale.y=.6;}
  if(i===2){for(let j=0;j<5;j++){const a=j/5*Math.PI*2;const o=new T.Mesh(new T.OctahedronGeometry(.23),mat(colors[i],1));o.position.set(Math.cos(a)*3.7,2,Math.sin(a)*3.7);g.add(o);animated.push({object:o,kind:'float',phase:j});}}
  if(i===3){ring(g,0x72d0c6,0,.1,0,4.5);for(let j=0;j<12;j++){const a=j/12*Math.PI*2;block(g,0xa6bfd2,Math.cos(a)*4.7,.65,Math.sin(a)*4.7,.08,1.3,.08);}}
  if(i===4){for(const side of [-1,1])block(g,0xa57695,side*3, .45,-2,1.8,.2,.55);screen(g,textTexture('WITH YOU','銀虎 · 一直陪伴妳'),-6,3,-4.4,3.4,1.3);}
 });
 // The castle and stage are geometry, rather than a backdrop image.
 const castle=new T.Group();castle.position.z=-60;asterum.add(castle);
 block(castle,0x68658e,0,4.5,0,17,9,5,0,.4);
 for(let i=-3;i<=3;i++){const h=i===0?19:11+Math.abs(i)*1.8,x=i*4;block(castle,0x7981b0,x,h/2,-2,2.3,h,2.3,0,.3);const spire=new T.Mesh(new T.ConeGeometry(1.9,5,6),mat(0xa2a9dc,.18,.25));spire.position.set(x,h+2.5,-2);castle.add(spire);block(castle,0xc5bbf3,x,h/2, -.81,.24,h-2,.025,1.2);}
 for(let i=0;i<3;i++)ring(castle,0xb7a7e3,0,13+i*2,-2,10+i*1.5);
 // Slender arcades and pointed arches echo the glass palace in 016 and 017.
 for(const sign of [-1,1])for(let j=0;j<5;j++){
  const x=sign*(10+j*2.8),h=6+j*.9;block(castle,0x8797b9,x,h/2,2,.42,h,.6,0,.25);
  const crown=new T.Mesh(new T.ConeGeometry(.5,2.5,4),mat(0xbbcae5,.25,.18));crown.position.set(x,h+1.2,2);castle.add(crown);
  block(castle,0xa9b9e8,x,h/2,2.33,.08,h-.7,.03,.9);
  for(const y of [1.5,3.5])block(castle,0x8178a7,x,y,2,2.8,.12,.25);
 }
 for(const sign of [-1,1])for(let j=0;j<5;j++){
  const z=-4-j*8,x=sign*21;block(asterum,0x5f608f,x,4,z,.5,8,.5);
  const arch=ring(asterum,0xa5aee1,x,5.4,z-3.8,3.9,true);arch.rotation.y=Math.PI/2;arch.scale.y=1.3;
  block(asterum,0x9692c8,x,2,z-3.8,.07,3.7,7.8,.10);
 }
 const stageArch=ring(castle,0xc2b8f1,0,5,3,6,true);stageArch.scale.y=1.4;
 for(let i=0;i<5;i++){const banner=block(castle,colors[i],(i-2)*3.4,4,3.1,1.5,5,.05,.15);orb(castle,0xdfd5ff,(i-2)*3.4,6.6,3.2,.09,1);}
 const stage=new T.Group();asterum.add(stage);block(stage,0x41365b,0,.03,-52,17,.10,9,0,.18);ring(stage,0xe8b6f3,0,.10,-52,8);
 const title=screen(stage,textTexture('Happy Birthday','YiTing · 10:20 PM'),0,6.9,-56,12,3.5);
 const beams=[];colors.forEach((color,i)=>{const x=(i-2)*3.6;block(stage,color,x,5.2,-56.5,.12,10,.15,1.8);const beam=new T.Mesh(new T.CylinderGeometry(.25,.9,10,12,1,true),new T.MeshBasicMaterial({color,transparent:true,opacity:.11,depthWrite:false,side:T.DoubleSide}));beam.position.set(x,5.1,-55.5);stage.add(beam);beams.push(beam);});
 const cityLight=new T.PointLight(0x9a83ff,35,25,2);cityLight.position.set(6,6,-7);city.add(cityLight);const pinkLight=new T.PointLight(0xed87c2,25,18,2);pinkLight.position.set(-5,5,6);city.add(pinkLight);
 const stageLight=new T.PointLight(0xffc2e7,55,25,2);stageLight.position.set(0,7,-50);asterum.add(stageLight);
 // Static geometry is batched per material within each chapter group. Animated
 // objects and camera colliders stay separate so their behavior is preserved.
 const keep=new Set([...occluders,...animated.map(a=>a.object),...beams,sky]);
 root.traverse(parent=>{if(!parent.isGroup)return;const batches=new Map();
  for(const child of parent.children){if(!child.isMesh||child.isInstancedMesh||keep.has(child)||child.material.transparent||child.material.isShaderMaterial)continue;const key=child.material.uuid;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(child);}
  for(const children of batches.values()){if(children.length<2)continue;const geometry=new T.BufferGeometry(),attrs={position:[],normal:[],uv:[]},index=[];let count=0;
   for(const child of children){child.updateMatrix();const copy=child.geometry.clone().applyMatrix4(child.matrix);for(const name of Object.keys(attrs))attrs[name].push(...copy.attributes[name].array);const source=copy.index;for(let i=0;i<(source?source.count:copy.attributes.position.count);i++)index.push(count+(source?source.getX(i):i));count+=copy.attributes.position.count;copy.dispose();}
   for(const [name,values] of Object.entries(attrs))geometry.setAttribute(name,new T.Float32BufferAttribute(values,name==='uv'?2:3));geometry.setIndex(index);geometry.computeBoundingSphere();
   const batch=new T.Mesh(geometry,children[0].material);parent.add(batch);children.forEach(child=>parent.remove(child));
  }
 });
 let current=0;
 function setChapter(step){current=step;skyMaterial.uniforms.magic.value=step>=4?1:0;city.visible=step<4;asterum.visible=step>=4;portal.visible=step>=2&&step<4;gardens.forEach((g,i)=>g.visible=step>=5+i);beams.forEach(b=>b.visible=step>=10);title.visible=step>=10;stageLight.intensity=step>=10?55:12;}
 function update(time){skyMaterial.uniforms.time.value=time;animated.forEach(({object,kind,phase})=>{if(kind==='portal'){object.rotation.z=time*.15*(phase%2?-1:1);}else{object.rotation.y=time*.5;object.position.y=2+Math.sin(time+phase)*.25;}});beams.forEach((b,i)=>b.rotation.z=Math.sin(time*.5+i)*.08);}
 function constrain(x,z){const max=current<4?9.4:18.7;return {x:T.MathUtils.clamp(x,-max,max),z:T.MathUtils.clamp(z,current<4?-30:-54,13)};}
 function groundHeight(x,z){return current<4?(Math.abs(x)>5.7?.065:0):(z< -47.5&&Math.abs(x)<8.5?.08:0);}
 setChapter(0);return {root,city,asterum,occluders,boxes,setChapter,update,constrain,groundHeight,references:SCENE_REFERENCES};
}


