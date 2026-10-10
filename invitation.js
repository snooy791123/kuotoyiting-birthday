(()=>{
const page=location.pathname.split('/').pop()||'index.html';
function foilTitles(){document.querySelectorAll('.jacket-copy h1,.album-date,.jacket-title,.contents-heading h2,.album-item h3,.collection-intro h1,.collection-title>span,.blessing-copy h2,.novel-comic-entry h2,.intro h1,.issue h1,main>h1,#chapterTitle').forEach(title=>{if(title.querySelector(':scope > .foil-text'))return;const span=document.createElement('span');span.className='foil-text';while(title.firstChild)span.append(title.firstChild);title.append(span);});}
foilTitles();['title','chapterTitle'].forEach(id=>{const title=document.getElementById(id);if(title)new MutationObserver(foilTitles).observe(title,{childList:true});});
const nav=document.createElement('nav');nav.className='journey-nav';nav.setAttribute('aria-label','生日旅程導覽');
[['index.html','✦','邀請'],['movie.html','▷','電影'],['game.html','▤','故事'],['gift.html','♡','禮物']].forEach(([href,icon,label])=>{const a=document.createElement('a');a.href=href;a.innerHTML='<span aria-hidden="true">'+icon+'</span>'+label;if(page===href||(href==='game.html'&&page==='novel-comic.html'))a.setAttribute('aria-current','page');nav.append(a);});document.body.append(nav);
const oldNav=document.querySelector('.site-nav');if(oldNav&&!oldNav.querySelector('[href="novel-comic.html"]')){const a=document.createElement('a');a.href='novel-comic.html';a.textContent='小說漫畫';oldNav.insertBefore(a,oldNav.lastElementChild);}
if(page==='game.html'||page==='novel-comic.html'){const tabs=document.createElement('nav');tabs.className='story-editions';tabs.setAttribute('aria-label','選擇故事冊');[['game.html','原畫互動漫畫'],['novel-comic.html','小說漫畫']].forEach(([href,label])=>{const a=document.createElement('a');a.href=href;a.textContent=label;if(page===href)a.setAttribute('aria-current','page');tabs.append(a);});document.querySelector('main').prepend(tabs);}
if(page==='gift.html'){
const grid=document.getElementById('cards');if(!grid)return;
const filters=document.createElement('div');filters.className='card-filters';filters.setAttribute('role','group');filters.setAttribute('aria-label','祝福小卡篩選');
const status=document.createElement('p');status.className='filter-status';status.setAttribute('role','status');
const labels=['全部','銀虎','藝俊','諾亞','斑比','河玟','故事場景'];
const names={'銀虎':'eunho','藝俊':'yejun','諾亞':'noah','斑比':'bamby','河玟':'hamin'};
labels.forEach(label=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.setAttribute('aria-pressed',String(label==='全部'));b.onclick=()=>{let count=0;grid.querySelectorAll('.card-item').forEach(item=>{const asset=item.dataset.cardAsset,name=item.dataset.cardName;const show=label==='全部'||(label==='故事場景'?asset.startsWith('novel-')&&!Object.values(names).some(n=>asset.includes(n)):name===label||asset.includes(names[label]));item.hidden=!show;if(show)count++;});filters.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));status.textContent=label+' · '+count+' 張祝福小卡';};filters.append(b);});grid.before(filters,status);filters.firstElementChild.click();
}
})();
