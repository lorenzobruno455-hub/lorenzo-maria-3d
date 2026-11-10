// Fullscreen is a transient browser action; it never changes saved settings.
export function installFullscreen(button,status){
 const doc=button.ownerDocument;let busy=false;
 const supported=()=>!!doc.fullscreenEnabled&&typeof doc.documentElement.requestFullscreen==='function';
 const sync=()=>{button.textContent=doc.fullscreenElement?'Sair da tela inteira':'Entrar em tela inteira';button.setAttribute('aria-pressed',String(!!doc.fullscreenElement));button.disabled=busy||!supported();if(!supported()){status.textContent='Tela inteira indisponível neste navegador.';status.hidden=false;}};
 const toggle=async()=>{if(busy)return;busy=true;sync();status.hidden=true;try{if(doc.fullscreenElement)await doc.exitFullscreen();else await doc.documentElement.requestFullscreen({navigationUI:'hide'});}catch{status.textContent='O navegador não permitiu a tela inteira. Abra o jogo diretamente no Chrome e tente novamente.';status.hidden=false;}finally{busy=false;sync();}};
 button.addEventListener('click',toggle);doc.addEventListener('fullscreenchange',sync);sync();
 return()=>{button.removeEventListener('click',toggle);doc.removeEventListener('fullscreenchange',sync);};
}
