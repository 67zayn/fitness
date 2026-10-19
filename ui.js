/* ===== เอฟเฟกต์ UI: แจ้งเตือนการชำระเงิน + ชุดคอมโพเนนต์ที่ขยับ (ออกแบบเอง) ===== */
(function(){
const NTH=[...Array(16)].map((_,i)=>`#fsh.casc>*:nth-child(${i+1}){animation-delay:${i*38}ms}`).join('');
const st=document.createElement('style');st.textContent=`
.sp{z-index:60}
/* --- การ์ดแจ้งเตือนการชำระเงิน --- */
.pn{position:fixed;left:50%;top:calc(env(safe-area-inset-top) + 12px);width:min(390px,calc(100% - 24px));transform:translate(-50%,-150%) scale(.94);opacity:0;filter:blur(10px);z-index:50;pointer-events:none;transition:transform .8s cubic-bezier(.2,.9,.25,1),opacity .45s,filter .6s}
.pn.on{transform:translate(-50%,0) scale(1);opacity:1;filter:none;pointer-events:auto}
.pnc{position:relative;overflow:hidden;cursor:pointer;display:grid;grid-template-columns:auto 1fr auto;column-gap:14px;align-items:center;background:var(--cd);border:1px solid var(--ln);border-radius:24px;padding:14px 16px 12px;box-shadow:0 22px 60px rgba(0,0,0,.2)}
.pni{grid-row:1/3;width:48px;height:48px;border-radius:50%;display:grid;place-items:center;color:#fff;animation:pr 1.3s .55s ease-out 2}
@keyframes pr{from{box-shadow:0 0 0 0 var(--pc)}to{box-shadow:0 0 0 18px transparent}}
.pni svg{width:26px;height:26px;stroke-width:3.2}.pni .chk{stroke-dasharray:26;stroke-dashoffset:26;animation:ck .55s .5s cubic-bezier(.2,.9,.25,1) forwards}@keyframes ck{to{stroke-dashoffset:0}}
.pn.on .pni{animation-name:pop2,pr;animation-duration:.6s,1.3s;animation-delay:.1s,.7s;animation-iteration-count:1,2}@keyframes pop2{from{transform:scale(.3)}60%{transform:scale(1.12)}}
.pnt{font-size:13px;color:var(--mu);align-self:end}.pna{grid-column:3;grid-row:1/3;font-size:23px;font-weight:700;font-variant-numeric:tabular-nums;text-align:right;letter-spacing:-.01em}
.pns{font-size:12.5px;color:var(--mu);align-self:start;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.pnf{grid-column:1/-1;display:flex;justify-content:space-between;gap:10px;margin-top:11px;padding-top:9px;border-top:1px dashed var(--ln);font-size:12px;color:var(--mu)}.pnf b{color:var(--tx);font-weight:600}
.pnb{position:absolute;left:0;bottom:0;height:3px;width:100%;background:var(--c);transform-origin:left;animation:pb 4.4s linear forwards}@keyframes pb{to{transform:scaleX(0)}}
.pnc>*{opacity:0;animation:pin .55s cubic-bezier(.2,.9,.25,1) forwards}.pnc>.pni{opacity:1}.pnc>.pnt{animation-delay:.25s}.pnc>.pns{animation-delay:.32s}.pnc>.pna{animation-delay:.3s}.pnc>.pnf{animation-delay:.45s}.pnc>.pnb{opacity:1;animation:pb 4.4s linear forwards}
@keyframes pin{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media(min-width:900px){.pn{left:auto;right:28px;transform:translate(0,-150%) scale(.94)}.pn.on{transform:none}}
/* --- ชุดคอมโพเนนต์ที่ขยับ --- */
.seg{position:relative}.seg button{position:relative;z-index:1}.seg.tk button.on{background:none!important;box-shadow:none!important}
.sgi{position:absolute;top:3px;bottom:3px;left:0;width:0;border-radius:9px;background:var(--cd);box-shadow:0 1px 6px rgba(0,0,0,.15);transition:transform .5s cubic-bezier(.3,1.35,.5,1),width .5s cubic-bezier(.3,1.35,.5,1);pointer-events:none;z-index:0}
.ch{transition:background .25s,color .25s,transform .3s cubic-bezier(.3,1.6,.5,1)}
#fcs .ch.on,#seg-c .ch.on,#seg-r .ch.on{animation:cp .45s cubic-bezier(.3,1.8,.5,1)}@keyframes cp{40%{transform:scale(1.1)}}
#fsh.casc>*{animation:cas .55s cubic-bezier(.2,.9,.25,1) both}@keyframes cas{from{opacity:0;transform:translateY(14px)}}${NTH}
.ocrs s{background:linear-gradient(90deg,var(--ac) 0,color-mix(in srgb,var(--ac) 35%,transparent) 50%,var(--ac) 100%)!important;background-size:200% 100%;animation:shm 1.2s linear infinite}@keyframes shm{to{background-position:-200% 0}}
@media(hover:hover){.cd{position:relative}.cd::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .35s;background:radial-gradient(240px circle at var(--mx,50%) var(--my,50%),color-mix(in srgb,var(--ac) 10%,transparent),transparent 70%)}.cd:hover::after{opacity:1}.tx:hover,.kc:hover,.rs:hover{box-shadow:0 8px 24px rgba(0,0,0,.08)}}
`;document.head.appendChild(st);
document.body.insertAdjacentHTML('beforeend','<div class="pn" id="pn" role="status" aria-live="polite"></div>');

/* ---------- แจ้งเตือนการชำระเงิน ---------- */
let pnT,pnR=0;const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>'฿'+n.toLocaleString('th-TH',{minimumFractionDigits:2,maximumFractionDigits:2});
function hidePN(){document.getElementById('pn').classList.remove('on')}
function payNotify(o){const el=document.getElementById('pn'),inc=o.type=='i',c=inc?'#34c759':(o.color||'#007aff');
 el.innerHTML=`<div class="pnc" style="--c:${c};--pc:color-mix(in srgb,${c} 45%,transparent)"><div class="pni" style="background:${c}"><svg class="i" viewBox="0 0 24 24"><path class="chk" d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><div class="pnt">${inc?'รับเงินแล้ว':'จ่ายเงินแล้ว'}</div><div class="pna" id="pna" style="color:${inc?'var(--gn)':'var(--tx)'}">${inc?'+':'-'}฿0.00</div><div class="pns">${E(o.sub)}</div><div class="pnf"><span>${E(o.l||'')}</span><b>${E(o.r||'')}</b></div><i class="pnb"></i></div>`;
 el.classList.remove('on');void el.offsetWidth;el.classList.add('on');
 const a=document.getElementById('pna'),t0=performance.now()+350,my=++pnR;(function s(t){if(my!=pnR)return;const k=Math.max(0,Math.min(1,(t-t0)/900));a.textContent=(inc?'+':'-')+money(o.amt*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(s)})(performance.now());
 if(inc&&typeof burst=='function')setTimeout(()=>burst(el.querySelector('.pni'),18,0,0),650);
 navigator.vibrate&&navigator.vibrate(inc?[18,40,18]:14);
 clearTimeout(pnT);pnT=setTimeout(hidePN,4600)}
(function(){const el=document.getElementById('pn');let y0=null,dy=0;
 el.addEventListener('pointerdown',e=>{y0=e.clientY;dy=0;el.style.transition='none'});
 addEventListener('pointermove',e=>{if(y0==null)return;dy=Math.min(0,e.clientY-y0);el.style.transform=`translate(-50%,${dy}px)`});
 addEventListener('pointerup',()=>{if(y0==null)return;const d=dy;y0=null;el.style.transition='';el.style.transform='';if(d<-30||Math.abs(d)<4)hidePN()});
 addEventListener('pointercancel',()=>{y0=null;el.style.transition='';el.style.transform=''})})();

/* ---------- แถบเลือก (segmented) ที่มีตัวเลื่อน ---------- */
function segFx(){document.querySelectorAll('.seg').forEach(sg=>{if(!sg.offsetParent)return;let t=sg.querySelector(':scope>.sgi');const on=sg.querySelector('button.on');
 if(!on){if(t)t.style.width='0';return}
 const put=()=>{t.style.width=on.offsetWidth+'px';t.style.transform=`translateX(${on.offsetLeft}px)`};
 if(!t){t=document.createElement('span');t.className='sgi';t.style.transition='none';sg.prepend(t);sg.classList.add('tk');put();t.offsetWidth;t.style.transition=''}else put()})}
let q=0;const sched=()=>{if(q)return;q=requestAnimationFrame(()=>{q=0;segFx()})};
new MutationObserver(sched).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});
document.addEventListener('click',()=>setTimeout(sched,0),true);addEventListener('resize',sched);sched();

/* ---------- ฟอร์มการเงินไหลเข้าทีละส่วน ---------- */
const fs=document.getElementById('fsh');if(fs){let was=false;new MutationObserver(()=>{const on=fs.classList.contains('on');if(on&&!was){fs.classList.add('casc');setTimeout(()=>fs.classList.remove('casc'),1000)}was=on}).observe(fs,{attributes:true,attributeFilter:['class']})}

/* ---------- แสงตามเมาส์บนการ์ด (คอม) ---------- */
document.addEventListener('pointermove',e=>{if(e.pointerType!='mouse')return;const c=e.target.closest&&e.target.closest('.cd');if(!c)return;const r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')},{passive:true});

window.payNotify=payNotify;window.hidePN=hidePN;
window.uiDemo=t=>payNotify(t=='i'?{type:'i',amt:30000,sub:'เงินเดือน · เงินเดือน · 09:00',l:'เดือนนี้ รับ 34.5k · จ่าย 5.8k',r:'คงเหลือ ฿28,745.50'}:{type:'e',amt:89,color:'#ff9500',sub:'ร้านกาแฟ · อาหาร · 08:45',l:'เดือนนี้ รับ 34.5k · จ่าย 5.8k',r:'คงเหลือ ฿28,656.50'});
})();
