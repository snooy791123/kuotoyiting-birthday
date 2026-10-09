import * as T from './three.module.js';
import {createPerformer,batchRig} from './plave-3d.js?v=world3d-v3';
import {createWorld3D} from './world-3d.js?v=world3d-v3';
import { createYiTing } from './yiting-rig.js?v=world3d-v3';
import { facingFor, cameraDirection, damp, wrappedAngle, advanceVelocity, arrivalSpeed, stableFacing } from './locomotion.js?v=motion-v4';
const $=id=>document.getElementById(id),keys=new Set(),colors=[0x59a8ff,0xaf85ff,0xff83c8,0x6ee9b6,0xff727e];
let renderer;try{renderer=new T.WebGLRenderer({canvas:$('world'),antialias:true,alpha:true});}catch(e){$('welcome').showModal();$('error').textContent='此裝置暫時無法顯示 3D 世界，請改用其他瀏覽器，或回到電影模式。';$('begin').disabled=true;throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.outputColorSpace=T.SRGBColorSpace;
const scene=new T.Scene();scene.background=new T.Color(0x10132b);scene.fog=new T.FogExp2(0x171a36,.009);const camera=new T.PerspectiveCamera(55,1,.1,180);scene.add(new T.HemisphereLight(0xc9b9ff,0x293756,2.4));const sun=new T.DirectionalLight(0xb9cbff,2.7);sun.position.set(-8,15,10);scene.add(sun);
const materials=new Map();function material(c,glow=false){const key=c+':'+glow;if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color:c,roughness:.7,emissive:glow?c:0,emissiveIntensity:glow?.7:0}));return materials.get(key);}
function mesh(parent,geo,c,x,y,z,sx=1,sy=1,sz=1,glow=false){const m=new T.Mesh(geo,material(c,glow));m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m;}
const box=new T.BoxGeometry(1,1,1),ball=new T.SphereGeometry(1,16,12),cylinder=new T.CylinderGeometry(1,1,1,24);
$('welcome').showModal();$('begin').disabled=true;$('error').textContent='正在接住星光與角色插畫…';
function artImage(id){const img=$(id);return new Promise((resolve,reject)=>{if(img.complete){img.naturalWidth?resolve(img):reject(new Error('image failed'));}else{img.addEventListener('load',()=>resolve(img),{once:true});img.addEventListener('error',()=>reject(new Error('image failed')),{once:true});}});}
let memberAtlas,yitingAtlas;
try{const [yi,im]=await Promise.all([artImage('yitingArt'),artImage('membersArt')]);memberAtlas=new T.Texture(im);memberAtlas.colorSpace=T.SRGBColorSpace;memberAtlas.needsUpdate=true;yitingAtlas=new T.Texture(yi);yitingAtlas.colorSpace=T.SRGBColorSpace;yitingAtlas.needsUpdate=true;$('begin').disabled=false;$('error').textContent='';}catch(e){$('error').textContent='角色素材未能載入，請重新整理再試一次。';$('begin').disabled=true;throw e;}
const memberRanges=[[0,342],[342,626],[626,900],[900,1200],[1200,1536]];
function frameTexture(atlas,left,right){const tex=atlas.clone();tex.repeat.set((right-left)/1536,1);tex.offset.set(left/1536,0);tex.needsUpdate=true;return tex;}
const textureLoader=new T.TextureLoader();
function sceneTexture(name){const tex=textureLoader.load(`assets/${name}.webp`);tex.colorSpace=T.SRGBColorSpace;return tex;}
const world3D=createWorld3D({textures:{billboard:sceneTexture('007'),phone:sceneTexture('005'),portal:sceneTexture('014')}});scene.add(world3D.root);
const actors3D=[];
const velocity=new T.Vector2();let travel=0,walking=false;const touchKeys=new Map(),stick={x:0,z:0,pointer:null};
function held(key){return keys.has(key)||Array.from(touchKeys.values()).includes(key);}
function clearInput(){keys.clear();touchKeys.clear();stick.x=stick.z=0;stick.pointer=null;drag=null;document.querySelectorAll('.held').forEach(b=>b.classList.remove('held'));if($('stickThumb'))$('stickThumb').style.transform='translate(0,0)';}
function character(index){const g=createPerformer(index,{atlas:memberAtlas});g.userData.heading=0;actors3D.push(g);return g;}
const player=batchRig(createYiTing(yitingAtlas));scene.add(player);player.position.set(0,0,8);
// A small contact shadow grounds the 3D feet without expensive scene-wide shadows.
const shadow=new T.Mesh(new T.CircleGeometry(.48,32),new T.MeshBasicMaterial({color:0x17122a,transparent:true,opacity:.19,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.005;scene.add(shadow);
const floor=new T.Mesh(new T.PlaneGeometry(60,88),new T.MeshBasicMaterial({color:0xe0c8ff,transparent:true,opacity:.035,depthWrite:false}));floor.rotation.x=-Math.PI/2;floor.position.set(0,-.06,-20);floor.visible=false;scene.add(floor);
function label(text,color='#e6deff'){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.font='32px Microsoft JhengHei, sans-serif';ctx.textAlign='center';ctx.fillText(text,256,75);const tex=new T.CanvasTexture(c);const s=new T.Sprite(new T.SpriteMaterial({map:tex,depthTest:true}));s.scale.set(5,1.25,1);return s;}
const encounters=[
{name:'銀虎',place:'10:20 PM｜星光的邀請',x:0,z:1,hair:0xd9e2ec,coat:0x344457,img:'022',text:'YiTing，終於找到妳了。\n別害怕。這次，換我們來接妳。\n跟著星光走，大家都在等妳。',task:'走向藍色星光，與藝俊相遇。'},
{name:'藝俊',place:'音樂花園｜希望',x:-10,z:-7,hair:0x4c83e0,coat:0xdce9ff,img:'card-0000(1)',text:'這一顆，代表希望。\n希望妳不管走到哪裡，都能記得自己最初喜歡的事情。',task:'走向紫色星光，與諾亞相遇。',star:0},
{name:'諾亞',place:'月光溫室｜溫柔',x:10,z:-12,hair:0xe7d297,coat:0x473c66,img:'card-0000(5)',text:'這一顆，代表溫柔。\n有時候，妳也可以不用那麼努力。\n累的時候，就好好休息吧。',task:'走向粉紅色星光，與斑比相遇。',star:1},
{name:'斑比',place:'光之廣場｜快樂',x:-11,z:-23,hair:0xe090b4,coat:0xe9e5f8,img:'card-0000(3)',text:'快快快！這裡超好玩的！\n這一顆代表快樂！\n以後也要像剛剛那樣，多笑一點！',task:'走向綠色星光，與河玟相遇。',star:2},
{name:'河玟',place:'星海觀景台｜勇氣',x:11,z:-30,hair:0x222a36,coat:0x344c47,img:'card-0000(4)',text:'妳看那裡。雖然它很小，但還是一直在發光。\n這一顆，代表勇氣。\n就算現在還看不見終點，也沒關係。只要繼續往前走就好了。',task:'走向紅色星光，聽銀虎想對妳說的話。',star:3},
{name:'銀虎',place:'安靜的星光步道｜陪伴',x:0,z:-39,hair:0xd9e2ec,coat:0x344457,img:'026',text:'所以今天，我也想把一點力量送給妳。\n這一顆，代表陪伴。\n希望妳都不要忘記，自己也是很重要的人。\n真正的驚喜，還沒開始。',task:'五顆星光已集齊！走向只為妳亮起的舞台。',star:4},
{name:'PLAVE',place:'只為妳亮起的舞台',x:0,z:-49,img:'020',text:'YiTing，生日快樂！\n今天，也是這個世界上，多了一個妳的日子。\n所以今晚，這首歌只送給妳。\n把願望交給星光，妳值得被好好慶祝。',task:'星光旅程完成。回到電影，收下這份生日祝福。'}];
const cityStops=[
{name:'手機訊息',place:'城市街道｜10:20 PM',x:0,z:1,img:'005',action:'查看手機',text:'城市仍然熱鬧，妳的手機卻在此刻亮起。\n10:20 PM。\n今晚的故事，從這一束微小的光開始。',task:'沿街道前往 PLAVE 巨幕，抬頭看看。',city:true},
{name:'PLAVE 巨幕',place:'霓虹街口｜只為妳亮起',x:-6,z:-7,img:'006',action:'抬頭看巨幕',text:'熟悉的五張面孔，在霓虹之中亮起。\n藝俊、諾亞、斑比、銀虎、河玟。\n這一次，畫面裡的星光彷彿正朝妳靠近。',task:'走向紅色星光，聽銀虎的邀請。',city:true},
{name:'銀虎的邀請',place:'街角｜伸向妳的手',x:4,z:-16,img:'010',action:'接受銀虎邀請',text:'YiTing，妳願意跟我一起走嗎？\n銀虎向妳伸出手。\n夜色之中，一條通往星光的路慢慢浮現。',task:'跟著銀虎，走向星光之門。',city:true},
{name:'星光之門',place:'城市盡頭｜穿越星光',x:0,z:-26,img:'013',action:'靠近星光之門',text:'街上的聲音漸漸遠去。\n妳握著銀虎的手，走向門後的世界。\n五道星光，和一份只為妳準備的驚喜，正在等妳。',task:'抵達 ASTERUM，與銀虎相遇。',city:true}
];
const stops=[...cityStops,...encounters],lastStep=stops.length-1,saveKey='yiting-starlight-journey-v2';
const routeDots=[],stageCast=[];
const cityEunho=character(3);cityEunho.position.set(4,0,-16);scene.add(cityEunho);
const lanterns=[];stops.forEach((s,i)=>{const color=colors[s.star??4];const ring=mesh(scene,new T.TorusGeometry(2.1,.018,8,64),color,s.x,.07,s.z,1,1,1,true);ring.rotation.x=Math.PI/2;s.ring=ring;if(i>=4&&i<lastStep){const p=character([3,0,1,2,4,3][i-4]);p.position.set(s.x,0,s.z);scene.add(p);s.actor=p;}const sign=label(s.name+' · '+(s.city?'探索':i===4?'邀請':i===lastStep?'生日舞台':['希望','溫柔','快樂','勇氣','陪伴'][s.star]));sign.position.set(s.x,4.2,s.z);scene.add(sign);s.sign=sign;const star=mesh(scene,new T.OctahedronGeometry(.14),color,s.x,3.85,s.z+.9,1,1,1,true);lanterns.push(star);});
// A dotted route links the same encounters as the novel.
let last={x:0,z:8};stops.forEach((s,index)=>{if(index===4)last={x:0,z:8};const d=Math.hypot(s.x-last.x,s.z-last.z);for(let i=0;i<d;i+=1.1){const f=i/d;const dot=mesh(scene,ball,0x8579ba,last.x+(s.x-last.x)*f,.04,last.z+(s.z-last.z)*f,.055,.035,.055,true);routeDots.push({dot,city:!!s.city,index});}last=s;});
// Illustrated cast stands beneath the painted castle stage.
for(let i=0;i<5;i++){const p=character(i);p.position.set((i-2)*1.6,.08,-51);scene.add(p);stageCast.push(p);}
const vertices=[];for(let i=0;i<1000;i++)vertices.push((Math.random()-.5)*160,6+Math.random()*65,(Math.random()-.5)*150-25);const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));scene.add(new T.Points(geo,new T.PointsMaterial({color:0xcac0ff,size:.09})));
let companionTravel=0,worldTime=0;
let step=0,collected=[],started=false,paused=false,yaw=0,yawTarget=0,drag=null,lastTime=performance.now(),near=false,autoWalk=false;
try{const save=JSON.parse(localStorage.getItem(saveKey));if(save&&Number.isInteger(save.step)&&save.step>=0&&save.step<=stops.length){step=save.step;collected=stops.slice(0,step).filter(s=>s.star!==undefined).map(s=>s.star);const s=stops[Math.min(step,lastStep)];player.position.set(s.x,0,s.z+5);}}catch{}
function updateHUD(){const city=step<4;
document.body.dataset.chapter=city?'city':'asterum';
world3D.setChapter(step);cityEunho.visible=step===2||step===3;
scene.background.set(city?0x11162e:0x19182f);scene.fog.color.copy(scene.background);
$('paintedWorld').style.backgroundImage='none';
$('chapterTitle').textContent=city?'10:20 PM / CITY':'10:20 PM / ASTERUM';
$('task').textContent=step===stops.length?stops[lastStep].task:step===0?'從霓虹街道出發，查看 10:20 PM 的手機訊息。':stops[step-1].task;
$('stars').replaceChildren();colors.forEach((c,i)=>{const el=document.createElement('span');el.className='star'+(collected.includes(i)?' found':'');el.style.color='#'+c.toString(16).padStart(6,'0');el.textContent='✦';el.title=['希望','溫柔','快樂','勇氣','陪伴'][i];$('stars').append(el);});
lanterns.forEach((l,i)=>{const visible=i===Math.min(step,lastStep)&&step<stops.length;l.visible=visible;stops[i].sign.visible=visible;stops[i].ring.visible=visible;if(stops[i].actor)stops[i].actor.visible=!city&&i<=step&&step<lastStep;});
routeDots.forEach(({dot,city:isCity,index})=>dot.visible=isCity===city&&index===step);
stageCast.forEach(p=>p.visible=step>=lastStep);
}
function interact(){if(!near||paused||!started||($('conversation').open||$('storyFilm').open||$('concert').open))return;clearInput();velocity.set(0,0);autoWalk=false;$('route').textContent='沿星光前往';const s=stops[Math.min(step,lastStep)];player.userData.heading=Math.atan2(s.x-player.position.x,s.z-player.position.z);player.userData.greet(true);if(s.actor)s.actor.userData.greet(true);if(s.city&&step===2)cityEunho.userData.greet(true);$('portrait').src=`assets/${s.img}.webp`;$('portrait').alt=s.name+'與 YiTing 的生日相遇';$('name').textContent=s.name;$('place').textContent=s.place;$('words').textContent=s.text;$('filmLink').hidden=step<lastStep;$('continue').textContent=step>=lastStep?'留在星光世界':step===3?'握住銀虎的手，穿越星光':s.city?'繼續探索城市':'收下星光，繼續旅程';$('storyFilmStart').hidden=step>=4;$('concertStart').hidden=step<lastStep;$('conversation').showModal();}
$('route').onclick=()=>{if(!started||paused||($('conversation').open||$('storyFilm').open||$('concert').open))return;autoWalk=!autoWalk;$('route').textContent=autoWalk?'停止引導':'沿星光前往';};$('restart').onclick=()=>{step=0;collected=[];cityEunho.position.set(4,0,-16);companionTravel=0;player.position.set(0,0,8);player.userData.heading=Math.PI;velocity.set(0,0);travel=0;yaw=yawTarget=0;clearInput();autoWalk=false;cameraAnchor.set(0,0,8);try{localStorage.removeItem(saveKey);}catch{}updateHUD();};$('talk').onclick=interact;$('continue').onclick=()=>{const crossedGate=step===3;if(step<stops.length){const s=stops[step];if(s.star!==undefined&&!collected.includes(s.star))collected.push(s.star);step++;if(step===4){player.position.set(0,0,8);cameraAnchor.copy(player.position);velocity.set(0,0);travel=0;yaw=yawTarget=0;player.userData.heading=Math.PI;}try{localStorage.setItem(saveKey,JSON.stringify({step}));}catch{}updateHUD();}player.userData.greet(false);actors3D.forEach(a=>a.userData.greet(false));$('conversation').close();if(crossedGate)playStoryFilm(31.5,38.5,'穿越星光｜與銀虎一起走入 ASTERUM');};$('conversation').addEventListener('cancel',e=>e.preventDefault());
$('begin').onclick=()=>{clearInput();started=true;$('welcome').close();lastTime=performance.now();};
function togglePause(){paused=!paused;clearInput();velocity.set(0,0);$('pause').textContent=paused?'繼續':'暫停';if(paused)$('bgm').pause();} $('pause').onclick=togglePause;
$('music').onclick=()=>{const a=$('bgm');if(a.paused)a.play().then(()=>$('music').textContent='關閉音樂').catch(()=>$('music').textContent='再點一次播放');else{a.pause();$('music').textContent='開啟音樂';}};
addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();if(e.repeat)return;if(e.key.toLowerCase()==='e')interact();else if(e.key.toLowerCase()==='p'&&started&&!($('conversation').open||$('storyFilm').open||$('concert').open))togglePause();else keys.add(e.key.toLowerCase());});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
document.querySelectorAll('[data-key]').forEach(b=>{
 b.onpointerdown=e=>{if(!started||paused||($('conversation').open||$('storyFilm').open||$('concert').open))return;e.preventDefault();b.setPointerCapture(e.pointerId);touchKeys.set(e.pointerId,b.dataset.key.toLowerCase());b.classList.add('held');};
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,e=>{touchKeys.delete(e.pointerId);b.classList.remove('held');});
});
const joystick=$('joystick');
function moveStick(e){const r=joystick.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dz=e.clientY-r.top-r.height/2,max=r.width*.32,len=Math.hypot(dx,dz),scale=len>max?max/len:1;
 const strength=Math.min(len/max,1);stick.x=strength<.12?0:dx/Math.max(len,1)*strength;stick.z=strength<.12?0:dz/Math.max(len,1)*strength;
 $('stickThumb').style.transform=`translate(${dx*scale}px,${dz*scale}px)`;
}
joystick.onpointerdown=e=>{if(!started||paused||($('conversation').open||$('storyFilm').open||$('concert').open)||stick.pointer!==null)return;e.preventDefault();stick.pointer=e.pointerId;joystick.setPointerCapture(e.pointerId);joystick.classList.add('held');moveStick(e);};
joystick.onpointermove=e=>{if(e.pointerId===stick.pointer)moveStick(e);};
for(const ev of ['pointerup','pointercancel','lostpointercapture'])joystick.addEventListener(ev,e=>{if(e.pointerId===stick.pointer){stick.pointer=null;stick.x=stick.z=0;joystick.classList.remove('held');$('stickThumb').style.transform='translate(0,0)';}});
$('world').onpointerdown=e=>{if(!started||paused||($('conversation').open||$('storyFilm').open||$('concert').open))return;drag={id:e.pointerId,x:e.clientX};$('world').setPointerCapture(e.pointerId);};
$('world').onpointermove=e=>{if(drag&&drag.id===e.pointerId){yawTarget-=(e.clientX-drag.x)*.0045;drag.x=e.clientX;}};
for(const ev of ['pointerup','pointercancel','lostpointercapture'])$('world').addEventListener(ev,e=>{if(drag?.id===e.pointerId)drag=null;});
addEventListener('blur',clearInput);document.addEventListener('visibilitychange',()=>{clearInput();if(document.hidden&&started&&!paused)togglePause();});
const cameraRay=new T.Raycaster();
const cameraAnchor=player.position.clone(),cameraOffset=new T.Vector3();let previousFacing=null;
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}addEventListener('resize',resize);resize();updateHUD();
function frame(now){requestAnimationFrame(frame);const dt=Math.min(Math.max((now-lastTime)/1000,0),.1);lastTime=now;
 const moving=started&&!paused&&!($('conversation').open||$('storyFilm').open||$('concert').open)&&!$('storyFilm').open&&!document.hidden;
 if(moving){yaw=damp(yaw,yawTarget,14,dt);let x=(held('d')||held('arrowright')?1:0)-(held('a')||held('arrowleft')?1:0)+stick.x,z=(held('s')||held('arrowdown')?1:0)-(held('w')||held('arrowup')?1:0)+stick.z;
 if(x||z){if(autoWalk){autoWalk=false;$('route').textContent='沿星光前往';}}
 let speed=3;
 if(autoWalk){const target=stops[Math.min(step,lastStep)],dx=target.x-player.position.x,dz=target.z-player.position.z,d=Math.hypot(dx,dz);speed=arrivalSpeed(d);
 if(d<2.22&&velocity.length()<.18){autoWalk=false;$('route').textContent='沿星光前往';speed=0;}
 else{x=(dx*Math.cos(yaw)-dz*Math.sin(yaw))/Math.max(d,.001);z=(dz*Math.cos(yaw)+dx*Math.sin(yaw))/Math.max(d,.001);}}
 const len=Math.hypot(x,z);if(len>1){x/=len;z/=len;}const direction=cameraDirection(x,z,yaw);
 const count=Math.max(1,Math.ceil(dt/(1/120))),tick=dt/count;let moved=0;
 for(let i=0;i<count;i++){advanceVelocity(velocity,direction.x*speed,direction.z*speed,tick);const oldX=player.position.x,oldZ=player.position.z;
 const next=world3D.constrain(oldX+velocity.x*tick,oldZ+velocity.y*tick);player.position.x=next.x;player.position.z=next.z;
 if(player.position.x===oldX&&Math.abs(velocity.x)>.01)velocity.x=0;if(player.position.z===oldZ&&Math.abs(velocity.y)>.01)velocity.y=0;
 moved+=Math.hypot(player.position.x-oldX,player.position.z-oldZ);}
 player.position.y=damp(player.position.y,world3D.groundHeight(player.position.x,player.position.z),18,dt);travel+=moved;walking=moved>.0001&&velocity.length()>.035;
 if(walking){const desired=Math.atan2(velocity.x,velocity.y);player.userData.heading+=wrappedAngle(desired-player.userData.heading)*(1-Math.exp(-dt*15));}
 }

const target=stops[Math.min(step,lastStep)],distance=Math.hypot(player.position.x-target.x,player.position.z-target.z);near=distance<3.2;const disabled=!near||paused;if($('talk').disabled!==disabled)$('talk').disabled=disabled;const talkLabel=near?(target.action||'與 '+target.name+' 交談'):'靠近 '+target.name;if($('talk').textContent!==talkLabel)$('talk').textContent=talkLabel;const distanceLabel=paused?'旅程已暫停':step===stops.length?'五道星光，一個只屬於妳的夜晚。':target.name+' · '+Math.round(distance)+' 公尺';if($('distance').textContent!==distanceLabel)$('distance').textContent=distanceLabel;
if(moving){cameraAnchor.lerp(player.position,1-Math.exp(-dt*14));}
 cameraOffset.set(Math.sin(yaw)*7,3.3,Math.cos(yaw)*7);camera.position.copy(cameraAnchor).add(cameraOffset);camera.lookAt(cameraAnchor.x,3,cameraAnchor.z);
 if(step<4){const origin=new T.Vector3(cameraAnchor.x,3,cameraAnchor.z),rayDirection=camera.position.clone().sub(origin),length=rayDirection.length();cameraRay.set(origin,rayDirection.normalize());cameraRay.far=length;const hits=cameraRay.intersectObjects(world3D.occluders,false);if(hits.length)camera.position.copy(origin).addScaledVector(rayDirection,Math.max(1.4,hits[0].distance-.4));camera.lookAt(origin);}
 lanterns.forEach((l,i)=>{if(!moving)return;l.rotation.y=now*.001;l.position.y=3.85+Math.sin(now*.0015+i)*.12;});
 const angle=wrappedAngle(player.userData.heading-yaw),facing=stableFacing(angle,previousFacing);previousFacing=facing;
 if((!paused&&!document.hidden)||!started)player.userData.update(dt,travel,velocity.length(),player.userData.heading);
 shadow.position.y=player.position.y+.008;shadow.position.x=player.position.x;shadow.position.z=player.position.z;
 $('world').dataset.motion=!moving&&started?'frozen':walking?'walking':'idle';$('world').dataset.facing=facing.name;
 $('world').dataset.rig='skinned-mesh';$('world').dataset.scene=step<4?'city-3d':step>=10?'concert-3d':'asterum-3d';$('world').dataset.cast='five-skinned-3d';$('world').dataset.bones=String(player.userData.skeleton.bones.length);
$('world').dataset.speed=velocity.length().toFixed(2);$('world').dataset.paused=String(paused);$('world').dataset.position=`${player.position.x.toFixed(2)},${player.position.z.toFixed(2)}`;
$('paintedWorld').style.backgroundPosition=`${50+Math.sin(yaw)*9}% center`;
if(!paused&&!document.hidden){worldTime+=dt;world3D.update(worldTime);actors3D.forEach(a=>{if(!a.visible)return;let speed=0;if(a===cityEunho&&step===3&&moving){const dx=-a.position.x,dz=-23-a.position.z,d=Math.hypot(dx,dz);speed=d>.1?Math.min(2,d*2):0;const moved=Math.min(d,speed*dt);a.position.x+=dx/Math.max(d,.001)*moved;a.position.z+=dz/Math.max(d,.001)*moved;companionTravel+=moved;a.userData.heading=Math.atan2(dx,dz);}const heading=Math.atan2(player.position.x-a.position.x,player.position.z-a.position.z);a.userData.update(dt,a===cityEunho?companionTravel:0,speed,speed>.1?a.userData.heading:heading,step>=lastStep&&stageCast.includes(a));});}
renderer.render(scene,camera);$('world').dataset.drawCalls=String(renderer.info.render.calls);$('world').dataset.triangles=String(renderer.info.render.triangles);}
camera.position.set(0,3.3,15);requestAnimationFrame(frame);

