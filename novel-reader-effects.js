(()=>{
 const notes=[
  '今天或許和昨天很像，但妳來到這個世界的日子，永遠值得被認真記住。生日快樂，YiTing。',
  '有時候，最美好的訊息，會在最平凡的一刻抵達。願妳的每一天，都有值得期待的驚喜。',
  '跨出那一步之前，可以緊張，也可以慢一點。願妳勇敢伸出的手，總能遇見溫柔的回應。',
  '從遠遠的喜歡，到真正的相遇，這份心意從來都不是單向的。願妳每次到來，都被笑著迎接。',
  '希望、溫柔、快樂與勇氣，不必一次全部擁有。今天收下一點點，明天就能再往前走一點點。',
  '妳也是很重要的人。請把留給別人的溫柔，分一點給自己；把今天這顆紅色星星，也留在心裡。',
  '台下只有一位觀眾，但這一整片星海，都為她而亮。願妳記得，自己值得成為被珍惜的主角。',
  '有些願望不用說出口。讓它安靜留在心裡，像一顆還沒發芽、卻已經被溫柔照顧的種子。',
  '相遇的時間也許很短，留下的陪伴卻可以很長。願妳握住的那點星光，照亮接下來的每段路。',
  '故事到了最後一頁，生活裡的星光才正要繼續。願妳往後的每一年，都有喜歡的事，也有喜歡自己的勇氣。'
 ];
 const wide=new Set(['novel-concert-prelude-wide','novel-music-garden-wide','novel-bamby-plaza-wide','novel-starlit-walk-wide','novel-observatory-wide','novel-greenhouse-wide','novel-frozen-city','novel-return-wide','novel-concert-wide','novel-quiet-bridge','002','novel-portal','novel-crossing','novel-asterum-panorama','novel-asterum-view','novel-stage-lights','novel-portal-goodbye','novel-walk-forward','novel-bamby-dance']);
 const close=new Set(['novel-yiting-starlit-eyes','novel-blue-star-detail','novel-bamby-pink-detail-v2','novel-red-light-detail','novel-green-star-detail','novel-purple-star-detail','novel-light-touch','novel-keepsake-closeup','novel-candle-closeup','novel-yejun-closeup','novel-bamby-closeup','novel-eunho-reassurance','novel-signal-closeup','novel-eunho-closeup','novel-audience-closeup','novel-star-closeup','novel-yejun-guitar','novel-noah-closeup','novel-hamin-closeup']);
 let observer;
 function burst(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const area=document.querySelector('.chapter-surprise');area.querySelectorAll('.note-burst').forEach(e=>e.remove());for(let i=0;i<12;i++){const s=document.createElement('span');s.className='note-burst';s.textContent='✦';s.setAttribute('aria-hidden','true');const angle=Math.PI*2*i/12;s.style.setProperty('--burst-x',Math.cos(angle)*100+'px');s.style.setProperty('--burst-y',Math.sin(angle)*65+'px');s.style.setProperty('--burst-color',['#75aee2','#b68bd4','#d783a0','#85ab85','#cf6078'][i%5]);area.append(s);setTimeout(()=>s.remove(),1100);}}
 window.refreshComicAtmosphere=index=>{
  observer?.disconnect();
  document.querySelectorAll('.note-burst').forEach(e=>e.remove());
  if('IntersectionObserver' in window)observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('scene-visible');observer.unobserve(entry.target);}}),{threshold:.08});
  document.querySelectorAll('.panel').forEach(panel=>{const image=panel.querySelector('img'),name=image.getAttribute('src').split('/').pop().replace('.webp','');panel.classList.add(wide.has(name)?'scene-wide':close.has(name)?'scene-close':'scene-medium');panel.querySelectorAll('.bubble').forEach((b,i)=>b.style.setProperty('--bubble-delay',i*70+'ms'));const art=panel.querySelector('.art-button');for(let i=0;i<3;i++){const s=document.createElement('span');s.className='scene-spark';s.setAttribute('aria-hidden','true');s.style.left=[18,68,86][i]+'%';s.style.top=[27,16,70][i]+'%';s.style.setProperty('--spark-delay',i*1.3+'s');art.append(s);}if(observer)observer.observe(panel);else panel.classList.add('scene-visible');});
  const button=document.getElementById('openChapterNote'),note=document.getElementById('chapterNote');note.hidden=true;button.setAttribute('aria-expanded','false');button.innerHTML='<span aria-hidden="true">✦</span> 星光裡，藏著一張小紙條';document.getElementById('chapterNoteText').textContent=notes[index];button.onclick=()=>{const opening=note.hidden;note.hidden=!opening;button.setAttribute('aria-expanded',String(opening));button.innerHTML='<span aria-hidden="true">✦</span> '+(opening?'把心意收進這一頁 · 收起紙條':'星光裡，藏著一張小紙條');if(opening)burst();};
 };
 window.refreshComicAtmosphere(chapter);
})();
