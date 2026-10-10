const $=id=>document.getElementById(id),song=$('song');
function setStatus(message){$('wishStatus').textContent=message;}
try{$('wish').value=localStorage.getItem('yiting-birthday-wish')||'';}catch{}
$('saveWish').onclick=()=>{
 if(!$('wish').value.trim()){setStatus('先寫下一個小小的願望吧。');$('wish').focus();return;}
 try{localStorage.setItem('yiting-birthday-wish',$('wish').value);$('birthday').classList.add('wish-sealed');setStatus('願望已留在妳的瀏覽器裡，作者不會知道內容。願妳被愛，也勇敢做自己。');}
 catch{setStatus('作者不會收到妳的願望。此瀏覽器無法儲存，請先複製留念。');}
};
$('bookSize').onclick=()=>{const enlarged=document.querySelector('.novel').classList.toggle('large-print');$('bookSize').textContent=enlarged?'標準字體':'放大字體';};
const tracks=[{src:'assets/song.m4a',name:'너라는_별빛'},{src:'assets/moon-night.m4a',name:'10월의 밤｜十月的夜晚'}];
let selectedTrack=0,userPaused=false;
const musicButtons=[$('listen'),$('novelListen')];
function musicStatus(text){document.querySelectorAll('.music-status').forEach(el=>el.textContent=text);}
function syncMusic(){musicButtons.forEach(button=>{button.textContent=song.paused?'播放歌曲':'暫停歌曲';button.setAttribute('aria-pressed',String(!song.paused));});document.querySelectorAll('.gift-track-choice').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.track)===selectedTrack)));}
function playMusic(){song.muted=false;return song.play().then(()=>{musicStatus('正在播放：'+tracks[selectedTrack].name);}).catch(()=>musicStatus('輕觸「播放歌曲」，讓音樂陪妳。'));}
song.onplay=syncMusic;song.onpause=syncMusic;
song.onended=()=>{selectedTrack=(selectedTrack+1)%tracks.length;song.src=tracks[selectedTrack].src;syncMusic();playMusic();};
musicButtons.forEach(button=>button.onclick=()=>{if(song.paused){userPaused=false;playMusic();}else{userPaused=true;song.pause();musicStatus('音樂已暫停');}});
document.querySelectorAll('.gift-track-choice').forEach(button=>button.onclick=()=>{selectedTrack=Number(button.dataset.track);song.pause();song.src=tracks[selectedTrack].src;userPaused=false;$('lyrics').textContent='';syncMusic();playMusic();});
song.ontimeupdate=()=>{const cue=selectedTrack===0?((window.STORY&&window.STORY.lyrics)||[]).find(s=>song.currentTime>=s.start&&song.currentTime<s.end):null;$('lyrics').textContent=cue?cue.text:'';};
song.onerror=()=>musicStatus('歌曲暫時無法載入，請重新整理或切換曲目。');
syncMusic();
document.addEventListener('visibilitychange',()=>{if(document.hidden)song.pause();});
const cards=[['銀虎','022','希望每一天，妳都能笑得像今晚一樣。'],['藝俊','card-0000(1)','讓每一首歌，陪妳走向更好的明天。'],['諾亞','card-0000(5)','願妳的夢，永遠有光照著。'],['斑比','card-0000(3)','把快樂留給自己，也把勇氣留給夢想。'],['河玟','card-0000(4)','累的時候也沒關係，我們一直都在。'],['PLAVE','card-0000(2)','五道星光，一起祝妳生日快樂。']];
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
const cardDimensions={"022": [1672, 941], "card-0000(1)": [1672, 941], "card-0000(5)": [1672, 941], "card-0000(3)": [1672, 941], "card-0000(4)": [1672, 941], "card-0000(2)": [1672, 941], "novel-welcome": [1672, 941], "novel-red-star": [1672, 941], "novel-birthday-stage": [1672, 941], "novel-wish": [1672, 941], "novel-farewell": [1672, 941], "novel-home": [1672, 941], "novel-message-v2": [1672, 941], "novel-garden": [1672, 941], "novel-portal": [1672, 941], "novel-greenhouse": [1672, 941], "novel-bamby": [1672, 941], "novel-hamin": [1672, 941], "novel-five-stars": [1672, 941], "novel-cake": [1672, 941], "novel-control-room": [1536, 1024], "novel-final-message": [1672, 941], "novel-crossing": [1672, 941], "novel-stage-lights": [1672, 941], "novel-asterum-view": [1672, 941], "novel-welcome-teasing": [1672, 941], "novel-portal-goodbye": [1672, 941], "novel-walk-forward": [1672, 941], "novel-birthday-cheer": [1672, 941], "novel-group-farewell": [1672, 941]};
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
