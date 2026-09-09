(() => {
  'use strict';
  document.querySelectorAll('[data-map-viewer]').forEach(root => {
    const view=root.querySelector('.map-viewport'), img=view.querySelector('img');
    const range=root.querySelector('input'), output=root.querySelector('output');
    const minus=root.querySelector('[data-zoom-out]'), plus=root.querySelector('[data-zoom-in]');
    let z=1, fit=1, x=0, y=0, initialized=false;
    const pointers=new Map();
    function paint(){
      const w=img.naturalWidth*fit*z,h=img.naturalHeight*fit*z;
      x=w<=view.clientWidth?(view.clientWidth-w)/2:Math.max(view.clientWidth-w,Math.min(0,x));
      y=h<=view.clientHeight?(view.clientHeight-h)/2:Math.max(view.clientHeight-h,Math.min(0,y));
      img.style.width=img.naturalWidth+'px'; img.style.height=img.naturalHeight+'px';
      img.style.transform=`translate(${x}px,${y}px) scale(${fit*z})`;
      range.value=Math.round(z*100);output.value=Math.round(z*100)+'%';
      minus.disabled=z<=1;plus.disabled=z>=12;
    }
    function zoom(next,cx=view.clientWidth/2,cy=view.clientHeight/2){
      next=Math.max(1,Math.min(12,next));const ratio=next/z;
      x=cx-(cx-x)*ratio;y=cy-(cy-y)*ratio;z=next;paint();
    }
    function reset(){z=1;x=0;y=0;paint();}
    function resize(){
      if(!img.naturalWidth)return;
      const previous=fit;fit=Math.min(view.clientWidth/img.naturalWidth,view.clientHeight/img.naturalHeight);
      if(initialized){x*=fit/previous;y*=fit/previous;}paint();
    }
    function start(){if(initialized||!img.naturalWidth)return;root.classList.add('ready');root.querySelector('.map-toolbar').hidden=false;resize();initialized=true;}
    img.addEventListener('load',start);if(img.complete)start();
    new ResizeObserver(resize).observe(view);
    range.addEventListener('input',()=>zoom(Number(range.value)/100));
    minus.addEventListener('click',()=>zoom(z/1.25));plus.addEventListener('click',()=>zoom(z*1.25));
    root.querySelector('[data-reset]').addEventListener('click',reset);
    root.querySelector('[data-expand]').addEventListener('click',e=>{const expanded=root.classList.toggle('expanded');e.currentTarget.setAttribute('aria-expanded',String(expanded));e.currentTarget.textContent=expanded?'Collapse map':'Expand map';});
    view.addEventListener('keydown',e=>{
      if(!initialized)return;
      const moves={ArrowLeft:[60,0],ArrowRight:[-60,0],ArrowUp:[0,60],ArrowDown:[0,-60]};
      if(moves[e.key]){e.preventDefault();x+=moves[e.key][0];y+=moves[e.key][1];paint();}
      else if(['+','=','-','Home'].includes(e.key)){e.preventDefault();if(e.key==='Home')reset();else zoom(e.key==='-'?z/1.25:z*1.25);}
    });
    const pos=e=>{const r=view.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};};
    view.addEventListener('pointerdown',e=>{if(!initialized||e.button!==0)return;pointers.set(e.pointerId,pos(e));view.setPointerCapture(e.pointerId);if(e.pointerType==='mouse')view.focus({preventScroll:true});});
    view.addEventListener('pointermove',e=>{
      if(!pointers.has(e.pointerId))return;
      const old=[...pointers.values()];const prev=pointers.get(e.pointerId);pointers.set(e.pointerId,pos(e));const now=[...pointers.values()];
      if(now.length===1){x+=now[0].x-prev.x;y+=now[0].y-prev.y;paint();}
      else if(now.length===2){
        const center=a=>({x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2});
        const distance=a=>Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);
        const a=center(old),b=center(now),d=distance(old);
        if(d>0)zoom(z*distance(now)/d,a.x,a.y);
        x+=b.x-a.x;y+=b.y-a.y;paint();
      }
    });
    ['pointerup','pointercancel','lostpointercapture'].forEach(type=>view.addEventListener(type,e=>pointers.delete(e.pointerId)));
  });
})();
