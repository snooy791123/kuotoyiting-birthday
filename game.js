const PAGES=[
['002','城市的來信','故事旁白','今晚，城市為妳亮起','YiTing 走在熟悉的霓虹街道。\n人群匆匆經過，妳卻在星光與巨幕之間，放慢了腳步。',6,8],
['005','城市的來信','故事旁白','10:20 PM','手機突然亮了。\n這則訊息，像是只為妳而來。',8,12,'查看訊息 →'],
['004','城市的來信','故事旁白','被記得的溫暖','妳低頭看著手機，心裡浮起一點期待。\n今晚，好像真的有什麼不同。',12,15],
['006','城市的來信','故事旁白','抬起頭，看看星光','熟悉的身影出現在城市巨幕上。\n藝俊、諾亞、斑比、銀虎、河玟——五道星光正在等妳。',15,19.5],
['007','城市的來信','PLAVE · 故事台詞','這一次，為妳而來','YiTing，今晚的星光，是為妳亮起的。\n我們有一份驚喜，想親自交給妳。',19.5,20.5],
['009','銀虎的邀請','銀虎 · 故事台詞','我看見妳了','YiTing，我看見妳了。\n今晚，跟我一起走吧。',20.5,25],
['010','銀虎的邀請','銀虎 · 故事台詞','把手交給我','銀虎朝妳伸出了手。\n「這一次，由我走向妳。」',25,29,'牽住銀虎的手 →'],
['008','銀虎的邀請','故事旁白','妳向星光靠近','妳抬起頭，望向那份溫柔的邀請。\n原來，隔著螢幕的距離，也可以在這一刻變得很近。',29,31],
['011','銀虎的邀請','故事旁白','一起出發','妳把手交給他。\n螢幕與現實之間，一條星光的路慢慢浮現。',31,31.5],
['013','穿越星光','銀虎 · 故事台詞','不用害怕，我就在這裡','城市的聲音漸漸遠去。\n銀虎陪著妳，走向星光之門。',31.5,33.5,'穿過星光之門 →'],
['014','穿越星光','故事旁白','走入 ASTERUM','穿過星光，所有距離都變得很輕。\n門後，是一個為妳準備的世界。',33.5,35],
['016','穿越星光','故事旁白','五種光，一個舞台','城堡、星海與舞台，在眼前展開。\n這片宇宙，為妳亮起了五種光。',35,38.5],
['018','只為妳的舞台','PLAVE · 故事台詞','歡迎來到我們身邊','YiTing，歡迎來到只為妳準備的舞台。\n今晚的主角，是妳。',38.5,42.5],
['021','只為妳的舞台','銀虎 · 故事台詞','再靠近一點','再靠近一點。\n妳一直都值得被好好珍惜。',42.5,45.5],
['020','最靠近的祝福','銀虎 · 故事台詞','希望妳每天都能笑著','如果今天有一個願望，\n我希望妳每天都能笑著。',45.5,49.5],
['023(1)','最靠近的祝福','故事旁白','被溫柔接住','妳看著他，也把這份心意放在心裡。\n原來，穿越星光的終點，是被溫柔接住。',49.5,53.5],
['023','生日演唱','銀虎 · 故事台詞','這首歌，只送給妳','生日快樂，YiTing。\n最閃亮的，始終是妳。',53.5,57.5,'走向五人的祝福 →'],
['027','生日演唱','PLAVE · 故事台詞','我們會一直陪著妳','願新的一歲，\n每一個夢都有人陪妳一起相信。',57.5,61],
['026','生日演唱','故事旁白','讓祝福成為一首歌','故事走到了這裡，但星光還在。\n按下「播放生日演唱」，聽完這份只屬於妳的祝福。',38.5,62.228,'留下生日願望 →'],
['025','生日彩蛋','故事旁白','把願望交給星光','YiTing，生日快樂。\n願妳在新的一歲，也能溫柔地喜歡自己。',null,null]
];

