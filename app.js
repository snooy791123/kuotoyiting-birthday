const $=id=>document.getElementById(id),film=$('film'),song=$('song'),story=window.STORY;
let returnPlaying=false,soundOn=true,ended=false,toastTimer,audioPending=false;
film.muted=false;
function soundLabel(){$('sound').textContent=audioPending&&soundOn?'音樂已開 · 輕觸播放':soundOn?'聲音 開':'開啟聲音';$('sound').setAttribute('aria-pressed',String(soundOn));}
function lastChapterBefore(t){for(let i=story.chapters.length-1;i>=0;i--)if(t>=story.chapters[i])return i;return -1;}
const fmt=t=>`${String(Math.floor(t/60)).padStart(2,'0')}:${String(Math.floor(t%60)).padStart(2,'0')}`;
function toast(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3500)}
async function play(){song.pause();if(ended){ended=false;film.currentTime=0}try{film.muted=!soundOn;await film.play();audioPending=false;soundLabel();$('start').hidden=true}catch(e){if(e.name!=='AbortError'){audioPending=soundOn;soundLabel();$('loading').hidden=true;$('play').textContent='播放';$('play').setAttribute('aria-label','播放電影');$('start').hidden=false;$('start').textContent=soundOn?'輕觸開始電影（含音樂）':'輕觸開始電影'}}}
function pause(){film.pause();song.pause()}
function syncSong(){}
function seek(t){ended=false;film.currentTime=Math.max(0,Math.min(t,film.duration||story.duration));syncSong();render()}
function render(){const t=film.currentTime;$('time').textContent=fmt(t);$('progress').value=t;const sub=story.subtitles.find(s=>t>=s.start&&t<s.end);$('speaker').textContent=sub?.speaker||'';$('line').textContent=sub?.text||'';const c=lastChapterBefore(t);const ambient=['001','010','014','018','020'][Math.max(0,c)];if(!$('ambient').src.endsWith(ambient+'.webp'))$('ambient').src=`assets/${ambient}.webp`;document.querySelectorAll('[data-time]').forEach((b,i)=>{b.classList.toggle('active',i===c);if(i===c)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});}

film.addEventListener('timeupdate',render);film.addEventListener('seeking',()=>{song.pause();render()});film.addEventListener('seeked',syncSong);
film.addEventListener('play',()=>{$('play').textContent='暫停';$('play').setAttribute('aria-label','暫停電影');$('loading').hidden=true});film.addEventListener('pause',()=>{$('play').textContent='播放';$('play').setAttribute('aria-label','播放電影');song.pause()});film.addEventListener('waiting',()=>{$('loading').hidden=false;song.pause()});film.addEventListener('playing',()=>{$('loading').hidden=true;syncSong()});film.addEventListener('loadedmetadata',()=>{$('progress').max=film.duration;if(!$('birthday').open&&!new URLSearchParams(location.search).has('chapter'))play()});film.addEventListener('error',()=>{$('loading').hidden=true;$('start').hidden=false;const code=film.error?.code;$('start').textContent='影片載入失敗，輕觸重試';toast(code===4?'此裝置無法播放影片格式。':code===2?'網路連線異常，請稍後重試。':'影片無法載入，請重新整理或檢查網路。')});film.addEventListener('ended',()=>{ended=true;$('play').textContent='重播';$('play').setAttribute('aria-label','重播電影')});
$('start').onclick=()=>{if(film.error){film.load();film.addEventListener('loadedmetadata',()=>play(),{once:true});return;}play()};$('play').onclick=()=>{film.paused?play():pause()};$('prev').onclick=()=>{const t=film.currentTime;const c=lastChapterBefore(t-.5);seek(story.chapters[Math.max(0,c)])};$('next').onclick=()=>{const t=film.currentTime;seek(story.chapters.find(s=>s>t+.5)??story.duration-.1)};$('progress').oninput=e=>seek(Number(e.target.value));document.querySelectorAll('[data-time]').forEach(b=>b.onclick=()=>seek(Number(b.dataset.time)));
$('cc').onclick=()=>{const on=$('cc').getAttribute('aria-pressed')!=='true';$('cc').setAttribute('aria-pressed',on);$('cc').textContent=`字幕 ${on?'開':'關'}`;$('captions').classList.toggle('off',!on)};
$('sound').onclick=async()=>{if(audioPending&&soundOn){await play();return;}soundOn=!soundOn;audioPending=false;film.muted=!soundOn;soundLabel();if(soundOn&&film.paused&&!$('birthday').open)await play();};
document.addEventListener('click',e=>{if(audioPending&&soundOn&&!$('birthday').open&&!e.target.closest('#sound,#play,#start,#egg,a'))play();},{capture:true});
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.querySelector('.cinema').requestFullscreen)await document.querySelector('.cinema').requestFullscreen();else if(film.webkitEnterFullscreen)film.webkitEnterFullscreen();else toast('此瀏覽器不支援全螢幕，請橫向觀看。')}catch(e){toast('全螢幕無法啟用，請橫向觀看。')}};