const concert=$('concertVideo');
$('concertStart').onclick=()=>{clearInput();velocity.set(0,0);$('bgm').pause();$('concert').showModal();concert.currentTime=38.5;concert.play().catch(()=>$('concertNotice').textContent='輕觸影片上的播放鍵，收下生日演唱。');};
function closeConcert(){concert.pause();$('concertSong').pause();$('concert').close();}
$('concertClose').onclick=closeConcert;$('concert').addEventListener('cancel',e=>{e.preventDefault();closeConcert();});


const birthdaySong=$('concertSong');
function playBirthdaySong(){concert.pause();birthdaySong.currentTime=0;birthdaySong.play().catch(()=>$('concertNotice').textContent='輕觸音樂播放鍵，聆聽完整生日歌曲。');}
concert.addEventListener('ended',playBirthdaySong);$('concertSongStart').onclick=playBirthdaySong;
concert.addEventListener('play',()=>birthdaySong.pause());
concert.addEventListener('timeupdate',()=>{const line=window.STORY.subtitles.find(s=>concert.currentTime>=s.start&&concert.currentTime<s.end);$('concertCaption').textContent=line?.text||'';});
birthdaySong.addEventListener('timeupdate',()=>{const line=window.STORY.lyrics.find(s=>birthdaySong.currentTime>=s.start&&birthdaySong.currentTime<s.end);$('concertCaption').textContent=line?.text||'';});

