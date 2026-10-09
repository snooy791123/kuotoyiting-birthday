import * as T from './three.module.js';
import { facingFor, cameraDirection, damp, wrappedAngle, advanceVelocity, arrivalSpeed, stableFacing } from './locomotion.js';
const $=id=>document.getElementById(id),keys=new Set(),colors=[0x59a8ff,0xaf85ff,0xff83c8,0x6ee9b6,0xff727e];
let renderer;try{renderer=new T.WebGLRenderer({canvas:$('world'),antialias:true,alpha:true});}catch(e){$('welcome').showModal();$('error').textContent='此裝置暫時無法顯示 3D 世界，請改用其他瀏覽器，或回到電影模式。';$('begin').disabled=true;throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.outputColorSpace=T.SRGBColorSpace;
const scene=new T.Scene();scene.background=null;const camera=new T.PerspectiveCamera(55,1,.1,180);scene.add(new T.HemisphereLight(0xc9b9ff,0x293756,2.4));const sun=new T.DirectionalLight(0xb9cbff,2.7);sun.position.set(-8,15,10);scene.add(sun);
const materials=new Map();function material(c,glow=false){const key=c+':'+glow;if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color:c,roughness:.7,emissive:glow?c:0,emissiveIntensity:glow?.7:0}));return materials.get(key);}
function mesh(parent,geo,c,x,y,z,sx=1,sy=1,sz=1,glow=false){const m=new T.Mesh(geo,material(c,glow));m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m;}
const box=new T.BoxGeometry(1,1,1),ball=new T.SphereGeometry(1,16,12),cylinder=new T.CylinderGeometry(1,1,1,24);
$('welcome').showModal();$('begin').disabled=true;$('error').textContent='正在接住星光與角色插畫…';
function artImage(id){const img=$(id);return new Promise((resolve,reject)=>{if(img.complete){img.naturalWidth?resolve(img):reject(new Error('image failed'));}else{img.addEventListener('load',()=>resolve(img),{once:true});img.addEventListener('error',()=>reject(new Error('image failed')),{once:true});}});}
let yitingAtlas,memberAtlas,walkAtlas;
try{const images=await Promise.all([artImage('yitingArt'),artImage('membersArt'),artImage('walkArt')]);[yitingAtlas,memberAtlas,walkAtlas]=images.map(im=>{const t=new T.Texture(im);t.needsUpdate=true;return t;});$('begin').disabled=false;$('error').textContent='';}catch(e){$('error').textContent='插畫素材未能載入，請重新整理再試一次。';$('begin').disabled=true;throw e;}
yitingAtlas.colorSpace=memberAtlas.colorSpace=walkAtlas.colorSpace=T.SRGBColorSpace;
const memberRanges=[[0,342],[342,626],[626,900],[900,1200],[1200,1536]];
function frameTexture(atlas,left,right){const tex=atlas.clone();tex.repeat.set((right-left)/1536,1);tex.offset.set(left/1536,0);tex.needsUpdate=true;return tex;}
const yitingViews=[0,1,2].map(i=>frameTexture(yitingAtlas,i*512,(i+1)*512));const rightView=yitingViews[1].clone();rightView.repeat.x=-1/3;rightView.offset.x=2/3;rightView.needsUpdate=true;
// Eight distance-driven poses in each of three camera-facing directions.
const walkViews=Array.from({length:3},(_,row)=>Array.from({length:8},(_,col)=>{
 const t=walkAtlas.clone();t.repeat.set(1/8,1/3);t.offset.set(col/8,(2-row)/3);t.needsUpdate=true;return t;
}));
const walkRight=walkViews[2].map((t,col)=>{const r=t.clone();r.repeat.x=-1/8;r.offset.x=(col+1)/8;r.needsUpdate=true;return r;});
const velocity=new T.Vector2();let travel=0,walking=false;const touchKeys=new Map(),stick={x:0,z:0,pointer:null};
function held(key){return keys.has(key)||Array.from(touchKeys.values()).includes(key);}
function clearInput(){keys.clear();touchKeys.clear();stick.x=stick.z=0;stick.pointer=null;drag=null;document.querySelectorAll('.held').forEach(b=>b.classList.remove('held'));if($('stickThumb'))$('stickThumb').style.transform='translate(0,0)';}
// Blend adjacent distance-driven poses in premultiplied alpha, avoiding hard cuts.
const gaitUniforms={nextMap:{value:walkViews[0][0]},nextTransform:{value:new T.Matrix3()},poseBlend:{value:0},oldMap:{value:yitingViews[2]},oldTransform:{value:new T.Matrix3()},stateBlend:{value:1}};
function smoothMaterial(){const m=new T.SpriteMaterial({map:yitingViews[2],transparent:true,alphaTest:.08,depthWrite:true});
 m.onBeforeCompile=shader=>{Object.assign(shader.uniforms,gaitUniforms);
 shader.vertexShader=shader.vertexShader.replace('void main() {','varying vec2 gaitUv;\nvoid main() {\ngaitUv=uv;');
 shader.fragmentShader='uniform sampler2D oldMap;\nuniform mat3 oldTransform;\nuniform float stateBlend;\nuniform sampler2D nextMap;\nuniform mat3 nextTransform;\nuniform float poseBlend;\nvarying vec2 gaitUv;\n'+shader.fragmentShader;
 shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`vec4 a=texture2D(map,vMapUv);vec4 b=texture2D(nextMap,(nextTransform*vec3(gaitUv,1.)).xy);
 float alpha=mix(a.a,b.a,poseBlend);vec3 rgb=mix(a.rgb*a.a,b.rgb*b.a,poseBlend)/max(alpha,.0001);vec4 old=texture2D(oldMap,(oldTransform*vec3(gaitUv,1.)).xy);float finalAlpha=mix(old.a,alpha,stateBlend);rgb=mix(old.rgb*old.a,rgb*alpha,stateBlend)/max(finalAlpha,.0001);diffuseColor*=vec4(rgb,finalAlpha);`);
 };return m;}
