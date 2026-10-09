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
const $=id=>document.getElementById(id),key='yiting-comic-page-v1';let page=0,token=0,clipEnd=0,resumeMusic=false;
try{const stored=Number(localStorage.getItem(key));if(Number.isInteger(stored)&&stored>=0&&stored<PAGES.length)page=stored;$('wish').value=localStorage.getItem('yiting-comic-wish-v1')||'';}catch{}
function render(){const p=PAGES[page],current=++token,img=new Image();$('loading').hidden=false;$('loading').textContent='正在翻開下一頁…';img.onload=()=>{if(current!==token)return;$('panel').src=img.src;$('panel').alt=p[3]+'｜'+p[4].replaceAll('\n',' ');$('loading').hidden=true;};img.onerror=()=>{if(current===token)$('loading').textContent='圖片未能載入，請重新整理。';};img.src='assets/'+p[0]+'.webp';
$('chapter').textContent=p[1];$('count').textContent=String(page+1).padStart(2,'0')+' / '+PAGES.length;$('speaker').textContent=p[2];$('title').textContent=p[3];$('words').textContent=p[4];$('prev').disabled=page===0;$('next').disabled=page===PAGES.length-1;$('next').textContent=page===PAGES.length-1?'故事已完成':p[7]||'下一步 →';$('extra').hidden=page!==PAGES.length-1;$('clip').hidden=p[5]===null;$('clip').textContent=page===18?'播放生日演唱':'觀看這段電影';$('progress').max=PAGES.length;$('progress').value=page+1;document.body.dataset.page=String(page);try{localStorage.setItem(key,String(page));}catch{}
for(const n of [page-1,page+1])if(PAGES[n]){const pre=new Image();pre.src='assets/'+PAGES[n][0]+'.webp';}}
function turn(delta){if($('movie').open)return;const next=Math.max(0,Math.min(PAGES.length-1,page+delta));if(next===page)return;page=next;render();window.scrollTo({top:0,behavior:'instant'});}
$('next').onclick=()=>turn(1);$('prev').onclick=()=>turn(-1);$('restart').onclick=()=>{page=0;render();window.scrollTo({top:0,behavior:'instant'});};
$('music').onclick=async()=>{if(!$('bgm').paused){$('bgm').pause();$('music').textContent='開啟音樂';$('music').setAttribute('aria-pressed','false');}else{try{await $('bgm').play();$('music').textContent='暫停音樂';$('music').setAttribute('aria-pressed','true');}catch{$('music').textContent='輕觸再試音樂';}}};
$('clip').onclick=async()=>{const p=PAGES[page];if(p[5]===null)return;resumeMusic=!$('bgm').paused;$('bgm').pause();$('music').textContent='開啟音樂';$('music').setAttribute('aria-pressed','false');clipEnd=p[6];$('movieTitle').textContent=page===18?'YiTing，生日快樂。':p[3];$('caption').textContent='';$('movie').showModal();$('video').currentTime=p[5];try{await $('video').play();}catch{$('caption').textContent='輕觸影片上的播放鍵開始。';}};
function closeMovie(){$('video').pause();$('movie').close();if(resumeMusic){resumeMusic=false;$('music').click();}}
$('closeMovie').onclick=closeMovie;$('movie').addEventListener('cancel',e=>{e.preventDefault();closeMovie();});$('video').addEventListener('timeupdate',()=>{const t=$('video').currentTime,sub=window.STORY.subtitles.find(s=>t>=s.start&&t<s.end);$('caption').textContent=sub?sub.speaker+'｜'+sub.text:'';if(t>=clipEnd){$('video').pause();$('caption').textContent='這段電影已播完，回到漫畫繼續故事。';}});
$('saveWish').onclick=()=>{if(!$('wish').value.trim()){$('wishStatus').textContent='先留下一個只屬於妳的願望吧。';return;}try{localStorage.setItem('yiting-comic-wish-v1',$('wish').value);$('wishStatus').textContent='星光已收下願望。作者不會知道內容，願望只留在這台裝置。';}catch{$('wishStatus').textContent='星光已聽見妳的願望。此瀏覽器無法保存，但內容沒有上傳或寄送。';}};
document.addEventListener('keydown',e=>{if(e.target.matches('textarea,input')||$('movie').open)return;if(e.key==='ArrowRight'){e.preventDefault();turn(1);}if(e.key==='ArrowLeft'){e.preventDefault();turn(-1);}});document.addEventListener('visibilitychange',()=>{if(document.hidden){$('video').pause();$('bgm').pause();resumeMusic=false;$('music').textContent='開啟音樂';$('music').setAttribute('aria-pressed','false');}});render();
