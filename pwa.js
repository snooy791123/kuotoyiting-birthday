(()=>{
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
let installEvent;
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installEvent=event;});
const host=document.querySelector('.album-jacket');
if(host&&!standalone()){
 const panel=document.createElement('aside');panel.className='app-install';panel.setAttribute('aria-label','加入手機主畫面');
 panel.innerHTML='<img src="assets/app-icon-192.png" alt="YiTing 生日邀請卡 App 圖示" width="64" height="64"><div><h2>把星光，收進手機。</h2><p>加入主畫面，下次輕觸圖示就能回來。</p></div><button type="button" id="installBirthdayApp">加入手機主畫面 ↗</button>';
 host.after(panel);
 const dialog=document.createElement('dialog');dialog.className='install-guide';dialog.setAttribute('aria-labelledby','installGuideTitle');
 dialog.innerHTML='<h2 id="installGuideTitle">把生日邀請留在主畫面</h2><p>iPhone／iPad</p><ol><li>用 Safari 開啟這個網站。</li><li>點選分享按鈕，再選「加入主畫面」。</li><li>若出現「作為網頁 App 打開」，請保持開啟，再點「加入」。</li></ol><p>Android</p><ol><li>用 Chrome 開啟這個網站。</li><li>點選瀏覽器選單，選「安裝應用程式」或「新增至主畫面」。</li><li>依畫面提示確認安裝。</li></ol><p class="install-note">影片、歌曲及尚未載入的插畫需要網路。願望只留在目前使用的瀏覽器／App，換裝置或換開啟方式可能不會共用。</p><button type="button" id="closeInstallGuide">知道了</button>';
 document.body.append(dialog);
 document.getElementById('closeInstallGuide').onclick=()=>dialog.close();
 document.getElementById('installBirthdayApp').onclick=async()=>{if(installEvent){const event=installEvent;installEvent=null;await event.prompt();const result=await event.userChoice;if(result.outcome==='accepted')panel.hidden=true;}else dialog.showModal();};
 window.addEventListener('appinstalled',()=>{panel.hidden=true;installEvent=null;});
}
const status=document.createElement('p');status.className='offline-status';status.setAttribute('role','status');status.textContent='目前沒有網路，影片、歌曲與新圖片需要連線後開啟。';status.hidden=navigator.onLine;document.body.prepend(status);window.addEventListener('online',()=>status.hidden=true);window.addEventListener('offline',()=>status.hidden=false);
})();