function setPose(a,b,blend){player.userData.sprite.material.map=a;b.updateMatrix();gaitUniforms.nextMap.value=b;gaitUniforms.nextTransform.value.copy(b.matrix);gaitUniforms.poseBlend.value=blend;}

function character(index,isPlayer=false){const g=new T.Group();const tex=isPlayer?yitingViews[2]:frameTexture(memberAtlas,...memberRanges[index]);const sprite=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,alphaTest:.45,depthWrite:true}));const height=isPlayer?3.25:3.55;sprite.center.set(.5,.02);sprite.scale.set(isPlayer?1.625:(memberRanges[index][1]-memberRanges[index][0])/1024*height,height,1);g.add(sprite);g.userData={sprite,heading:Math.PI};return g;}
const player=character(0,true);player.userData.sprite.material.dispose();player.userData.sprite.material=smoothMaterial();scene.add(player);player.position.set(0,0,8);
const floor=new T.Mesh(new T.PlaneGeometry(60,88),new T.MeshBasicMaterial({color:0xe0c8ff,transparent:true,opacity:.035,depthWrite:false}));floor.rotation.x=-Math.PI/2;floor.position.set(0,-.06,-20);scene.add(floor);
function label(text,color='#e6deff'){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.font='32px Microsoft JhengHei, sans-serif';ctx.textAlign='center';ctx.fillText(text,256,75);const tex=new T.CanvasTexture(c);const s=new T.Sprite(new T.SpriteMaterial({map:tex,depthTest:true}));s.scale.set(5,1.25,1);return s;}
const stops=[
{name:'銀虎',place:'10:20 PM｜星光的邀請',x:0,z:1,hair:0xd9e2ec,coat:0x344457,img:'022',text:'YiTing，終於找到妳了。\n別害怕。這次，換我們來接妳。\n跟著星光走，大家都在等妳。',task:'走向藍色星光，與藝俊相遇。'},
{name:'藝俊',place:'音樂花園｜希望',x:-10,z:-7,hair:0x4c83e0,coat:0xdce9ff,img:'card-0000(1)',text:'這一顆，代表希望。\n希望妳不管走到哪裡，都能記得自己最初喜歡的事情。',task:'走向紫色星光，與諾亞相遇。',star:0},
{name:'諾亞',place:'月光溫室｜溫柔',x:10,z:-12,hair:0xe7d297,coat:0x473c66,img:'card-0000(5)',text:'這一顆，代表溫柔。\n有時候，妳也可以不用那麼努力。\n累的時候，就好好休息吧。',task:'走向粉紅色星光，與斑比相遇。',star:1},
{name:'斑比',place:'光之廣場｜快樂',x:-11,z:-23,hair:0xe090b4,coat:0xe9e5f8,img:'card-0000(3)',text:'快快快！這裡超好玩的！\n這一顆代表快樂！\n以後也要像剛剛那樣，多笑一點！',task:'走向綠色星光，與河玟相遇。',star:2},
{name:'河玟',place:'星海觀景台｜勇氣',x:11,z:-30,hair:0x222a36,coat:0x344c47,img:'card-0000(4)',text:'妳看那裡。雖然它很小，但還是一直在發光。\n這一顆，代表勇氣。\n就算現在還看不見終點，也沒關係。只要繼續往前走就好了。',task:'走向紅色星光，聽銀虎想對妳說的話。',star:3},
{name:'銀虎',place:'安靜的星光步道｜陪伴',x:0,z:-39,hair:0xd9e2ec,coat:0x344457,img:'026',text:'所以今天，我也想把一點力量送給妳。\n這一顆，代表陪伴。\n希望妳都不要忘記，自己也是很重要的人。\n真正的驚喜，還沒開始。',task:'五顆星光已集齊！走向只為妳亮起的舞台。',star:4},
{name:'PLAVE',place:'只為妳亮起的舞台',x:0,z:-49,img:'020',text:'YiTing，生日快樂！\n今天，也是這個世界上，多了一個妳的日子。\n所以今晚，這首歌只送給妳。\n把願望交給星光，妳值得被好好慶祝。',task:'星光旅程完成。回到電影，收下這份生日祝福。'}];
const lanterns=[];stops.forEach((s,i)=>{const color=colors[s.star??4];const ring=mesh(scene,new T.TorusGeometry(2.1,.018,8,64),color,s.x,.07,s.z,1,1,1,true);ring.rotation.x=Math.PI/2;if(i<6){const p=character([3,0,1,2,4,3][i]);p.position.set(s.x,0,s.z);scene.add(p);s.actor=p;}const sign=label(s.name+' · '+(i===0?'邀請':i===6?'生日舞台':['希望','溫柔','快樂','勇氣','陪伴'][s.star]));sign.position.set(s.x,4.2,s.z);scene.add(sign);s.sign=sign;const star=mesh(scene,new T.OctahedronGeometry(.14),color,s.x,3.85,s.z+.9,1,1,1,true);lanterns.push(star);});
// A dotted route links the same encounters as the novel.
let last={x:0,z:8};stops.forEach(s=>{const d=Math.hypot(s.x-last.x,s.z-last.z);for(let i=0;i<d;i+=1.1){const f=i/d;mesh(scene,ball,0x8579ba,last.x+(s.x-last.x)*f,.04,last.z+(s.z-last.z)*f,.055,.035,.055,true);}last=s;});
// Illustrated cast stands beneath the painted castle stage.
for(let i=0;i<5;i++){const p=character(i);p.position.set((i-2)*1.6,0,-51);scene.add(p);}
const vertices=[];for(let i=0;i<1000;i++)vertices.push((Math.random()-.5)*160,6+Math.random()*65,(Math.random()-.5)*150-25);const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));scene.add(new T.Points(geo,new T.PointsMaterial({color:0xcac0ff,size:.09})));
let step=0,collected=[],started=false,paused=false,yaw=0,yawTarget=0,drag=null,lastTime=performance.now(),near=false,autoWalk=false;
try{const save=JSON.parse(localStorage.getItem('yiting-starlight-game-v1'));if(save&&Number.isInteger(save.step)&&save.step>=0&&save.step<=7){step=save.step;collected=stops.slice(0,step).filter(s=>s.star!==undefined).map(s=>s.star);const s=stops[Math.min(step,6)];player.position.set(s.x,0,s.z+5);}}catch{}
function updateHUD(){const target=stops[Math.min(step,6)];$('task').textContent=step===7?stops[6].task:step===0?'走向銀虎，接受今晚的邀請。':stops[step-1].task;$('stars').replaceChildren();colors.forEach((c,i)=>{const el=document.createElement('span');el.className='star'+(collected.includes(i)?' found':'');el.style.color='#'+c.toString(16).padStart(6,'0');el.textContent='✦';el.title=['希望','溫柔','快樂','勇氣','陪伴'][i];$('stars').append(el);});lanterns.forEach((l,i)=>{l.visible=i>=step;stops[i].sign.visible=i>=step;});}
function interact(){if(!near||paused||!started||$('conversation').open)return;clearInput();velocity.set(0,0);autoWalk=false;$('route').textContent='沿星光前往';const s=stops[Math.min(step,6)];$('portrait').src=`assets/${s.img}.webp`;$('portrait').alt=s.name+'與 YiTing 的生日相遇';$('name').textContent=s.name;$('place').textContent=s.place;$('words').textContent=s.text;$('filmLink').hidden=step<6;$('continue').textContent=step>=6?'留在星光世界':step===0?'接受邀請，走進星光':'收下星光，繼續旅程';$('conversation').showModal();}
$('route').onclick=()=>{if(!started||paused||$('conversation').open)return;autoWalk=!autoWalk;$('route').textContent=autoWalk?'停止引導':'沿星光前往';};$('restart').onclick=()=>{step=0;collected=[];player.position.set(0,0,8);player.userData.heading=Math.PI;velocity.set(0,0);travel=0;yaw=yawTarget=0;clearInput();autoWalk=false;cameraAnchor.set(0,0,8);try{localStorage.removeItem('yiting-starlight-game-v1');}catch{}updateHUD();};$('talk').onclick=interact;$('continue').onclick=()=>{if(step<7){const s=stops[step];if(s.star!==undefined&&!collected.includes(s.star))collected.push(s.star);step++;try{localStorage.setItem('yiting-starlight-game-v1',JSON.stringify({step}));}catch{}updateHUD();}$('conversation').close();};$('conversation').addEventListener('cancel',e=>e.preventDefault());
$('begin').onclick=()=>{clearInput();started=true;$('welcome').close();lastTime=performance.now();};
function togglePause(){paused=!paused;clearInput();velocity.set(0,0);$('pause').textContent=paused?'繼續':'暫停';if(paused)$('bgm').pause();} $('pause').onclick=togglePause;
$('music').onclick=()=>{const a=$('bgm');if(a.paused)a.play().then(()=>$('music').textContent='關閉音樂').catch(()=>$('music').textContent='再點一次播放');else{a.pause();$('music').textContent='開啟音樂';}};
addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();if(e.repeat)return;if(e.key.toLowerCase()==='e')interact();else if(e.key.toLowerCase()==='p'&&started&&!$('conversation').open)togglePause();else keys.add(e.key.toLowerCase());});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
document.querySelectorAll('[data-key]').forEach(b=>{
 b.onpointerdown=e=>{if(!started||paused||$('conversation').open)return;e.preventDefault();b.setPointerCapture(e.pointerId);touchKeys.set(e.pointerId,b.dataset.key.toLowerCase());b.classList.add('held');};
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,e=>{touchKeys.delete(e.pointerId);b.classList.remove('held');});
});
const joystick=$('joystick');
function moveStick(e){const r=joystick.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dz=e.clientY-r.top-r.height/2,max=r.width*.32,len=Math.hypot(dx,dz),scale=len>max?max/len:1;
 const strength=Math.min(len/max,1);stick.x=strength<.12?0:dx/Math.max(len,1)*strength;stick.z=strength<.12?0:dz/Math.max(len,1)*strength;
 $('stickThumb').style.transform=`translate(${dx*scale}px,${dz*scale}px)`;
}
joystick.onpointerdown=e=>{if(!started||paused||$('conversation').open||stick.pointer!==null)return;e.preventDefault();stick.pointer=e.pointerId;joystick.setPointerCapture(e.pointerId);joystick.classList.add('held');moveStick(e);};
joystick.onpointermove=e=>{if(e.pointerId===stick.pointer)moveStick(e);};
for(const ev of ['pointerup','pointercancel','lostpointercapture'])joystick.addEventListener(ev,e=>{if(e.pointerId===stick.pointer){stick.pointer=null;stick.x=stick.z=0;joystick.classList.remove('held');$('stickThumb').style.transform='translate(0,0)';}});
$('world').onpointerdown=e=>{if(!started||paused||$('conversation').open)return;drag={id:e.pointerId,x:e.clientX};$('world').setPointerCapture(e.pointerId);};
$('world').onpointermove=e=>{if(drag&&drag.id===e.pointerId){yawTarget-=(e.clientX-drag.x)*.0045;drag.x=e.clientX;}};
for(const ev of ['pointerup','pointercancel','lostpointercapture'])$('world').addEventListener(ev,e=>{if(drag?.id===e.pointerId)drag=null;});
addEventListener('blur',clearInput);document.addEventListener('visibilitychange',()=>{clearInput();if(document.hidden&&started&&!paused)togglePause();});
const cameraAnchor=player.position.clone(),cameraOffset=new T.Vector3();let previousFacing=null,poseState='',stateTime=1,lastPose=yitingViews[2];
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}addEventListener('resize',resize);resize();updateHUD();
function frame(now){requestAnimationFrame(frame);const dt=Math.min(Math.max((now-lastTime)/1000,0),.1);lastTime=now;
 const moving=started&&!paused&&!$('conversation').open&&!document.hidden;
 if(moving){yaw=damp(yaw,yawTarget,14,dt);let x=(held('d')||held('arrowright')?1:0)-(held('a')||held('arrowleft')?1:0)+stick.x,z=(held('s')||held('arrowdown')?1:0)-(held('w')||held('arrowup')?1:0)+stick.z;
 if(x||z){if(autoWalk){autoWalk=false;$('route').textContent='沿星光前往';}}
 let speed=3;
 if(autoWalk){const target=stops[Math.min(step,6)],dx=target.x-player.position.x,dz=target.z-player.position.z,d=Math.hypot(dx,dz);speed=arrivalSpeed(d);
 if(d<2.22&&velocity.length()<.18){autoWalk=false;$('route').textContent='沿星光前往';speed=0;}
 else{x=(dx*Math.cos(yaw)-dz*Math.sin(yaw))/Math.max(d,.001);z=(dz*Math.cos(yaw)+dx*Math.sin(yaw))/Math.max(d,.001);}}
 const len=Math.hypot(x,z);if(len>1){x/=len;z/=len;}const direction=cameraDirection(x,z,yaw);
 const count=Math.max(1,Math.ceil(dt/(1/120))),tick=dt/count;let moved=0;
 for(let i=0;i<count;i++){advanceVelocity(velocity,direction.x*speed,direction.z*speed,tick);const oldX=player.position.x,oldZ=player.position.z;
 player.position.x=T.MathUtils.clamp(oldX+velocity.x*tick,-21,21);player.position.z=T.MathUtils.clamp(oldZ+velocity.y*tick,-54,13);
 if(player.position.x===oldX&&Math.abs(velocity.x)>.01)velocity.x=0;if(player.position.z===oldZ&&Math.abs(velocity.y)>.01)velocity.y=0;
 moved+=Math.hypot(player.position.x-oldX,player.position.z-oldZ);}
 travel+=moved;walking=moved>.0001&&velocity.length()>.035;
 if(walking){const desired=Math.atan2(velocity.x,velocity.y);player.userData.heading+=wrappedAngle(desired-player.userData.heading)*(1-Math.exp(-dt*15));}
 }

const target=stops[Math.min(step,6)],distance=Math.hypot(player.position.x-target.x,player.position.z-target.z);near=distance<3.2;const disabled=!near||paused;if($('talk').disabled!==disabled)$('talk').disabled=disabled;const talkLabel=near?'與 '+target.name+' 交談':'靠近 '+target.name;if($('talk').textContent!==talkLabel)$('talk').textContent=talkLabel;const distanceLabel=paused?'旅程已暫停':step===7?'五道星光，一個只屬於妳的夜晚。':target.name+' · '+Math.round(distance)+' 公尺';if($('distance').textContent!==distanceLabel)$('distance').textContent=distanceLabel;
if(moving){cameraAnchor.lerp(player.position,1-Math.exp(-dt*14));}
 cameraOffset.set(Math.sin(yaw)*7,3.3,Math.cos(yaw)*7);camera.position.copy(cameraAnchor).add(cameraOffset);camera.lookAt(cameraAnchor.x,3,cameraAnchor.z);
 lanterns.forEach((l,i)=>{if(!moving)return;l.rotation.y=now*.001;l.position.y=3.85+Math.sin(now*.0015+i)*.12;});
 const angle=wrappedAngle(player.userData.heading-yaw),facing=stableFacing(angle,previousFacing);previousFacing=facing;
 const sprite=player.userData.sprite,phase=(travel/2.7%1)*8,pose=Math.floor(phase),fraction=phase-pose;
 if(moving||!started){const state=facing.name+':'+walking;
 if(state!==poseState){gaitUniforms.oldMap.value=lastPose;lastPose.updateMatrix();gaitUniforms.oldTransform.value.copy(lastPose.matrix);stateTime=0;poseState=state;}
 stateTime=Math.min(1,stateTime+dt/.16);gaitUniforms.stateBlend.value=stateTime*stateTime*(3-2*stateTime);
 if(walking){const frames=facing.mirror?walkRight:walkViews[facing.row];setPose(frames[pose],frames[(pose+1)%8],fraction*fraction*(3-2*fraction));lastPose=frames[fraction<.5?pose:(pose+1)%8];}
 else{const idle=facing.mirror?rightView:yitingViews[facing.view];setPose(idle,idle,0);lastPose=idle;}
 sprite.position.y=damp(sprite.position.y,walking?.05:0,18,dt);
 }
 sprite.scale.x=1.625;
 $('world').dataset.motion=!moving&&started?'frozen':walking?'walking':'idle';$('world').dataset.walkFrame=String(pose);$('world').dataset.facing=facing.name;
 $('world').dataset.speed=velocity.length().toFixed(2);$('world').dataset.paused=String(paused);$('world').dataset.position=`${player.position.x.toFixed(2)},${player.position.z.toFixed(2)}`;
$('paintedWorld').style.backgroundPosition=`${50+Math.sin(yaw)*9}% center`;
renderer.render(scene,camera);}
camera.position.set(0,3.3,15);requestAnimationFrame(frame);