const SPREADS=[
{title:'城市裡，一封星光來信',chapter:'01 / CITY',panels:[0,1,2,3],clip:1,kind:'phone',hint:'點亮手機，讀取只屬於妳的訊息。'},
{title:'這一次，由我走向妳',chapter:'02 / EUNHO',panels:[4,5,6,7,8],clip:6,kind:'hand',hint:'點銀虎伸出的手，接住這份邀請。'},
{title:'穿過星光，來到妳身邊',chapter:'03 / ASTERUM',panels:[9,10,11],clip:10,kind:'gate',hint:'收集三枚星光，讓門後的世界亮起。'},
{title:'五道星光，只為妳亮起',chapter:'04 / PLAVE',panels:[12,13],clip:12,kind:'cast',hint:'點五位成員的星光，收下各自的祝福。'},
{title:'被溫柔接住的那一刻',chapter:'05 / WITH YOU',panels:[14,15],clip:14,kind:'reply',hint:'選一句想對銀虎說的話。'},
{title:'今晚的主角，是妳',chapter:'06 / BIRTHDAY',panels:[16,17,18],clip:18,kind:'concert',hint:'點麥克風，播放為妳準備的生日演唱。'},
{title:'把願望交給星光',chapter:'07 / YOUR WISH',panels:[19],clip:null,kind:'wish',hint:'願望只留在妳的裝置，作者不會知道。'}
];
const $=id=>document.getElementById(id),key='yiting-motion-comic-v2';let page=0,clipEnd=0,resumeMusic=false,musicOn=true,musicPending=false,backgroundResume=false,motionOn=!matchMedia('(prefers-reduced-motion: reduce)').matches;
const completed=new Set(),picked=new Map();
try{const save=JSON.parse(localStorage.getItem(key));if(save&&Number.isInteger(save.page)&&save.page>=0&&save.page<SPREADS.length){page=save.page;for(const n of save.completed||[])if(Number.isInteger(n)&&n>=0&&n<SPREADS.length)completed.add(n);} $('wish').value=localStorage.getItem('yiting-comic-wish-v1')||'';}catch{}
function saveProgress(){try{localStorage.setItem(key,JSON.stringify({page,completed:[...completed]}));localStorage.setItem('yiting-last-mode','comic');}catch{}}
function sparks(target){if(!motionOn)return;const r=target.getBoundingClientRect(),area=$('sparkles');for(let i=0;i<12;i++){const star=document.createElement('span');star.textContent='✦';star.style.left=(r.left+r.width/2)+'px';star.style.top=(r.top+r.height/2)+'px';star.style.setProperty('--dx',(Math.random()-.5)*220+'px');star.style.setProperty('--dy',(-40-Math.random()*150)+'px');area.append(star);star.addEventListener('animationend',()=>star.remove(),{once:true});}}
function finish(message,target){completed.add(page);saveProgress();$('actionStatus').textContent=message;$('sheet').classList.add('awakened');const old=$('sheet').querySelector('.story-reveal');if(old)old.remove();const reveal=document.createElement('div');reveal.className='story-reveal';reveal.textContent=page===0?'✉ YiTing，抬起頭，我們在星光裡等妳。':page===1?'♡ 妳的手，已被溫柔接住。':page===2?'ASTERUM · 星光之門已開啟':page===3?'五道星光，完整點亮。':message;$('sheet').append(reveal);if(target)sparks(target);$('badge').textContent='✦ 本頁互動完成';updateJourney();}
function updateJourney(){$('journey').replaceChildren();SPREADS.forEach((s,i)=>{const el=document.createElement('span');el.className=completed.has(i)?'lit':'';el.textContent='✦';el.title=s.title;$('journey').append(el);});}
function actionButton(text,fn){const b=document.createElement('button');b.textContent=text;b.onclick=()=>fn(b);$('actionButtons').append(b);return b;}
function render(){const spread=SPREADS[page];$('sheet').className='sheet layout-'+spread.kind+(completed.has(page)?' awakened':'');$('sheet').replaceChildren();document.body.dataset.page=String(page);document.body.dataset.effect=spread.kind;document.body.classList.toggle('still',!motionOn);$('chapter').textContent=spread.chapter;$('count').textContent=String(page+1).padStart(2,'0')+' / 07';$('title').textContent=spread.title;$('hint').textContent=spread.hint;$('badge').textContent=completed.has(page)?'✦ 本頁互動完成':'探索這一頁';$('actionStatus').textContent=completed.has(page)?'這一頁的星光，已被妳點亮。':'';
spread.panels.forEach((index,n)=>{const p=PAGES[index],panel=document.createElement('figure');panel.className='panel panel-'+n;const art=document.createElement('div');art.className='art';const img=document.createElement('img');img.src='assets/'+p[0]+'.webp';img.alt=p[3];img.loading=n>0?'lazy':'eager';img.onerror=()=>{art.classList.add('image-error');img.alt='圖片未能載入，請重新整理：'+p[3];};art.append(img);const ink=document.createElement('span');ink.className='ink';ink.textContent=page===0&&n===1?'叮！':page===2&&n===0?'✧':page===5&&n===0?'♪':'10:20 PM';art.append(ink);
if((page===0&&index===1)||(page===1&&index===6)||(page===2&&n===0)||(page===5&&n===0)){const hot=document.createElement('button');hot.className='hotspot';hot.textContent=page===0?'✉ 查看訊息':page===1?'♡ 牽住他的手':page===2?'✦ 收集星光':'♪ 播放演唱';hot.onclick=()=>{if(page===0)finish('訊息已讀：YiTing，抬起頭，我們在星光裡等妳。',hot);if(page===1)finish('妳牽住了銀虎的手。星光已接住妳。',hot);if(page===2){const next=[...$('actionButtons').children].find(b=>!b.disabled);if(next)next.click();}if(page===5){finish('舞台已為妳亮起。這首歌，只送給妳。',hot);playClip(18);}};art.append(hot);}
const cap=document.createElement('figcaption'),speaker=document.createElement('span'),words=document.createElement('p');speaker.textContent=p[2];words.textContent=p[4];cap.className=p[2].includes('旁白')?'narration':'bubble';cap.append(speaker,words);panel.append(art,cap);$('sheet').append(panel);});
$('actionButtons').replaceChildren();if(spread.kind==='phone')actionButton('✉ 查看手機訊息',b=>finish('訊息已讀：YiTing，抬起頭，我們在星光裡等妳。',b));
if(spread.kind==='hand')actionButton('♡ 牽住銀虎的手',b=>finish('妳牽住了銀虎的手。星光已接住妳。',b));
if(spread.kind==='gate'||spread.kind==='cast'){const names=spread.kind==='gate'?['第一枚星光','第二枚星光','第三枚星光']:['藝俊 · 希望','諾亞 · 溫柔','斑比 · 快樂','銀虎 · 陪伴','河玟 · 勇氣'];const messages=['讓每一首歌，陪妳走向更好的明天。','願妳的夢，永遠有光照著。','把快樂留給自己，也把勇氣留給夢想。','希望每一天，妳都能笑得像今晚一樣。','累的時候也沒關係，我們一直都在。'];if(!picked.has(page))picked.set(page,new Set());names.forEach((name,i)=>{const b=actionButton('✦ '+name,b=>{picked.get(page).add(i);$('sheet').style.setProperty('--charge',String(picked.get(page).size/names.length));b.disabled=true;b.classList.add('collected');sparks(b);$('actionStatus').textContent=spread.kind==='cast'?name+'｜'+messages[i]:'已收集 '+picked.get(page).size+' / '+names.length+' 枚星光';if(picked.get(page).size===names.length)finish(spread.kind==='gate'?'星光之門已開啟。銀虎陪妳走入 ASTERUM。':'五道祝福已集齊。妳是今晚最閃亮的星。',b);});b.style.setProperty('--star-color',['#58a7ea','#af83dc','#ec84b6','#e27281','#76b699'][i]);b.disabled=completed.has(page)||picked.get(page).has(i);b.classList.toggle('collected',b.disabled);});}
if(spread.kind==='reply')for(const text of ['謝謝你，一直陪著我。','我會記得，好好照顧自己。','今晚的星光，我會珍惜。'])actionButton(text,b=>{for(const other of $('actionButtons').children)other.classList.remove('selected');b.classList.add('selected');finish('妳的心意留在這一刻。銀虎的祝福，陪妳走向新的一歲。',b);});
if(spread.kind==='concert')actionButton('♪ 點亮舞台，播放生日演唱',b=>{finish('舞台已亮起。這首歌，只送給妳。',b);playClip(18);});
$('extra').hidden=spread.kind!=='wish';$('prev').disabled=page===0;$('next').disabled=page===SPREADS.length-1;$('next').textContent=page===SPREADS.length-1?'故事已完成':'下一頁 →';$('clip').hidden=spread.clip===null;$('clip').textContent=spread.kind==='concert'?'播放生日演唱':'觀看這段電影';$('progress').max=7;$('progress').value=page+1;$('motion').textContent=motionOn?'暫停畫面動畫':'開啟畫面動畫';$('motion').setAttribute('aria-pressed',String(motionOn));saveProgress();updateJourney();
}
function turn(delta){if($('movie').open)return;const n=Math.max(0,Math.min(SPREADS.length-1,page+delta));if(n===page)return;page=n;render();window.scrollTo({top:0,behavior:'instant'});}
$('next').onclick=()=>turn(1);$('prev').onclick=()=>turn(-1);$('restart').onclick=()=>{page=0;completed.clear();picked.clear();render();window.scrollTo({top:0,behavior:'instant'});};$('motion').onclick=()=>{motionOn=!motionOn;document.body.classList.toggle('still',!motionOn);$('motion').textContent=motionOn?'暫停畫面動畫':'開啟畫面動畫';$('motion').setAttribute('aria-pressed',String(motionOn));};
function musicLabel(){$('music').textContent=musicOn?(musicPending?'音樂已開 · 輕觸播放':'暫停音樂'):'開啟音樂';$('music').setAttribute('aria-pressed',String(musicOn));}
async function startMusic(){if(!musicOn||$('movie').open||document.hidden)return;try{$('bgm').muted=false;await $('bgm').play();musicPending=false;}catch{musicPending=true;}musicLabel();}
$('music').onclick=()=>{if(musicOn&&musicPending){startMusic();return;}musicOn=!musicOn;musicPending=false;$('video').muted=!musicOn;if(musicOn)startMusic();else $('bgm').pause();musicLabel();};
document.addEventListener('click',e=>{if(musicOn&&$('bgm').paused&&!$('movie').open&&!e.target.closest('#music,#clip,a'))startMusic();},{capture:true});
async function playClip(index){const p=PAGES[index];if(p[5]===null)return;resumeMusic=musicOn;$('bgm').pause();$('video').muted=!musicOn;clipEnd=p[6];$('movieTitle').textContent=index===18?'YiTing，生日快樂。':p[3];$('caption').textContent='';$('movie').showModal();$('video').currentTime=p[5];try{await $('video').play();}catch{$('caption').textContent='輕觸影片上的播放鍵開始。';}}
$('clip').onclick=()=>playClip(SPREADS[page].clip);
function closeMovie(){$('video').pause();$('movie').close();if(resumeMusic){resumeMusic=false;startMusic();}}
$('closeMovie').onclick=closeMovie;$('movie').addEventListener('cancel',e=>{e.preventDefault();closeMovie();});$('video').addEventListener('timeupdate',()=>{const t=$('video').currentTime,sub=window.STORY.subtitles.find(s=>t>=s.start&&t<s.end);$('caption').textContent=sub?sub.speaker+'｜'+sub.text:'';if(t>=clipEnd){$('video').pause();$('caption').textContent='這段電影已播完，回到漫畫繼續故事。';}});
$('saveWish').onclick=()=>{if(!$('wish').value.trim()){$('wishStatus').textContent='先留下一個只屬於妳的願望吧。';return;}try{localStorage.setItem('yiting-comic-wish-v1',$('wish').value);$('extra').classList.add('sealed');$('wishStatus').textContent='星光已收下願望。作者不會知道內容，願望只留在這台裝置。';finish('最後一枚星光，留給妳的願望。',$('saveWish'));}catch{$('wishStatus').textContent='星光已聽見妳的願望。此瀏覽器無法保存，但內容沒有上傳或寄送。';}};

document.addEventListener('keydown',e=>{if(e.target.matches('textarea,input,button')||$('movie').open)return;if(e.key==='ArrowRight'){e.preventDefault();startMusic();turn(1);}if(e.key==='ArrowLeft'){e.preventDefault();startMusic();turn(-1);}});document.addEventListener('visibilitychange',()=>{document.body.classList.toggle('background-paused',document.hidden);if(document.hidden){backgroundResume=musicOn&&!$('bgm').paused;$('video').pause();$('bgm').pause();}else if(backgroundResume){backgroundResume=false;startMusic();}});render();startMusic();
