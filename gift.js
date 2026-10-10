const $=id=>document.getElementById(id),song=$('song');
function setStatus(message){$('wishStatus').textContent=message;}
try{$('wish').value=localStorage.getItem('yiting-birthday-wish')||'';}catch{}
$('saveWish').onclick=()=>{
 if(!$('wish').value.trim()){setStatus('先寫下一個小小的願望吧。');$('wish').focus();return;}
 try{localStorage.setItem('yiting-birthday-wish',$('wish').value);$('birthday').classList.add('wish-sealed');setStatus('願望已留在妳的瀏覽器裡，作者不會知道內容。願妳被愛，也勇敢做自己。');}
 catch{setStatus('作者不會收到妳的願望。此瀏覽器無法儲存，請先複製留念。');}
};
$('bookSize').onclick=()=>{const enlarged=document.querySelector('.novel').classList.toggle('large-print');$('bookSize').textContent=enlarged?'標準字體':'放大字體';};
const tracks=[{src:'assets/ten-twenty-star.m4a',name:'열 시 이십 분의 별｜十點二十分的星'},{src:'assets/song.m4a',name:'너라는_별빛'},{src:'assets/moon-night.m4a',name:'10월의 밤｜十月的夜晚'}];
let selectedTrack=0,userPaused=false;
const musicButtons=[$('listen'),$('novelListen')];
function musicStatus(text){document.querySelectorAll('.music-status').forEach(el=>el.textContent=text);}
function syncMusic(){const chosen=tracks[selectedTrack],title=chosen.name.split('｜')[0],videos=['assets/ten-twenty-star.mp4',null,'assets/moon-night.mp4'];document.querySelectorAll('.selected-song-download').forEach(a=>{a.href=chosen.src;a.download=title+'.m4a';a.textContent='下載 '+title+' ↓';});document.querySelectorAll('.selected-video-download').forEach(a=>{a.hidden=!videos[selectedTrack];if(videos[selectedTrack]){a.href=videos[selectedTrack];a.download=title+'.mp4';a.textContent='下載 '+title+' 影片 ↓';}});musicButtons.forEach(button=>{button.textContent=song.paused?'播放歌曲':'暫停歌曲';button.setAttribute('aria-pressed',String(!song.paused));});document.querySelectorAll('.gift-track-choice').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.track)===selectedTrack)));}
function playMusic(){song.muted=false;return song.play().then(()=>{musicStatus('正在播放：'+tracks[selectedTrack].name);}).catch(()=>musicStatus('輕觸「播放歌曲」，讓音樂陪妳。'));}
song.onplay=syncMusic;song.onpause=syncMusic;
song.onended=()=>{selectedTrack=(selectedTrack+1)%tracks.length;song.src=tracks[selectedTrack].src;syncMusic();playMusic();};
musicButtons.forEach(button=>button.onclick=()=>{if(song.paused){userPaused=false;playMusic();}else{userPaused=true;song.pause();musicStatus('音樂已暫停');}});
document.querySelectorAll('.gift-track-choice').forEach(button=>button.onclick=()=>{selectedTrack=Number(button.dataset.track);song.pause();song.src=tracks[selectedTrack].src;userPaused=false;$('lyrics').textContent='';syncMusic();playMusic();});
song.ontimeupdate=()=>{const cue=selectedTrack===1?((window.STORY&&window.STORY.lyrics)||[]).find(s=>song.currentTime>=s.start&&song.currentTime<s.end):null;$('lyrics').textContent=cue?cue.text:'';};
song.onerror=()=>musicStatus('歌曲暫時無法載入，請重新整理或切換曲目。');
syncMusic();
document.addEventListener('visibilitychange',()=>{if(document.hidden)song.pause();});
const cards=[['銀虎','022','希望每一天，妳都能笑得像今晚一樣。'],['藝俊','card-0000(1)','讓每一首歌，陪妳走向更好的明天。'],['諾亞','card-0000(5)','願妳的夢，永遠有光照著。'],['斑比','card-bamby-hands-v2','把快樂留給自己，也把勇氣留給夢想。'],['河玟','card-0000(4)','累的時候也沒關係，我們一直都在。'],['PLAVE','card-0000(2)','五道星光，一起祝妳生日快樂。']];
cards.push(
 ['初次相遇','novel-welcome','不管妳從哪裡來，星光都會為妳留一個位置。歡迎妳，來到我們的世界。'],
 ['紅色星光','novel-red-star','願妳記得，妳也是很重要的人。把這顆紅色星光收好，疲憊時讓它陪著妳。'],
 ['專屬舞台','novel-birthday-stage','今晚的每一道光、每一段旋律，都為妳亮起。願往後的日子，也有值得期待的驚喜。'],
 ['生日願望','novel-wish','不用說出心裡的秘密。希望妳珍惜的人平安，也希望妳勇敢追尋喜歡的事。'],
 ['星光約定','novel-farewell','即使在不同的世界，那些陪伴過妳的時光也不會消失。明年，也要帶著笑容。'],
 ['帶著星光前行','novel-home','願妳回到日常之後，依然記得自己值得被好好慶祝。每一年，都有屬於妳的星光。']
);
cards.push(
 ['星光來訊','novel-message-v2','願每一次熟悉的旋律，都能在妳疲憊時帶來力量。星光彼端，也有人惦記著妳。'],
 ['希望花園','novel-garden','希望妳不管走到哪裡，都能記得自己最初喜歡的事情。讓熱愛陪妳，走向新的每一天。']
);
cards.push(
 ['十點二十分的奇蹟','novel-portal','準備好了嗎？這次，換我們來接妳。願妳的人生，也有意想不到的美好相遇。'],
 ['月光裡的溫柔','novel-greenhouse','有時候，妳也可以不用那麼努力。累的時候，讓溫柔陪妳休息一下。願妳被好好珍惜。']
);
cards.push(
 ['粉紅色的快樂','novel-bamby','以後也要多笑一點！願妳把快樂留給自己，讓喜歡的事物，陪妳度過每一個普通的日子。'],
 ['星海裡的勇氣','novel-hamin','就算現在還看不見終點，也沒關係。只要繼續往前走就好了。願妳相信，自己一直在發光。']
);
cards.push(
 ['五道星光的心意','novel-five-stars','希望、溫柔、快樂、勇氣，還有陪伴，都送給妳。願妳把這五道星光，帶進新的一歲。'],
 ['驚喜送到妳面前','novel-cake','今天，是值得好好慶祝妳的一天。願妳的生活，有甜甜的驚喜，也有一直陪著妳的人。']
);
cards.push(
 ['星光彼端的訊號','novel-control-room','無論距離多遠，喜歡的旋律都會找到妳。願每一段等待，都有溫柔的回應。'],
 ['只為妳的生日留言','novel-final-message','謝謝妳來到這個世界，也謝謝妳喜歡我們。願每年的十月二十日，妳都帶著笑容迎接新的一歲。']
);
cards.push(
 ['跨越星光的邀請','novel-crossing','願妳勇敢伸出手，迎接新的風景。那些不敢想像的美好，也值得向妳走來。'],
 ['為妳亮起的星空','novel-stage-lights','五道星光，都為妳亮起。願妳每次抬頭，都能看見希望；每個生日，都有值得期待的驚喜。']
);
cards.push(
 ['初見星海的奇蹟','novel-asterum-view','願妳永遠保有看見新風景的好奇。世界很大，屬於妳的美好，也正在慢慢展開。'],
 ['藏不住的等待','novel-welcome-teasing','有人一直在等妳，有人因妳而笑。願妳每次到來，都被溫柔迎接、被認真放在心上。']
);
cards.push(
 ['星光中的再見','novel-portal-goodbye','每一次告別，都是下一次相遇的開始。願星光守護妳，讓妳帶著溫柔與勇氣，走向下一段旅程。'],
 ['帶著星光走向明天','novel-walk-forward','願妳的平凡日常，也有值得期待的小小美好。請記得，妳值得被愛，也值得被好好慶祝。']
);
cards.push(
 ['把快樂留在星海','novel-birthday-cheer','願妳每一年的生日，都有真心的笑容與溫暖的陪伴。也願那些讓妳開心的小事，天天都在妳身邊。'],
 ['五份溫柔的叮嚀','novel-group-farewell','記得好好照顧自己，也記得常常笑。願妳往後的每段旅程，都有希望、溫柔、快樂、勇氣與陪伴。']
);
cards.push(
 ['星海之上的世界','novel-asterum-panorama','願妳的世界，永遠有新的風景與值得期待的明天。心裡的星光，會陪妳走向想去的地方。'],
 ['第一次真正相遇','novel-arrival-medium','願每一次勇敢伸出的手，都遇見溫柔的回應。願那些美好的相遇，讓妳相信自己值得被珍惜。'],
 ['留在掌心的陪伴','novel-star-closeup','把這顆小小的紅色星星，留在心裡。無論走得多遠，願妳始終記得，那些溫柔的陪伴不會消失。']
);
cards.push(
 ['星光正在接通','novel-signal-closeup','願妳等待的好消息，在平凡的一天悄悄抵達。那些跨越距離的心意，會找到妳。'],
 ['熟悉的微笑','novel-eunho-closeup','願妳每次想起喜歡的人與事，都能露出這樣溫柔的笑容。願妳的心意，也一直被好好珍惜。'],
 ['被星光照亮的妳','novel-audience-closeup','願妳留下的眼淚，更多是因為幸福與感動。今天的妳，是這片星海最值得被祝福的主角。']
);
cards.push(
 ['琴弦裡的希望','novel-yejun-guitar','願妳一直記得最初喜歡的事情。即使步伐慢一點，心裡的旋律，也會陪妳走向想去的地方。'],
 ['月光裡的叮嚀','novel-noah-closeup','累的時候，允許自己好好休息。願妳被生活溫柔以待，也願妳總能把溫柔留一點給自己。'],
 ['腳步染上粉紅色','novel-bamby-dance','願妳的日常，多一些笑得停不下來的時刻。跟著喜歡的節奏，勇敢享受屬於妳的快樂。'],
 ['把勇氣交給妳','novel-hamin-closeup','就算暫時看不見終點，也別忘記妳仍然在發光。願這份勇氣，陪妳走過每一段未知的路。']
);
cards.push(["並肩走過星海", "novel-quiet-bridge", "願妳忙碌的日子，也有安靜喘口氣的地方。有人陪著的時候，不必急著走；一個人的時候，也別忘記溫柔照顧自己。"],["這顆星光代表陪伴", "novel-eunho-reassurance", "願妳記得，自己也是很重要的人。讓這份陪伴成為妳的力量，帶著喜歡的歌聲與勇氣，走向值得期待的明天。"]);
cards.push(["最初喜歡的那束光", "novel-yejun-closeup", "願妳一直保有最初喜歡的事情。即使生活偶爾讓妳忘記方向，心裡那束藍色的希望，也會陪妳慢慢找回自己。"],["笑容裡開出小花", "novel-bamby-closeup", "願妳的每一天，都有值得笑出來的小事。累了就停一下，難過也不必逞強；願快樂像小花，慢慢回到妳身旁。"]);
cards.push(["整片星海只為妳亮起", "novel-concert-wide", "願妳不只在生日這天，也在每個平凡日子裡被珍惜。當妳抬頭望向夜空，願那些喜歡的歌聲與星光，陪妳找到力量。"],["把生日驚喜推向妳", "novel-cake-arrival", "願妳的新一歲，有突然到來的好消息，也有一起笑出聲的朋友。慢慢走、好好吃飯，把每一個值得慶祝的小日子收進心裡。"],["把願望交給燭光", "novel-candle-closeup", "願妳藏在心裡的願望，被生活溫柔照顧。希望、溫柔、快樂、勇氣與陪伴，願這五份心意，照亮妳接下來的一年。"]);
cards.push(["回程之前的星海", "novel-return-wide", "願每一次暫時的告別，都留下值得珍惜的回憶。往前走的時候，也請記得：那些陪伴過妳的心意，會繼續發光。"],["把陪伴留在心裡", "novel-farewell-medium", "願妳在不同的世界與日常裡，都能找到讓自己微笑的事。距離再遠，喜歡的歌聲，也會陪妳度過每一個需要力量的夜晚。"],["掌心裡真實的溫暖", "novel-keepsake-closeup", "願妳握住的不只是生日回憶，還有相信自己值得被珍惜的心情。把這點溫暖留給自己，帶著希望走向新的一歲。"]);
cards.push(["為妳停留的一分鐘", "novel-frozen-city", "願忙碌的生活，也有為自己停留的一分鐘。抬起頭、深呼吸，妳的感受與心願，都值得被好好放在心上。"],["星光彼端的邀請", "novel-invitation-medium", "願妳期待的相遇，在剛剛好的時刻抵達。當新的旅程向妳招手，願妳帶著好奇與勇氣，遇見更多溫柔的可能。"],["指尖碰見奇蹟", "novel-light-touch", "願妳伸出的每一份心意，都得到溫柔的回應。小小的一步也算前進；新的歲月，願妳敢於靠近自己喜歡的光。"]);
cards.push(["月光照亮的溫室", "novel-greenhouse-wide", "願妳總能找到一個安靜休息的角落。再忙碌，也把時間留一點給自己；月光與溫柔，會陪妳慢慢鬆開緊繃的心。"],["允許自己慢一點", "novel-noah-pause", "願妳不用時時刻刻努力證明自己。偶爾停下、看看喜歡的花，也是一種前進。新的一歲，請對自己更溫柔一點。"],["捧在掌心的溫柔", "novel-purple-star-detail", "願這束紫色星光，提醒妳值得被溫柔以待。把給別人的體貼留一點給自己，願妳每天，都有能安心微笑的時刻。"]);
cards.push(["星海盡頭的觀景台", "novel-observatory-wide", "願妳在遼闊的世界裡，永遠保有自己的方向。新的一歲，帶著勇氣慢慢探索，妳的光芒會照亮每一次出發。"],["看見微小的光", "novel-hamin-stargazing", "願妳記得，微小的進步也值得慶祝。不必急著成為最亮的星，帶著勇氣照自己的步調前進，妳已經很耀眼。"],["掌心裡的勇氣", "novel-green-star-detail", "願這顆綠色星光，把勇氣留在妳心裡。即使偶爾害怕，也能走向喜歡的未來；願每次抬頭，都看見屬於自己的光。"]);
cards.push(["星河下的同行", "novel-starlit-walk-wide", "願妳走過的每段路，都有喜歡的歌聲陪伴。新的一歲，即使腳步慢一些，也能安心走向自己的星光。"],["把力量送給妳", "novel-eunho-conversation", "願妳在疲憊時，總能聽見讓心安定的旋律。妳帶給世界的笑容，也值得被珍惜；願溫暖的陪伴一直在妳身旁。"],["紅光裡的陪伴", "novel-red-light-detail", "願這束紅色星光，陪妳度過平凡與特別的日子。記得照顧自己，也記得妳是值得被好好慶祝的人。生日快樂，YiTing。"]);
cards.push(["走進快樂的廣場", "novel-bamby-plaza-wide", "願妳的新一年，有許多值得期待的小事。把喜歡的風景與笑聲收藏起來，每一次出發，都能遇見自己的快樂。"],["跟著笑聲的節奏", "novel-bamby-rhythm", "願妳不必擔心每一步都完美。跟著喜歡的節奏，放心笑、勇敢試，生活也會回應妳的快樂。"],["腳步點亮的星星", "novel-bamby-pink-detail-v2", "願這顆粉色星光，讓日常多一點快樂。即使只是小小的一步，也能走向明亮的明天。生日快樂，YiTing。"]);
const cardDimensions={"022": [1672, 941], "card-0000(1)": [1672, 941], "card-0000(5)": [1672, 941], "card-0000(3)": [1672, 941], "card-0000(4)": [1672, 941], "card-0000(2)": [1672, 941], "novel-welcome": [1672, 941], "novel-red-star": [1672, 941], "novel-birthday-stage": [1672, 941], "novel-wish": [1672, 941], "novel-farewell": [1672, 941], "novel-home": [1672, 941], "novel-message-v2": [1672, 941], "novel-garden": [1672, 941], "novel-portal": [1672, 941], "novel-greenhouse": [1672, 941], "novel-bamby": [1672, 941], "novel-hamin": [1672, 941], "novel-five-stars": [1672, 941], "novel-cake": [1672, 941], "novel-control-room": [1536, 1024], "novel-final-message": [1672, 941], "novel-crossing": [1672, 941], "novel-stage-lights": [1672, 941], "novel-asterum-view": [1672, 941], "novel-welcome-teasing": [1672, 941], "novel-portal-goodbye": [1672, 941], "novel-walk-forward": [1672, 941], "novel-birthday-cheer": [1672, 941], "novel-group-farewell": [1672, 941], "novel-asterum-panorama": [1672, 941], "novel-arrival-medium": [1672, 941], "novel-star-closeup": [1672, 941], "novel-signal-closeup": [1672, 941], "novel-eunho-closeup": [1672, 941], "novel-audience-closeup": [1672, 941], "novel-yejun-guitar": [1672, 941], "novel-noah-closeup": [1672, 941], "novel-bamby-dance": [1672, 941], "novel-hamin-closeup": [1672, 941], "novel-quiet-bridge": [1672, 941], "novel-eunho-reassurance": [1672, 941], "novel-yejun-closeup": [1672, 941], "novel-bamby-closeup": [1672, 941], "novel-concert-wide": [1672, 941], "novel-cake-arrival": [1672, 941], "novel-candle-closeup": [1672, 941], "novel-return-wide": [1672, 941], "novel-farewell-medium": [1672, 941], "novel-keepsake-closeup": [1672, 941], "novel-frozen-city": [1672, 941], "novel-invitation-medium": [1672, 941], "novel-light-touch": [1672, 941], "novel-greenhouse-wide": [1672, 941], "novel-noah-pause": [1672, 941], "novel-purple-star-detail": [1672, 941], "novel-observatory-wide": [1931, 814], "novel-hamin-stargazing": [1672, 941], "novel-green-star-detail": [1672, 941], "novel-starlit-walk-wide": [1671, 941], "novel-eunho-conversation": [1672, 941], "novel-red-light-detail": [1672, 941], "card-bamby-hands-v2": [1672, 941], "novel-bamby-plaza-wide": [1671, 941], "novel-bamby-rhythm": [1672, 941], "novel-bamby-pink-detail-v2": [1672, 941]};
cards.forEach(([name,img,text])=>{
 const item=document.createElement('div');item.className='card-item';
 const card=document.createElement('button');card.className='photocard'+(img.startsWith('novel-')?' story-photocard':'');card.style.aspectRatio=cardDimensions[img].join(' / ');card.setAttribute('aria-label',name+'小卡，翻面看祝福');card.setAttribute('aria-pressed','false');
 const front=document.createElement('span');front.className='card-front';const photo=document.createElement('img');photo.src='assets/'+img+'.webp';photo.alt=name+'生日小卡';photo.loading='lazy';const label=document.createElement('strong');label.textContent=name;front.append(photo);label.className='card-caption';
 const back=document.createElement('span');back.className='card-back';const star=document.createElement('span');star.textContent='✦';const words=document.createElement('span');words.textContent=text;back.append(star,words);card.append(front,back);
 card.onclick=()=>{card.setAttribute('aria-pressed',String(card.classList.toggle('flipped')));$('giftText').textContent=name+'｜'+text;};
 item.append(card,label,window.assetDownloads('assets/downloads/'+img+'.jpg',name+'-生日小卡.jpg','保存小卡'));$('cards').append(item);
});
const giftTabs=Array.from(document.querySelectorAll('.collection-tabs [role="tab"]'));
function selectGiftSection(tab,updateHash=true){
 giftTabs.forEach(item=>{const active=item===tab;item.setAttribute('aria-selected',String(active));item.tabIndex=active?0:-1;document.getElementById(item.getAttribute('aria-controls')).hidden=!active;});
 if(tab.id==='tab-novel'&&!userPaused&&song.paused)playMusic();
 if(updateHash)try{history.replaceState(null,'','#'+tab.id.slice(4));}catch{}
}
giftTabs.forEach((tab,index)=>{
 tab.onclick=()=>selectGiftSection(tab);
 tab.onkeydown=e=>{let next=index;if(e.key==='ArrowRight')next=(index+1)%giftTabs.length;else if(e.key==='ArrowLeft')next=(index+giftTabs.length-1)%giftTabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=giftTabs.length-1;else return;e.preventDefault();selectGiftSection(giftTabs[next]);giftTabs[next].focus();};
});
if(giftTabs.length){const requested=giftTabs.find(tab=>tab.id==='tab-'+location.hash.slice(1));selectGiftSection(requested||giftTabs[0],false);}
const viewer=$('cardViewer');
if(viewer){
 document.querySelectorAll('.card-item').forEach((item,index)=>{
  const [name,img,text]=cards[index],detail=document.createElement('button');detail.className='card-detail';detail.textContent='放大查看 ↗';detail.setAttribute('aria-label','放大查看'+name+'小卡');
  detail.onclick=()=>{if(typeof viewer.showModal!=='function'){window.open('assets/downloads/'+img+'.jpg','_blank','noopener');return;}$('cardViewerTitle').textContent=name+' / BIRTHDAY CARD';$('cardViewerImage').src='assets/'+img+'.webp';$('cardViewerImage').alt=name+'生日小卡';$('cardViewerWords').textContent=text;$('cardViewerSave').replaceChildren(window.assetDownloads('assets/downloads/'+img+'.jpg',name+'-生日小卡.jpg','保存小卡'));viewer.showModal();};item.append(detail);
 });
 $('closeCardViewer').onclick=()=>viewer.close();
}
