(()=>{
 const el=id=>document.getElementById(id),dialog=el('novelFilm');
 const shots=panels.flatMap((list,c)=>list.map(([img,narration,lines],p)=>({c,p,img,cues:[['旁白',narration],...lines]})));
 let position=0,cue=0,running=false,loading=false,ended=false,remaining=0,last=0,timer=null,loadVersion=0;
 const cueDuration=()=>Math.max(4200,Math.min(14000,shots[position].cues[cue][1].length*180+2500))*Number(el('filmSpeed').value);
 function musicState(){el('filmMusic').textContent=music.paused?'音樂關閉 · 開啟':'音樂開啟 · 關閉';el('filmMusic').setAttribute('aria-pressed',String(!music.paused));}
 function controls(){el('filmToggle').textContent=ended?'再看一次':running?'暫停':'繼續播放';el('filmToggle').setAttribute('aria-pressed',String(running));el('filmPrev').disabled=position===0;el('filmNext').disabled=position===shots.length-1;dialog.classList.toggle('film-running',running&&!loading);musicState();}
 function captions(){const shot=shots[position];el('filmSpeaker').textContent=shot.cues[cue][0];el('filmSubtitle').textContent=shot.cues[cue][1];el('filmChapter').textContent=chapters[shot.c].title;el('filmCounter').textContent=(position+1)+' / '+shots.length+' 鏡';el('filmProgress').max=shots.length;el('filmProgress').value=position+cue/shot.cues.length;}
 function remember(){try{localStorage.setItem('yiting-novel-film-shot',String(position));}catch{}}
 function showShot(next){position=Math.max(0,Math.min(shots.length-1,next));cue=0;ended=false;loading=true;remaining=cueDuration();last=performance.now();remember();captions();el('filmStatus').textContent='圖片載入完成後，鏡頭與字幕會連續播放。';controls();const version=++loadVersion;const image=el('filmImage');image.alt=shots[position].cues[0][1];el('filmLoad').hidden=false;el('filmLoad').textContent='星光正在抵達…';image.src='assets/'+shots[position].img+'.webp';image.decode().then(()=>{if(version!==loadVersion||!dialog.open)return;loading=false;last=performance.now();el('filmLoad').hidden=true;el('filmStatus').textContent='字幕自動接續 · 可隨時暫停慢慢看';controls();}).catch(()=>{if(version!==loadVersion)return;loading=true;running=false;el('filmLoad').textContent='這張圖片暫時無法載入。可切換前後鏡，或稍後重新開啟。';el('filmStatus').textContent='播放已暫停';controls();});}
 function tick(){if(!dialog.open||!running||loading)return;const now=performance.now();remaining-=now-last;last=now;if(remaining>0)return;if(cue<shots[position].cues.length-1){cue++;remaining=cueDuration();captions();return;}if(position<shots.length-1){showShot(position+1);return;}ended=true;running=false;el('filmProgress').value=shots.length;el('filmSpeaker').textContent='FOR YITING';el('filmSubtitle').textContent='願妳往後的每一年，都有屬於自己的星光。';el('filmStatus').textContent='漫畫電影已播放完畢 · 回到漫畫可收藏小卡';controls();}
 function start(from){if(dialog.open)return;dialog.showModal();document.body.style.overflow='hidden';running=true;userPaused=false;play();showShot(from);timer=setInterval(tick,100);el('filmToggle').focus();}
 function pause(){running=false;controls();}
 el('filmStart').onclick=()=>start(0);
 el('filmFromHere').onclick=()=>start(Math.max(0,shots.findIndex(s=>s.c===chapter)));
 el('filmToggle').onclick=()=>{if(ended){running=true;userPaused=false;play();showShot(0);return;}if(running){pause();userPaused=true;music.pause();el('filmStatus').textContent='已暫停 · 輕觸繼續播放';}else{running=true;last=performance.now();userPaused=false;play();controls();el('filmStatus').textContent='字幕自動接續 · 可隨時暫停慢慢看';}};
 el('filmPrev').onclick=()=>showShot(position-1);
 el('filmNext').onclick=()=>showShot(position+1);
 el('filmSpeed').onchange=()=>{remaining=cueDuration();last=performance.now();};
 el('filmMusic').onclick=()=>{if(music.paused){userPaused=false;play();}else{userPaused=true;music.pause();}};
 music.addEventListener('play',musicState);music.addEventListener('pause',musicState);
 el('filmClose').onclick=()=>dialog.close();
 dialog.addEventListener('close',()=>{running=false;loadVersion++;clearInterval(timer);timer=null;document.body.style.overflow='';render(shots[position].c,false);el('filmFromHere').focus();});
 dialog.addEventListener('keydown',e=>{if(['SELECT','INPUT'].includes(e.target.tagName))return;if(e.key==='ArrowRight'){e.preventDefault();if(position<shots.length-1)showShot(position+1);}if(e.key==='ArrowLeft'){e.preventDefault();if(position>0)showShot(position-1);}if(e.key===' '&&e.target.tagName!=='BUTTON'){e.preventDefault();el('filmToggle').click();}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&dialog.open){pause();el('filmStatus').textContent='離開畫面時已暫停 · 回來後輕觸繼續播放';}});
})();
