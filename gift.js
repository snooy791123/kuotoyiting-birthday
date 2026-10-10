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
 ['星光來訊','novel-message','願每一次熟悉的旋律，都能在妳疲憊時帶來力量。星光彼端，也有人惦記著妳。'],
 ['希望花園','novel-garden','希望妳不管走到哪裡，都能記得自己最初喜歡的事情。讓熱愛陪妳，走向新的每一天。']
);
cards.forEach(([name,img,text])=>{
 const item=document.createElement('div');item.className='card-item';
 const card=document.createElement('button');card.className='photocard'+(img.startsWith('novel-')?' story-photocard':'');card.setAttribute('aria-label',name+'小卡，翻面看祝福');card.setAttribute('aria-pressed','false');
 const front=document.createElement('span');front.className='card-front';const photo=document.createElement('img');photo.src='assets/'+img+'.webp';photo.alt=name+'生日小卡';photo.loading='lazy';const label=document.createElement('strong');label.textContent=name;front.append(photo,label);
 const back=document.createElement('span');back.className='card-back';const star=document.createElement('span');star.textContent='✦';const words=document.createElement('span');words.textContent=text;back.append(star,words);card.append(front,back);
 card.onclick=()=>{card.setAttribute('aria-pressed',String(card.classList.toggle('flipped')));$('giftText').textContent=name+'｜'+text;};
 item.append(card,window.assetDownloads('assets/downloads/'+img+'.jpg',name+'-生日小卡.jpg','保存小卡'));$('cards').append(item);
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
