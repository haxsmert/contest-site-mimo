
(function(){
  var lb=document.getElementById('lb'); if(!lb) return;
  var im=lb.querySelector('img'), ct=lb.querySelector('.ct'), g=[], i=0, scale=1, tx=0, ty=0, baseW=0, baseH=0;
  // 缩放改「width」而非 transform:scale —— 放大时让浏览器从全分辨率源重新栅格化到大尺寸才清晰;
  // transform 缩放只是把已缩到屏宽的贴图拉大,高 DPR 手机上会糊。
  function fit(){ im.style.maxWidth='96vw'; im.style.maxHeight='84vh'; im.style.width=''; im.style.height=''; im.style.transform='translate(0px,0px)'; im.style.cursor=''; }
  function grabBase(){ if(scale===1){ baseW=im.clientWidth; baseH=im.clientHeight; } }   // 缩放前记下贴合尺寸
  function apply(){
    if(scale<=1){ scale=1; tx=0; ty=0; fit(); return; }
    im.style.maxWidth='none'; im.style.maxHeight='none';
    im.style.width=(baseW*scale)+'px'; im.style.height=(baseH*scale)+'px';   // 改实际尺寸=重新栅格化=清晰
    im.style.transform='translate('+tx+'px,'+ty+'px)';                        // translate 只管平移
    im.style.cursor=mdrag?'grabbing':'grab';                                  // 放大态给抓手提示
  }
  function reset(){ scale=1; tx=0; ty=0; baseW=0; baseH=0; fit(); }
  function show(){ reset(); im.removeAttribute('src'); im.src=g[i].getAttribute('href');
    if(ct) ct.textContent=(i+1)+' / '+g.length; }
  function open(a){ g=[].slice.call(document.querySelectorAll('a.lb')); i=g.indexOf(a);
    show(); lb.classList.add('on'); document.body.style.overflow='hidden'; }
  function close(){ lb.classList.remove('on'); im.removeAttribute('src'); reset(); document.body.style.overflow=''; }
  function nav(d){ if(g.length){ i=(i+d+g.length)%g.length; show(); } }
  document.addEventListener('click', function(e){
    var a=e.target.closest && e.target.closest('a.lb'); if(a){ e.preventDefault(); open(a); } });
  lb.querySelector('.x').onclick=close;
  lb.querySelector('.prev').onclick=function(e){ e.stopPropagation(); nav(-1); };
  lb.querySelector('.next').onclick=function(e){ e.stopPropagation(); nav(1); };
  lb.addEventListener('click', function(e){ if(e.target===lb && scale===1) close(); });
  document.addEventListener('keydown', function(e){ if(!lb.classList.contains('on')) return;
    if(e.key==='Escape') close(); else if(e.key==='ArrowLeft') nav(-1); else if(e.key==='ArrowRight') nav(1); });
  im.addEventListener('dblclick', function(e){ e.preventDefault(); grabBase(); scale=scale>1?1:2.6; tx=0; ty=0; apply(); });
  lb.addEventListener('wheel', function(e){ if(!lb.classList.contains('on')) return; e.preventDefault();
    grabBase();
    // 按 deltaY 实际滚动量做指数缩放:高精度滚轮/触控板把一次轻滑拆成几十个小事件,
    // 原来每事件固定×1.15 会连乘爆炸;指数模型下事件再碎、总量相同则缩放相同。
    var d=e.deltaY; if(e.deltaMode===1) d*=33; else if(e.deltaMode===2) d*=120;
    d=Math.max(-200, Math.min(200, d));                       // 单事件限幅,防异常大 delta 一跳到顶
    var ns=Math.min(6, scale*Math.exp(-d*0.0015));            // 一格普通滚轮(≈100)≈±16%
    if(ns<=1){ scale=1; tx=0; ty=0; apply(); return; }
    var r=im.getBoundingClientRect(), k=1-ns/scale;           // 以光标为锚点:缩放后光标下的内容不动
    tx+=(e.clientX-(r.left+r.width/2))*k; ty+=(e.clientY-(r.top+r.height/2))*k;
    scale=ns; apply(); }, {passive:false});
  var sx=0, sy=0, px=0, py=0, pd=0, ps=1;
  function dist(t){ return Math.hypot(t[0].clientX-t[1].clientX, t[0].clientY-t[1].clientY); }
  lb.addEventListener('touchstart', function(e){
    if(e.target.closest('.bar') || e.target.closest('.x')) return;   // 别拦底部按钮
    if(e.touches.length===2){ grabBase(); pd=dist(e.touches); ps=scale; }
    else { sx=e.touches[0].clientX; sy=e.touches[0].clientY; px=tx; py=ty; }
  }, {passive:true});
  lb.addEventListener('touchmove', function(e){      // 只缩放/拖动,绝不靠滑动切图(避免误触系统切换)
    if(e.touches.length===2){ e.preventDefault();
      scale=Math.min(6, Math.max(1, ps*dist(e.touches)/pd)); if(scale<=1){ scale=1; tx=0; ty=0; } apply(); }
    else if(e.touches.length===1 && scale>1){ e.preventDefault();
      tx=px+(e.touches[0].clientX-sx); ty=py+(e.touches[0].clientY-sy); apply(); }
  }, {passive:false});
  // PC:放大后按住鼠标拖动平移(此前只有触屏能拖,鼠标端放大了挪不动)
  var mdrag=false, mx0=0, my0=0, mtx=0, mty=0;
  im.addEventListener('mousedown', function(e){
    if(scale>1){ e.preventDefault(); mdrag=true; mx0=e.clientX; my0=e.clientY; mtx=tx; mty=ty; apply(); } });
  window.addEventListener('mousemove', function(e){ if(!mdrag) return; e.preventDefault();
    tx=mtx+(e.clientX-mx0); ty=mty+(e.clientY-my0); apply(); });
  window.addEventListener('mouseup', function(){ if(mdrag){ mdrag=false; apply(); } });
  im.addEventListener('dragstart', function(e){ e.preventDefault(); });   // 禁原生图片拖拽幽灵图
  var m=document.getElementById('more');
  if(m) m.onclick=function(){ document.getElementById('older').hidden=false; m.remove(); };
})();