function openGift(resume=!film.paused){returnPlaying=resume;pause();$('birthday').showModal();try{$('wish').value=localStorage.getItem('yiting-birthday-wish')||''}catch(e){}}
function closeGift(){song.pause();$('birthday').close();if(returnPlaying&&!ended)play()}
$('egg').onclick=()=>openGift();$('close').onclick=closeGift;$('resume').onclick=closeGift;$('birthday').addEventListener('cancel',e=>{e.preventDefault();closeGift()});$('saveWish').onclick=()=>{if(!$('wish').value.trim()){$('wishStatus').textContent='先寫下一個小小的願望吧。';$('wish').focus();return}try{localStorage.setItem('yiting-birthday-wish',$('wish').value);$('birthday').classList.add('wish-sealed');$('wishStatus').textContent='願望已留在妳的瀏覽器裡，作者不會知道內容。願妳被愛，也勇敢做自己。'}catch(e){$('wishStatus').textContent='作者不會收到妳的願望。此瀏覽器無法儲存，請先複製留念。'}};
// 舊版生日小卡已由最新互動漫畫與生日收藏頁取代。
let lastSave=0;film.addEventListener('timeupdate',()=>{if(Math.abs(film.currentTime-lastSave)>1){lastSave=film.currentTime;try{localStorage.setItem('yiting-film-progress',String(film.currentTime));localStorage.setItem('yiting-last-mode','movie');}catch{}}});
if(new URLSearchParams(location.search).get('resume')==='1')film.addEventListener('loadedmetadata',()=>{try{const saved=Number(localStorage.getItem('yiting-film-progress'));if(Number.isFinite(saved)&&saved>0&&saved<story.duration-1){seek(saved);toast('已接續上次觀看進度');}}catch{}},{once:true});
document.addEventListener('keydown',e=>{if($('birthday').open||['TEXTAREA','INPUT','BUTTON'].includes(document.activeElement.tagName))return;if(e.code==='Space'){e.preventDefault();$('play').click()}if(e.code==='ArrowRight')$('next').click();if(e.code==='ArrowLeft')$('prev').click()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});render();
const birthdayTracks=[
{title:'열 시 이십 분의 별',duration:182,src:'assets/ten-twenty-star.m4a',lyrics:[]},
{title:'너라는 별빛',duration:62,src:'assets/song.m4a',lyrics:[]},
{title:'10월의 밤',duration:70,src:'assets/moon-night.m4a',lyrics:[]}
];
let selectedBirthdayTrack=0;
const songButtons=[...document.querySelectorAll('[data-song-index]')];
const songNotice=$('birthdaySongNotice');
const songProgress=$('songProgress');
const songTime=$('songTime');
const songDuration=$('songDuration');
const birthdaySongMessage=(message)=>{songNotice.textContent=message};
function syncBirthdayLyrics(){
const original=$('lyrics'),translated=$('lyricsZh'),track=birthdayTracks[selectedBirthdayTrack];
if(selectedBirthdayTrack===0&&window.BIRTHDAY_LYRICS?.first){
if(!original.dataset.fullLyrics){
const sections=window.BIRTHDAY_LYRICS.first;
original.textContent=sections.map(([heading,lines])=>'【'+heading+'】\n'+lines.map(pair=>pair[0]+(pair[1]?'\n'+pair[1]:'')).join('\n\n')).join('\n\n');
translated.textContent='';
original.dataset.fullLyrics='true';
}
}else{
original.textContent='♪ '+track.title+' ♪';
translated.textContent='這首歌曲的逐句雙語歌詞正在校對中。';
original.dataset.fullLyrics='';
}
songTime.textContent=fmt(song.currentTime||0);
songProgress.value=Math.min(song.currentTime||0,Number(songProgress.max));
}
function selectBirthdayTrack(index){
if(!birthdayTracks[index])return;
song.pause();selectedBirthdayTrack=index;
const track=birthdayTracks[index];
song.src=track.src;song.load();
$('currentSongTitle').textContent=track.title;
$('currentSongSubtitle').textContent=String(index+1).padStart(2,'0')+' / 03 · '+fmt(track.duration);
songProgress.max=track.duration;songProgress.value=0;
songTime.textContent='00:00';songDuration.textContent=fmt(track.duration);
songButtons.forEach((button,i)=>{button.classList.toggle('active',i===index);button.setAttribute('aria-pressed',String(i===index))});
$('listen').textContent='播放歌曲 ▶';birthdaySongMessage('');
syncBirthdayLyrics();
}
songButtons.forEach((button,i)=>button.addEventListener('click',()=>selectBirthdayTrack(i)));
song.onplay=()=>{$('listen').textContent='暫停歌曲 ❚❚';syncBirthdayLyrics()};
song.onpause=()=>{$('listen').textContent='播放歌曲 ▶';syncBirthdayLyrics()};
song.onended=()=>{$('listen').textContent='重新播放 ↻';syncBirthdayLyrics()};
song.onerror=()=>{birthdaySongMessage('這首歌曲暫時無法載入，請檢查網路後重試。');$('listen').textContent='重新播放 ▶'};
$('listen').onclick=()=>{if(song.paused){film.pause();song.muted=false;song.play().catch(()=>birthdaySongMessage('目前無法播放這首歌曲，請確認音訊已上傳。'))}else song.pause()};
songProgress.addEventListener('input',()=>{if(song.readyState>0){song.currentTime=Number(songProgress.value);syncBirthdayLyrics()}});
song.ontimeupdate=syncBirthdayLyrics;song.onseeked=syncBirthdayLyrics;
selectBirthdayTrack(0);
if(document.modelContext?.registerTool){const lifecycle=new AbortController();try{Promise.resolve(document.modelContext.registerTool({name:'navigate_birthday_chapter',title:'前往生日電影章節',description:'前往指定章節並更新電影畫面；保留目前播放或暫停狀態。',inputSchema:{type:'object',properties:{chapter:{type:'integer',minimum:1,maximum:5}},required:['chapter'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||!Number.isInteger(input.chapter)||input.chapter<1||input.chapter>5||Object.keys(input).length!==1)throw new Error('chapter 必須為 1 到 5 的整數');seek(story.chapters[input.chapter-1]);return{chapter:input.chapter,time:film.currentTime,paused:film.paused}}},{signal:lifecycle.signal})).catch(()=>{});addEventListener('pagehide',()=>lifecycle.abort(),{once:true})}catch(e){}}

const gameReturn=new URLSearchParams(location.search);if(gameReturn.get('chapter')==='5'&&gameReturn.get('gift')!=='1'){film.addEventListener('loadedmetadata',()=>{seek(story.chapters[4]);pause();},{once:true});}

$('focus').onclick=()=>{const on=document.body.classList.toggle('cinema-focus');$('focus').setAttribute('aria-pressed',String(on));$('focus').textContent=on?'回到專輯':'專注觀看';};
