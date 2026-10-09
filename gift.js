const $=id=>document.getElementById(id),song=$('song');
function setStatus(message){$('wishStatus').textContent=message;}
try{$('wish').value=localStorage.getItem('yiting-birthday-wish')||'';}catch{}
$('saveWish').onclick=()=>{
 if(!$('wish').value.trim()){setStatus('先寫下一個小小的願望吧。');$('wish').focus();return;}
 try{localStorage.setItem('yiting-birthday-wish',$('wish').value);$('birthday').classList.add('wish-sealed');setStatus('願望已留在妳的瀏覽器裡，作者不會知道內容。願妳被愛，也勇敢做自己。');}
 catch{setStatus('作者不會收到妳的願望。此瀏覽器無法儲存，請先複製留念。');}
};
$('bookSize').onclick=()=>{const enlarged=document.querySelector('.novel').classList.toggle('large-print');$('bookSize').textContent=enlarged?'標準字體':'放大字體';};
song.onplay=()=>{$('listen').textContent='暫停生日歌曲';};
song.onpause=()=>{$('listen').textContent='聽生日歌曲';};
song.onended=()=>{$('listen').textContent='再聽一次生日歌曲';};
$('listen').onclick=()=>{if(song.paused){song.muted=false;song.play().catch(()=>{$('lyrics').textContent='請再輕觸一次播放歌曲。';});}else song.pause();};
song.ontimeupdate=()=>{const cue=((window.STORY&&window.STORY.lyrics)||[]).find(s=>song.currentTime>=s.start&&song.currentTime<s.end);$('lyrics').textContent=cue?cue.text:'';};
document.addEventListener('visibilitychange',()=>{if(document.hidden)song.pause();});
const cards=[['銀虎','022','希望每一天，妳都能笑得像今晚一樣。'],['藝俊','card-0000(1)','讓每一首歌，陪妳走向更好的明天。'],['諾亞','card-0000(5)','願妳的夢，永遠有光照著。'],['斑比','card-0000(3)','把快樂留給自己，也把勇氣留給夢想。'],['河玟','card-0000(4)','累的時候也沒關係，我們一直都在。'],['PLAVE','card-0000(2)','五道星光，一起祝妳生日快樂。']];
cards.forEach(([name,img,text])=>{
 const item=document.createElement('div');item.className='card-item';
 const card=document.createElement('button');card.className='photocard';card.setAttribute('aria-label',name+'小卡，翻面看祝福');card.setAttribute('aria-pressed','false');
 const front=document.createElement('span');front.className='card-front';const photo=document.createElement('img');photo.src='assets/'+img+'.webp';photo.alt=name+'生日小卡';photo.loading='lazy';const label=document.createElement('strong');label.textContent=name;front.append(photo,label);
 const back=document.createElement('span');back.className='card-back';const star=document.createElement('span');star.textContent='✦';const words=document.createElement('span');words.textContent=text;back.append(star,words);card.append(front,back);
 card.onclick=()=>{card.setAttribute('aria-pressed',String(card.classList.toggle('flipped')));$('giftText').textContent=name+'｜'+text;};
 item.append(card,window.assetDownloads('assets/downloads/'+img+'.jpg',name+'-生日小卡.jpg','保存小卡'));$('cards').append(item);
});
