window.assetDownloads=function(url,filename,label){
 const controls=document.createElement('div');controls.className='asset-downloads';
 const save=document.createElement('a');save.className='download-link';save.href=url;save.download=filename;save.textContent='↓ '+label;save.setAttribute('aria-label',label+'：'+filename);
 const original=document.createElement('a');original.className='original-link';original.href=url;original.target='_blank';original.rel='noopener';original.textContent='開啟原圖';original.setAttribute('aria-label','開啟原圖：'+filename);
 controls.append(save,original);return controls;
};