const storyFilm=$('storyFilmVideo');let storyFilmEnd=0;
function playStoryFilm(start,end,title){clearInput();velocity.set(0,0);$('bgm').pause();storyFilmEnd=end;$('storyFilmTitle').textContent=title;$('storyFilm').showModal();storyFilm.currentTime=start;storyFilm.play().catch(()=>$('storyFilmCaption').textContent='輕觸影片播放鍵，觀看這一幕。');}
function closeStoryFilm(){storyFilm.pause();$('storyFilm').close();}
$('storyFilmClose').onclick=closeStoryFilm;$('storyFilm').addEventListener('cancel',e=>{e.preventDefault();closeStoryFilm();});
$('storyFilmStart').onclick=()=>{const segments=[[8,15],[15,20.5],[20.5,31.5],[31.5,38.5]],clip=segments[Math.min(step,3)];playStoryFilm(clip[0],clip[1],stops[Math.min(step,lastStep)].place);};
storyFilm.addEventListener('timeupdate',()=>{const sub=window.STORY.subtitles.find(s=>storyFilm.currentTime>=s.start&&storyFilm.currentTime<s.end);$('storyFilmCaption').textContent=sub?.text||'';if(storyFilm.currentTime>=storyFilmEnd)closeStoryFilm();});
storyFilm.addEventListener('ended',closeStoryFilm);




