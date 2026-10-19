/* ===== การเงิน: รายรับ-รายจ่าย (QR / สลิป / พิมพ์เอง) ===== */
/*PURE*/
const MTH=['มค','กพ','มีค','เมย','พค','มิย','กค','สค','กย','ตค','พย','ธค'],MEN=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
const BANKS={'002':'กรุงเทพ','004':'กสิกรไทย','006':'กรุงไทย','011':'ทหารไทยธนชาต','014':'ไทยพาณิชย์','017':'ซิตี้แบงก์','020':'สแตนดาร์ดชาร์เตอร์ด','022':'ซีไอเอ็มบี ไทย','024':'ยูโอบี','025':'กรุงศรีอยุธยา','030':'ออมสิน','033':'อาคารสงเคราะห์','034':'ธ.ก.ส.','066':'อิสลามแห่งประเทศไทย','067':'ทิสโก้','069':'เกียรตินาคินภัทร','070':'ไอซีบีซี (ไทย)','071':'ไทยเครดิต','073':'แลนด์ แอนด์ เฮ้าส์'};
const KWS={food:/อาหาร|ข้าว|ก๋วยเตี๋ยว|กาแฟ|cafe|coffee|starbucks|kfc|mcdonald|ชาบู|หมูกระทะ|grabfood|lineman|foodpanda|ร้านอาหาร|ขนม|เครื่องดื่ม/i,transport:/grab|bolt|taxi|แท็กซี่|bts|mrt|น้ำมัน|ptt|shell|ทางด่วน|easy ?pass|รถไฟ|รถเมล์/i,shop:/7-?eleven|เซเว่น|lotus|โลตัส|big ?c|tops|shopee|lazada|mall|ห้าง|makro|แมคโคร|ซุปเปอร์/i,bill:/ไฟฟ้า|ประปา|\bais\b|\btrue|dtac|internet|อินเทอร์เน็ต|ค่าเช่า|ประกัน|\bmea\b|\bpea\b|ค่าน้ำ|ค่าไฟ/i,health:/โรงพยาบาล|คลินิก|ร้านยา|hospital|pharmacy|boots|watsons|หมอ|ทันตก/i,fun:/netflix|spotify|youtube|เกม|steam|cinema|major|หนัง|คอนเสิร์ต/i};
function tlv(s){const o={};let i=0;while(i+4<=s.length){const t=s.substr(i,2),l=parseInt(s.substr(i+2,2),10);if(isNaN(l)||i+4+l>s.length)break;o[t]=s.substr(i+4,l);i+=4+l}return o}
function crc16(s){let c=0xFFFF;for(let i=0;i<s.length;i++){c^=s.charCodeAt(i)<<8;for(let j=0;j<8;j++)c=c&0x8000?((c<<1)^0x1021)&0xFFFF:(c<<1)&0xFFFF}return c.toString(16).toUpperCase().padStart(4,'0')}
function parseQR(raw){raw=(raw||'').trim();
 if(raw.startsWith('000201')){const t=tlv(raw),r={kind:'emv',amount:t['54']?parseFloat(t['54'])||0:0,name:t['59']||'',ok:raw.slice(-4).toUpperCase()==crc16(raw.slice(0,-4)),ref:'',payee:''};
  for(const k of Object.keys(t)){const n=+k;if(n>=26&&n<=51){const s=tlv(t[k]),aid=s['00']||'';if(aid.startsWith('A000000677')){const e=aid.slice(-2);
    if(e=='11'){const v=s['01']||s['02']||s['03']||'';r.payee=v.replace(/^0066/,'0')}else if(e=='12'){r.payee=s['01']||'';r.ref=s['02']||''}else if(!r.payee)r.payee=s['01']||''}else if(!r.payee&&s['01'])r.payee=s['01']}}
  const ad=t['62']?tlv(t['62']):{};if(ad['05'])r.ref=ad['05'];else if(ad['01']&&!r.ref)r.ref=ad['01'];return r}
 if(raw.startsWith('00')&&/5102TH/.test(raw)){const t=tlv(raw),s=tlv(t['00']||'');return{kind:'slip',bank:BANKS[s['01']]||s['01']||'',ref:s['02']||'',amount:0,name:'',ok:true}}
 return{kind:'other',text:raw,amount:0,name:'',ref:'',ok:true}}
function parseSlipText(text){
 const lines=(text||'').replace(/\u00a0/g,' ').split(/\n/).map(s=>s.replace(/\s+/g,' ').trim()).filter(Boolean),T=lines.join('\n'),p2=n=>String(n).padStart(2,'0');
 const NUM=/(\d{1,3}(?:[, ]\d{3})+|\d+)\.(\d{2})(?!\d)/g,nums=l=>{const o=[];let m;NUM.lastIndex=0;while((m=NUM.exec(l)))o.push(parseFloat(m[1].replace(/[, ]/g,'')+'.'+m[2]));return o};
 const KW=/(จำนวน|ยอด|amount|โอนเงิน|เงินโอน|total|thb|บาท)/i,FEE=/(ค่าธรรมเนียม|fee)/i;let amount=0;
 for(let i=0;i<lines.length&&!amount;i++){if(!KW.test(lines[i])||FEE.test(lines[i]))continue;const c=[...nums(lines[i]),...(lines[i+1]&&!FEE.test(lines[i+1])?nums(lines[i+1]):[])].filter(v=>v>0);if(c.length)amount=c[0]}
 if(!amount){const all=lines.filter(l=>!FEE.test(l)).flatMap(nums).filter(v=>v>0);if(all.length)amount=Math.max(...all)}
 let date='',y,mo,d,m=T.match(/(\d{1,2})\s*(ม\.?\s?ค|ก\.?\s?พ|มี\.?\s?ค|เม\.?\s?ย|พ\.?\s?ค|มิ\.?\s?ย|ก\.?\s?ค|ส\.?\s?ค|ก\.?\s?ย|ต\.?\s?ค|พ\.?\s?ย|ธ\.?\s?ค)\.?\s*(\d{2,4})/);
 if(m){d=+m[1];mo=MTH.indexOf(m[2].replace(/[.\s]/g,''))+1;y=+m[3];if(y<100)y+=2500;if(y>2400)y-=543}
 else if((m=T.match(/(\d{1,2})\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?,?\s*(\d{2,4})/i))){d=+m[1];mo=MEN.indexOf(m[2].toLowerCase())+1;y=+m[3];if(y<100)y+=2000;if(y>2400)y-=543}
 else if((m=T.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/))){d=+m[1];mo=+m[2];y=+m[3];if(y<100)y+=2500;if(y>2400)y-=543}
 if(d>=1&&d<=31&&mo>=1&&mo<=12&&y>=2000&&y<=2100)date=y+'-'+p2(mo)+'-'+p2(d);
 const tm=T.match(/(\d{1,2}):(\d{2})/),time=tm&&+tm[1]<24&&+tm[2]<60?p2(tm[1])+':'+tm[2]:'';
 let name='';for(let i=0;i<lines.length;i++){const q=lines[i].match(/^(?:(?:ไปยัง|ผู้รับ|โอนให้)|to\b)\s*[:：]?\s*(.*)$/i);if(q){name=(q[1]||lines[i+1]||'').replace(/[xX\d\-\*]{4,}.*/,'').trim();if(name)break}}
 return{amount,date,time,name,type:/(เงินเข้า|รับเงินจาก|received)/i.test(T)?'i':'e'}}
function guessCat(text,cats){for(const id of Object.keys(KWS)){if(KWS[id].test(text)&&cats.some(c=>c.id==id))return id}return ''}
/*ENDPURE*/

(function(){
const SH=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const DEFC=[{id:'food',n:'อาหาร',c:'#ff9500',i:'food',t:'e'},{id:'transport',n:'เดินทาง',c:'#007aff',i:'train',t:'e'},{id:'shop',n:'ช้อปปิ้ง',c:'#ff2d55',i:'bag',t:'e'},{id:'bill',n:'บิล/ค่าบริการ',c:'#6355f5',i:'doc',t:'e'},{id:'health',n:'สุขภาพ',c:'#34c759',i:'pill',t:'e'},{id:'fun',n:'บันเทิง',c:'#cc33e0',i:'music',t:'e'},{id:'eo',n:'อื่นๆ',c:'#8e8e93',i:'list',t:'e'},
 {id:'salary',n:'เงินเดือน',c:'#34c759',i:'briefcase',t:'i'},{id:'extra',n:'รายได้เสริม',c:'#00c3d0',i:'star',t:'i'},{id:'io',n:'อื่นๆ',c:'#8e8e93',i:'gift',t:'i'}];
if(!Array.isArray(S.fin))S.fin=[];if(!Array.isArray(S.fc)||!S.fc.length)S.fc=DEFC.map(x=>({...x}));
let FM=S.fm||'m',FC=S.fcm||'cum',FD=new Date(new Date().getFullYear(),new Date().getMonth(),1),FT='*',F2={t:'e',c:'',src:'manual',ref:''},EID=null,LIM=60,LK='',ANI=false,LCD=null,NEWF=null,det=null,qrOn=false,qrStream=null,lastQ=0;
const THB=n=>(n<0?'-':'')+'฿'+Math.abs(n).toLocaleString('th-TH',{minimumFractionDigits:2,maximumFractionDigits:2});
const short=n=>n>=1e6?(n/1e6).toFixed(1).replace(/\.0$/,'')+'M':n>=1e3?(n/1e3).toFixed(n>=1e4?0:1).replace(/\.0$/,'')+'k':String(Math.round(n));
const fcat=id=>S.fc.find(x=>x.id==id)||{n:'อื่นๆ',c:'#8e8e93',i:'list',t:'e'};
const rng=(d,m)=>{const y=d.getFullYear(),o=d.getMonth();return m=='m'?[ymd(new Date(y,o,1)),ymd(new Date(y,o+1,0))]:[y+'-01-01',y+'-12-31']};
const inR=(a,b)=>S.fin.filter(x=>x.date>=a&&x.date<=b),sumT=(L,t)=>L.filter(x=>x.type==t).reduce((s,x)=>s+x.amt,0);
const nice=m=>{const e=Math.pow(10,Math.floor(Math.log10(m))),f=m/e;return(f<=1?1:f<=2?2:f<=5?5:10)*e};
const LS={};const loadScript=u=>LS[u]||(LS[u]=new Promise((ok,no)=>{const s=document.createElement('script');s.src=u;s.onload=ok;s.onerror=()=>{delete LS[u];no(new Error('โหลดไม่สำเร็จ (ต้องต่ออินเทอร์เน็ต)'))};document.head.appendChild(s)}));
const TES='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js',JSQ='https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';

/* ---------- สไตล์ / DOM ---------- */
const st=document.createElement('style');st.textContent=`
.seg[hidden]{display:none}.fbal{font-size:34px;font-weight:700;letter-spacing:-.02em;font-variant-numeric:tabular-nums}.fi{color:var(--gn)}.fe{color:var(--rd)}
.f2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}.f2 .cd{margin:0}.f2 .big{font-size:19px;font-variant-numeric:tabular-nums}.f2 small{font-size:12px}
.ftip{font-size:13px;color:var(--mu);margin:2px 0 8px;min-height:20px}.xl2{display:flex;margin:8px 0 0 26px}.xl2 span{flex:1;text-align:center;font-size:10.5px;color:var(--mu);white-space:nowrap}
.many .pt{display:none}.many .cc2.sel .pt{display:block}.cc2 .pt{border-width:2.5px}
.dnut{display:flex;gap:20px;align-items:center;flex-wrap:wrap}.dnw{position:relative;width:132px;height:132px;flex:none}.dnw svg{width:132px;height:132px;transform:rotate(-90deg)}.dnw circle{fill:none;stroke-width:16;transition:stroke-dasharray 1s cubic-bezier(.2,.9,.25,1)}
@media(max-width:560px){.dnut{flex-direction:column;align-items:stretch}.dnw{margin:0 auto}.dnl{min-width:0;width:100%}}
.fb>div em{white-space:nowrap;margin-left:8px}
.dnc{position:absolute;inset:0;display:grid;place-items:center;text-align:center;font-size:11.5px;color:var(--mu)}.dnc b{display:block;font-size:19px;color:var(--tx);font-variant-numeric:tabular-nums}.dnl{flex:1;min-width:160px}
.dgh{display:flex;justify-content:space-between;font-size:12.5px;color:var(--mu);margin:18px 4px 8px}.tx{display:flex;align-items:center;gap:12px;padding:12px 14px;margin-bottom:8px;cursor:pointer}.tx .x{flex:1;min-width:0}.tx b{font-variant-numeric:tabular-nums;font-size:15px;white-space:nowrap}
.amtw{display:flex;align-items:center;justify-content:center;gap:2px;font-size:36px;font-weight:700;transition:color .3s}.amtw.i{color:var(--gn)}.amtw input{background:none!important;text-align:center;font-size:40px!important;width:68%;padding:4px!important;color:inherit;font-weight:700}.amtw{position:relative;isolation:isolate}.amtw:after{content:'';position:absolute;inset:0;border-radius:22px;background:linear-gradient(110deg,transparent 20%,color-mix(in srgb,currentColor 9%,transparent) 48%,transparent 75%);transform:translateX(-120%);pointer-events:none;z-index:-1}.amtw.i:after{animation:payshine .9s cubic-bezier(.2,.8,.2,1)}@keyframes payshine{to{transform:translateX(120%)}}.sheet h3{letter-spacing:-.025em}.sheet.sheet-enter{animation:sheetenter .48s cubic-bezier(.2,.9,.25,1)}@keyframes sheetenter{0%{filter:brightness(.88)}55%{filter:brightness(1.04)}100%{filter:brightness(1)}}.sheet .btn.big{transition:transform .25s cubic-bezier(.2,.9,.25,1),filter .25s}.sheet .btn.big:active{transform:scale(.98)}.sheet .ch{transition:transform .25s cubic-bezier(.2,.9,.25,1),background .25s,border-color .25s}.sheet .ch:active{transform:scale(.96)}.sheet .ch.on{animation:catpop .28s cubic-bezier(.2,1.5,.4,1)}@keyframes catpop{50%{transform:scale(1.035)}}
.src2{display:grid;grid-template-columns:1fr 1fr;gap:10px}.src2 .btn{display:flex;gap:8px;align-items:center;justify-content:center;border-radius:14px;padding:12px;font-size:14px}
.ocrs{background:var(--fill);border-radius:14px;padding:10px 12px;font-size:13px;color:var(--mu);animation:sd .4s}.ocrs[hidden]{display:none}.ocrs.bad{color:var(--rd)}.ocrs u{display:block;height:4px;border-radius:4px;background:var(--ln);margin-top:8px;overflow:hidden;text-decoration:none}.ocrs s{display:block;height:100%;background:var(--ac);transition:width .3s}
.ocrs summary{cursor:pointer;margin-top:6px}.ocrs pre{white-space:pre-wrap;font:inherit;font-size:12px;margin-top:6px;max-height:140px;overflow:auto;-webkit-user-select:text;user-select:text}
.qrw{position:fixed;inset:0;z-index:25;background:#000;display:none}.qrw.on{display:block;animation:vin .4s}.qrw video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.qfr{position:absolute;left:50%;top:50%;width:min(66vw,280px);aspect-ratio:1;transform:translate(-50%,-50%);border-radius:24px;box-shadow:0 0 0 100vmax rgba(0,0,0,.55)}.qfr i{position:absolute;width:34px;height:34px;border:4px solid #fff}
.qfr i:nth-child(1){left:0;top:0;border-right:0;border-bottom:0;border-radius:24px 0 0 0}.qfr i:nth-child(2){right:0;top:0;border-left:0;border-bottom:0;border-radius:0 24px 0 0}.qfr i:nth-child(3){left:0;bottom:0;border-right:0;border-top:0;border-radius:0 0 0 24px}.qfr i:nth-child(4){right:0;bottom:0;border-left:0;border-top:0;border-radius:0 0 24px 0}
.qln{position:absolute;left:8%;right:8%;height:3px;border-radius:3px;background:linear-gradient(90deg,transparent,#34c759,transparent);animation:qs 2s ease-in-out infinite}@keyframes qs{0%,100%{top:8%}50%{top:92%}}
.qtop{position:absolute;left:0;right:0;top:0;display:flex;justify-content:space-between;padding:calc(env(safe-area-inset-top) + 14px) 16px}.qtop .rnd{background:rgba(255,255,255,.18);color:#fff;border-color:rgba(255,255,255,.3);backdrop-filter:blur(10px)}
.qmsg{position:absolute;left:16px;right:16px;bottom:calc(env(safe-area-inset-bottom) + 40px);text-align:center;color:#fff;font-size:14px}
`;document.head.appendChild(st);
document.querySelector('svg defs').insertAdjacentHTML('beforeend','<symbol id="i-qr" viewBox="0 0 24 24"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z"/></symbol><symbol id="i-img" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.5"/><path d="M21 16l-5-5-8 8"/></symbol>');
document.body.insertAdjacentHTML('beforeend',`
<div class="ov" id="fov" onclick="closeFin()"></div>
<div class="sheet" id="fsh"><div class="gr"></div><h3 id="fht">บันทึกรายการ</h3>
 <div class="seg" id="fty"><button data-v="e" onclick="finT2('e')">รายจ่าย</button><button data-v="i" onclick="finT2('i')">รายรับ</button></div>
 <div class="amtw e" id="famt"><span>฿</span><input id="fa" type="text" inputmode="decimal" placeholder="0.00" autocomplete="off"></div>
 <div class="src2"><button class="btn g" onclick="openQR()"><svg class="i"><use href="#i-qr"/></svg>สแกน QR</button><button class="btn g" onclick="document.querySelector('#fslip').click()"><svg class="i"><use href="#i-img"/></svg>อัปโหลดสลิป</button></div>
 <input type="file" id="fslip" accept="image/*" hidden onchange="slipFile(this.files[0]);this.value=''">
 <div class="ocrs" id="ocrs" hidden></div>
 <div class="lb">หมวดหมู่</div><div class="chs" id="fcs" style="margin:0;padding:0"></div>
 <div class="two"><div class="tf"><div class="lb">วันที่</div><input type="date" id="fd"></div><div class="tf"><div class="lb">เวลา</div><input type="time" id="ft"></div></div>
 <div class="lb">บันทึกช่วยจำ</div><input type="text" id="fn" placeholder="เช่น ค่าอาหารกลางวัน" maxlength="80">
 <button class="btn big" id="fsv" onclick="saveFin()">บันทึก</button><button class="btn r" id="fdl" onclick="delFin()" hidden>ลบรายการ</button></div>
<div class="qrw" id="qrw"><video id="qv" playsinline muted></video><div class="qfr"><i></i><i></i><i></i><i></i><b class="qln"></b></div>
 <div class="qtop"><button class="rnd" onclick="closeQR()">ปิด</button><button class="rnd" onclick="document.querySelector('#fqr').click()"><svg class="i"><use href="#i-img"/></svg>เลือกรูป QR</button></div>
 <div class="qmsg" id="qmsg">จัดให้ QR อยู่ในกรอบ</div><input type="file" id="fqr" accept="image/*" hidden onchange="qrFile(this.files[0]);this.value=''"></div>`);

/* ---------- วาดกราฟ ---------- */
function lc(labels,series,tl){const n=labels.length,mx=nice(Math.max(1,...series.flatMap(s=>s.v.filter(x=>x!=null)))),X=i=>(i+.5)/n*100,Y=v=>92-v/mx*84,P=v=>v.map((y,i)=>({x:X(i),y:Y(y)})),bt=v=>8+v/mx*84;LCD={v:series.map(s=>s.v),tl};
 const defs=series.map((s,k)=>`<linearGradient id="gf${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:${s.col};stop-opacity:.2"/><stop offset="1" style="stop-color:${s.col};stop-opacity:0"/></linearGradient>`).join('');
 const paths=series.map((s,k)=>{const m=s.v.filter(x=>x!=null).length;if(m<1)return'';const p=P(s.v.slice(0,m)),d=sm(p);return`<path style="fill:url(#gf${k});stroke:none" d="${d}L${p[m-1].x},${Y(0)}L${p[0].x},${Y(0)}Z"/><path style="stroke:${s.col};stroke-width:2.2" d="${d}"/>`}).join('');
 return`<div class="chart ${ANI?'ani':''} ${n>12?'many':''}" id="flc"><div class="plot"><div class="gl"><span style="top:8%"><u>${short(mx)}</u></span><span style="top:50%"><u>${short(mx/2)}</u></span><span style="bottom:8%;border-top-style:solid"><u>0</u></span></div><svg class="ln" viewBox="0 0 100 100" preserveAspectRatio="none"><defs>${defs}</defs>${paths}</svg><div class="cols">${labels.map((l,i)=>`<div class="cc2" onclick="finTip(${i})">${series.map(s=>s.v[i]==null?'':`<b class="pt" style="bottom:${bt(s.v[i])}%;border-color:${s.col}"></b>`).join('')}</div>`).join('')}</div></div><div class="xl2">${labels.map((l,i)=>`<span>${n>12&&i%5!=0&&i!=n-1?'':l}</span>`).join('')}</div></div>`}
function donut(items,total,T){const R=46,C=2*Math.PI*R;let off=0;
 const seg=items.map(([id,v])=>{const f=fcat(id),len=total?v/total*C:0,g=items.length>1?Math.min(2,len*.3):0,s=`<circle cx="66" cy="66" r="${R}" stroke="${f.c}" data-da="${Math.max(0,len-g)} ${C}" style="stroke-dasharray:${ANI?0:Math.max(0,len-g)} ${C};stroke-dashoffset:${-off}"/>`;off+=len;return s}).join('');
 return`<div class="dnw"><svg viewBox="0 0 132 132"><circle cx="66" cy="66" r="${R}" stroke="var(--fill)"/>${seg}</svg><div class="dnc"><div><b>${short(total)}</b>${T=='i'?'รวมรับ':'รวมจ่าย'}</div></div></div>`}
function cnt(el,to){const t0=performance.now();(function s(t){const k=Math.min(1,(t-t0)/800);el.textContent=THB(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(s)})(t0)}

/* ---------- หน้า "การเงิน" ---------- */
function finView(f){const[a,b]=rng(FD,FM),L=inR(a,b),inc=sumT(L,'i'),exp=sumT(L,'e'),net=inc-exp,y=FD.getFullYear(),o=FD.getMonth(),M=FM=='m',
 [pa,pb]=rng(M?new Date(y,o-1,1):new Date(y-1,0,1),FM),P=inR(pa,pb),pi=sumT(P,'i'),pe=sumT(P,'e'),inC=f?'':'in',T=FT=='i'?'i':'e',key=FM+a+T+FC;
 ANI=f||key!==LK;LK=key;
 const dl=(v,p,good)=>p>0?`<small style="color:${(v>=p)==good?'var(--gn)':'var(--rd)'}">${v>=p?'+':''}${Math.round((v-p)/p*100)}% จาก${M?'เดือน':'ปี'}ก่อน</small>`:'<small class="mu">ยังไม่มีข้อมูลช่วงก่อน</small>';
 const n=M?new Date(y,o+1,0).getDate():12,vi=Array(n).fill(0),ve=Array(n).fill(0);L.forEach(x=>{(x.type=='i'?vi:ve)[M?+x.date.slice(8)-1:+x.date.slice(5,7)-1]+=x.amt});
 const labels=M?[...Array(n)].map((_,i)=>i+1):SH,tl=i=>M?(i+1)+' '+SH[o]:SH[i]+' '+(y+543),now=new Date(),
  per=M?(y==now.getFullYear()&&o==now.getMonth()?now.getDate():n):(y==now.getFullYear()?now.getMonth()+1:12),
  bc={};L.filter(x=>x.type==T).forEach(x=>bc[x.cat]=(bc[x.cat]||0)+x.amt);const R=Object.entries(bc).sort((p,q)=>q[1]-p[1]),tot=R.reduce((s,r)=>s+r[1],0);
 const cut=M?(y==now.getFullYear()&&o==now.getMonth()?now.getDate():n):(y==now.getFullYear()?now.getMonth()+1:n),cumA=a=>{let s=0;return a.map((v,i)=>i<cut?(s+=v):null)},vi2=FC=='cum'?cumA(vi):vi,ve2=FC=='cum'?cumA(ve):ve;
 const rows=R.map(([id,v])=>{const c=fcat(id),pc=Math.round(v/tot*100);return`<div class="fr"><span class="ib" style="background:${c.c}">${ic('c-'+c.i)}</span><div class="fb"><div><span>${esc(c.n)}</span><em>${THB(v)} · ${pc}%</em></div><u><s data-w="${pc}%" style="width:${ANI?0:pc+'%'}"></s></u></div></div>`}).join('');
 const I=L.filter(x=>FT=='*'||x.type==FT).sort((p,q)=>(q.date+(q.time||'')).localeCompare(p.date+(p.time||''))),sh=I.slice(0,LIM);let list='',ld='';
 sh.forEach((x,i)=>{if(x.date!=ld){ld=x.date;const dn=L.filter(q=>q.date==ld).reduce((s,q)=>s+(q.type=='i'?q.amt:-q.amt),0);list+=`<div class="dgh"><span>${pd(ld).toLocaleDateString('th-TH',{weekday:'long',day:'numeric',month:'short'})}</span><span>${dn>=0?'+':''}${THB(dn)}</span></div>`}
  const c=fcat(x.cat);list+=`<div class="tx cd rv ${inC} ${x.id==NEWF?'new':''}" style="${f?`transition-delay:${Math.min(i,8)*40}ms`:''}" onclick="openFin('${x.id}')"><span class="ib" style="background:${c.c}">${ic('c-'+c.i)}</span><div class="x"><div>${esc(x.note||c.n)}</div><small><span>${esc(c.n)}</span>${x.time?`<span>${ic('clock','sm')}${x.time}</span>`:''}${x.src&&x.src!='manual'?`<span>${ic(x.src=='qr'?'qr':'img','sm')}${x.src=='qr'?'QR':'สลิป'}</span>`:''}</small></div><b class="${x.type=='i'?'fi':''}">${x.type=='i'?'+':'-'}${THB(x.amt)}</b></div>`});
 if(I.length>LIM)list+=`<button class="btn g" style="width:100%;margin-top:6px" onclick="finMore()">แสดงเพิ่ม (${I.length-LIM})</button>`;
 if(!I.length)list=`<div class="empty">${ic('c-card','lg')}<div>ยังไม่มีรายการในช่วงนี้<br>กดปุ่ม + เพื่อบันทึกรายการแรก</div></div>`;
 const top=R[0]?`<div class="mu" style="font-size:13px;margin-bottom:10px">${T=='i'?'รายรับ':'รายจ่าย'}มากสุด: <b style="color:var(--tx)">${esc(fcat(R[0][0]).n)}</b> ${Math.round(R[0][1]/tot*100)}%</div>`:'';
 $('#v-fin').innerHTML=`<div class="hd"><small>รายรับ · รายจ่าย</small><h1>การเงิน</h1></div>
<div class="seg" style="margin-bottom:12px" id="fmseg"><button data-v="m" class="${M?'on':''}" onclick="finM('m')">รายเดือน</button><button data-v="y" class="${M?'':'on'}" onclick="finM('y')">รายปี</button></div>
<div class="mh"><button onclick="finNav(-1)" aria-label="ก่อนหน้า">${ic('l')}</button><b>${M?MN[o]+' '+(y+543):'ปี '+(y+543)}</b><button onclick="finNav(1)" aria-label="ถัดไป">${ic('r')}</button></div>
<div class="cd rv ${inC}"><small class="mu">คงเหลือสุทธิ</small><div class="fbal ${net<0?'fe':''}" id="fbal">${THB(net)}</div></div>
<div class="f2"><div class="cd rv ${inC}"><small class="mu">รายรับ</small><div class="big fi">${THB(inc)}</div>${dl(inc,pi,true)}</div><div class="cd rv ${inC}"><small class="mu">รายจ่าย</small><div class="big fe">${THB(exp)}</div>${dl(exp,pe,false)}<small class="mu" style="display:block">เฉลี่ย ${THB(exp/per)}/${M?'วัน':'เดือน'}</small></div></div>
<div class="cd rv ${inC}"><div class="wh"><div><small>${FC=='cum'?'ยอดสะสม':'แนวโน้ม'}${M?'ในเดือน':'ในปี'}</small></div><div class="lg" style="margin:0"><span><i style="background:var(--gn)"></i>รายรับ</span><span><i style="background:var(--rd)"></i>รายจ่าย</span></div></div><div class="seg sm"><button class="${FC=='cum'?'on':''}" onclick="finC('cum')">สะสม</button><button class="${FC=='per'?'on':''}" onclick="finC('per')">${M?'รายวัน':'รายเดือน'}</button></div><div class="ftip" id="ftip">แตะที่กราฟเพื่อดูแต่ละ${M?'วัน':'เดือน'}</div>${lc(labels,[{v:ve2,col:'var(--rd)'},{v:vi2,col:'var(--gn)'}],tl)}</div>
<div class="cd rv ${inC}"><div class="wh"><div><small>สัดส่วน${T=='i'?'รายรับ':'รายจ่าย'}ตามหมวด</small></div></div>${top}${tot?`<div class="dnut">${donut(R,tot,T)}<div class="dnl">${rows}</div></div>`:'<div class="mu" style="font-size:13px">ยังไม่มีข้อมูล</div>'}</div>
<h2>รายการ</h2><div class="seg" id="ftseg" style="margin-bottom:6px"><button data-v="*" class="${FT=='*'?'on':''}" onclick="finTy('*')">ทั้งหมด</button><button data-v="e" class="${FT=='e'?'on':''}" onclick="finTy('e')">รายจ่าย</button><button data-v="i" class="${FT=='i'?'on':''}" onclick="finTy('i')">รายรับ</button></div><div id="flist">${list}</div>`;
 if(ANI)cnt($('#fbal'),net);
 requestAnimationFrame(()=>requestAnimationFrame(()=>{$$('#v-fin circle[data-da]').forEach(c=>c.style.strokeDasharray=c.dataset.da);$$('#v-fin .fb s').forEach(s=>s.style.width=s.dataset.w)}));obs()}
const nv=v=>v==null?'–':THB(v);
function finTip(i){const d=LCD;if(!d)return;$$('#flc .cc2').forEach((c,j)=>c.classList.toggle('sel',j==i));$('#ftip').innerHTML=`<b style="color:var(--tx)">${FC=='cum'?'สะสมถึง ':''}${d.tl(i)}</b> · <span class="fi">รับ ${nv(d.v[1][i])}</span> · <span class="fe">จ่าย ${nv(d.v[0][i])}</span>`}
function finM(m){FM=m;S.fm=m;save();if(m=='m'&&FD.getFullYear()==new Date().getFullYear())FD=new Date(FD.getFullYear(),new Date().getMonth(),1);if(m=='y')FD=new Date(FD.getFullYear(),0,1);LIM=60;finRender()}
function finNav(n){FD=FM=='m'?new Date(FD.getFullYear(),FD.getMonth()+n,1):new Date(FD.getFullYear()+n,0,1);LIM=60;finRender()}
function finC(c){FC=c;S.fcm=c;save();finRender()}
function finTy(t){FT=t;LIM=60;finRender()}
function finMore(){LIM+=60;finRender()}

/* ---------- ฟอร์มบันทึก ---------- */
const first=t=>(S.fc.find(c=>c.t==t)||{}).id||'';
function finT2(t,keep){F2.t=t;if(!keep||!S.fc.some(c=>c.id==F2.c&&c.t==t))F2.c=first(t);$$('#fty button').forEach(b=>b.classList.toggle('on',b.dataset.v==t));$('#famt').className='amtw '+t;
 $('#fn').placeholder=t=='i'?'เช่น เงินเดือน งานเสริม หรือขายของ':'เช่น ค่าอาหารกลางวัน ค่าเดินทาง';$('#fsv').innerHTML=t=='i'?'รับเงินเข้า':'บันทึกรายจ่าย';$('#fht').textContent=EID?'แก้ไขรายการ':(t=='i'?'บันทึกรายรับ':'บันทึกรายจ่าย');$('#fcs').innerHTML=S.fc.filter(c=>`<button class="ch ${F2.c==c.id?'on':''}" onclick="finCat('${c.id}')"><span style="color:${c.c};display:flex">${ic('c-'+c.i,'sm')}</span>${esc(c.n)}</button>`).join('')+`<button class="ch add" onclick="window.FNT='${t}';openCE(null,'f')">${ic('plus','sm')}เพิ่ม</button>`}
const finCat=id=>{F2.c=id;finT2(F2.t,true)};
function finPick(id,t){if($('#fsh').classList.contains('on')){F2.c=id;finT2(t,true)}}
function setOcr(h,bad,p){const e=$('#ocrs');e.hidden=false;e.className='ocrs'+(bad?' bad':'');e.innerHTML=h+(p!=null?`<u><s style="width:${Math.round(p*100)}%"></s></u>`:'')}
function openFin(id){const x=id&&S.fin.find(q=>q.id==id);EID=x?x.id:null;F2={t:x?x.type:'e',c:x?x.cat:'',src:x?x.src||'manual':'manual',ref:x?x.ref||'':''};
 $('#fa').value=x?x.amt:'';$('#fd').value=x?x.date:ymd(new Date());$('#ft').value=x?x.time||'':nowT();$('#fn').value=x?x.note||'':'';$('#fht').textContent=x?'แก้ไขรายการ':'บันทึกรายการ';$('#fdl').hidden=!x;$('#ocrs').hidden=true;
 finT2(F2.t,true);$('#fov').classList.add('on');$('#fsh').classList.add('on');$('#fsh').classList.remove('sheet-enter');void $('#fsh').offsetWidth;$('#fsh').classList.add('sheet-enter');if(!x)setTimeout(()=>$('#fa').focus(),420)}
function closeFin(){$('#fov').classList.remove('on');$('#fsh').classList.remove('on')}
function saveFin(){const amt=parseFloat(($('#fa').value||'').replace(/,/g,''));if(!(amt>0)){const e=$('#famt');e.classList.remove('shake');e.offsetWidth;e.classList.add('shake');$('#fa').focus();return}
 const o={type:F2.t,amt:Math.round(amt*100)/100,cat:F2.c||first(F2.t),date:$('#fd').value||ymd(new Date()),time:$('#ft').value,note:$('#fn').value.trim(),src:F2.src,ref:F2.ref};
 if(!EID&&o.ref&&S.fin.some(x=>x.ref==o.ref)&&!confirm('มีรายการที่ใช้สลิป/QR นี้แล้ว บันทึกซ้ำไหม?'))return;
 if(EID)Object.assign(S.fin.find(x=>x.id==EID),o);else{EID='f'+Date.now().toString(36);S.fin.push({id:EID,...o})}
 NEWF=EID;const d=pd(o.date);FD=FM=='m'?new Date(d.getFullYear(),d.getMonth(),1):new Date(d.getFullYear(),0,1);save();closeFin();finRender();setTimeout(()=>NEWF=null,2200);toast('บันทึก '+(o.type=='i'?'รายรับ ':'รายจ่าย ')+THB(o.amt)+' แล้ว')}
function delFin(){const i=S.fin.findIndex(x=>x.id==EID),x=S.fin[i];if(!x||!confirm('ลบรายการนี้?'))return;S.fin.splice(i,1);save();closeFin();finRender();toast('ลบรายการแล้ว',()=>{S.fin.splice(Math.min(i,S.fin.length),0,x);save();finRender()})}
window.finSaveCat=function(){const n=E.n.trim();if(!n){$('#cn').focus();return}
 if(E.id)Object.assign(S.fc.find(x=>x.id==E.id),{n,c:E.c,i:E.i});else{const id='f'+Date.now().toString(36);S.fc.push({id,n,c:E.c,i:E.i,t:E.t||'e'});finPick(id,E.t||'e')}save();closeCE();finRender()};
window.finDelCat=function(){const L=S.fc.filter(x=>x.t==E.t);if(L.length<2||!confirm('ลบหมวดนี้? รายการในหมวดนี้จะย้ายไปหมวดอื่น'))return;const fb=L.find(x=>x.id!=E.id).id;S.fin.forEach(x=>{if(x.cat==E.id)x.cat=fb});S.fc=S.fc.filter(x=>x.id!=E.id);save();closeCE();finRender();if($('#fsh').classList.contains('on'))finT2(F2.t)};

/* ---------- สแกน QR ---------- */
async function decodeBitmap(bmp){if('BarcodeDetector' in window){try{const r=await new BarcodeDetector({formats:['qr_code']}).detect(bmp);if(r.length)return r[0].rawValue}catch(e){}}
 try{await loadScript(JSQ);const w=bmp.width||bmp.videoWidth,h=bmp.height||bmp.videoHeight,k=Math.min(1,1280/Math.max(w,h)),c=document.createElement('canvas');c.width=Math.round(w*k);c.height=Math.round(h*k);const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(bmp,0,0,c.width,c.height);
  const d=x.getImageData(0,0,c.width,c.height),r=jsQR(d.data,c.width,c.height,{inversionAttempts:'attemptBoth'});return r?r.data:''}catch(e){return ''}}
async function openQR(){$('#qrw').classList.add('on');$('#qmsg').textContent='จัดให้ QR อยู่ในกรอบ';qrOn=true;
 try{qrStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});const v=$('#qv');v.srcObject=qrStream;await v.play();if('BarcodeDetector' in window)det=new BarcodeDetector({formats:['qr_code']});else await loadScript(JSQ);loop()}
 catch(e){$('#qmsg').textContent='เปิดกล้องไม่ได้ (ต้องเปิดผ่าน HTTPS และอนุญาตกล้อง) — กด “เลือกรูป QR” แทนได้'}}
function loop(){if(!qrOn)return;const now=performance.now();if(now-lastQ<140)return requestAnimationFrame(loop);lastQ=now;const v=$('#qv');if(!v.videoWidth)return requestAnimationFrame(loop);
 decodeBitmap(v).then(r=>{if(r)qrFound(r);else requestAnimationFrame(loop)})}
function closeQR(){qrOn=false;if(qrStream){qrStream.getTracks().forEach(t=>t.stop());qrStream=null}$('#qv').srcObject=null;$('#qrw').classList.remove('on')}
function qrFound(raw){closeQR();navigator.vibrate&&navigator.vibrate(20);applyQR(raw)}
async function qrFile(file){if(!file)return;try{const r=await decodeBitmap(await createImageBitmap(file));if(r){closeQR();applyQR(r)}else $('#qmsg').textContent='ไม่พบ QR ในรูปนี้ ลองรูปที่ชัดและเห็น QR เต็มกรอบ'}catch(e){$('#qmsg').textContent='เปิดรูปนี้ไม่ได้'}}
function applyQR(raw){const r=parseQR(raw);F2.src='qr';
 if(r.kind=='emv'){finT2('e');F2.ref=r.ref||'';if(r.amount>0)$('#fa').value=r.amount;const nm=(r.name||r.payee||'').trim();if(nm)$('#fn').value='จ่ายให้ '+nm;const g=guessCat((nm+' '+raw),S.fc.filter(c=>c.t=='e'));if(g){F2.c=g;finT2('e',true)}
  setOcr('อ่าน QR พร้อมเพย์แล้ว: <b style="color:var(--tx)">'+esc(nm||'ไม่ระบุชื่อ')+'</b> '+(r.amount>0?THB(r.amount):'(QR นี้ไม่ระบุยอด กรุณาใส่ยอดเอง)')+(r.ok?'':' — checksum ไม่ตรง ตรวจสอบอีกครั้ง'),!r.ok);if(!(r.amount>0))setTimeout(()=>$('#fa').focus(),200)}
 else if(r.kind=='slip'){F2.src='slip';F2.ref=r.ref;setOcr('พบ QR บนสลิป'+(r.bank?' (ธนาคาร'+esc(r.bank)+')':'')+' ใช้ตรวจกับธนาคารเท่านั้น <b>ไม่มียอดเงิน</b> — กด “อัปโหลดสลิป” เพื่ออ่านยอดจากรูป หรือพิมพ์เอง')}
 else{setOcr('QR นี้ไม่ใช่ QR ชำระเงิน: '+esc((r.text||'').slice(0,80)),1)}}

/* ---------- อ่านสลิป (OCR) ---------- */
async function toCanvas(file,max){const b=await createImageBitmap(file),k=Math.min(1,max/Math.max(b.width,b.height)),c=document.createElement('canvas');c.width=Math.round(b.width*k);c.height=Math.round(b.height*k);const x=c.getContext('2d');x.filter='grayscale(1) contrast(1.3)';x.drawImage(b,0,0,c.width,c.height);return{c,b}}
async function slipFile(file){if(!file)return;
 try{setOcr('กำลังเตรียมรูป…',0,.03);const{c,b}=await toCanvas(file,1800);let ref='';
  try{const q=parseQR(await decodeBitmap(b));if(q.kind=='slip')ref=q.ref}catch(e){}
  setOcr('กำลังโหลดตัวอ่านสลิป (ครั้งแรกต้องใช้อินเทอร์เน็ตและใช้เวลาสักครู่)…',0,.08);await loadScript(TES);
  const lab={'loading tesseract core':'โหลดตัวอ่าน','initializing tesseract':'เตรียมตัวอ่าน','loading language traineddata':'โหลดข้อมูลภาษาไทย','initializing api':'เตรียมระบบ','recognizing text':'กำลังอ่านข้อความ'};
  const w=await Tesseract.createWorker(['tha','eng'],1,{logger:m=>{if(m.status)setOcr((lab[m.status]||m.status)+'…',0,.1+.9*(m.progress||0))}});
  const{data}=await w.recognize(c);await w.terminate();const p=parseSlipText(data.text);
  finT2(p.type);F2.src='slip';F2.ref=ref;if(p.amount)$('#fa').value=p.amount;if(p.date)$('#fd').value=p.date;if(p.time)$('#ft').value=p.time;
  if(p.name)$('#fn').value=(p.type=='i'?'รับจาก ':'โอนให้ ')+p.name;const g=guessCat(data.text,S.fc.filter(x=>x.t==p.type));if(g){F2.c=g;finT2(p.type,true)}
  const dup=ref&&S.fin.some(x=>x.ref==ref);
  setOcr((dup?'<b style="color:var(--rd)">สลิปนี้เคยบันทึกแล้ว</b><br>':'')+'อ่านสลิปแล้ว: <b style="color:var(--tx)">'+(p.amount?THB(p.amount):'ไม่พบยอด')+'</b> '+(p.date||'')+' — ตรวจความถูกต้องก่อนบันทึก<details><summary>ข้อความที่อ่านได้</summary><pre>'+esc(data.text||'')+'</pre></details>',dup&&0)}
 catch(e){setOcr('อ่านสลิปไม่สำเร็จ: '+esc(e.message||'')+' — พิมพ์ยอดเองได้',1)}}

/* ---------- การ์ดหน้าแรก / ตั้งค่า ---------- */
function finHome(){let e=$('#fhome');if(!e){const c=$('#v-home .col');if(!c)return;e=document.createElement('div');e.id='fhome';e.className='cd rv';e.style.cursor='pointer';e.onclick=()=>document.querySelectorAll('#nav button')[2].click();c.appendChild(e)}
 const[a,b]=rng(new Date(),'m'),L=inR(a,b),inc=sumT(L,'i'),exp=sumT(L,'e'),r=inc>0?Math.min(100,exp/inc*100):exp>0?100:0;
 e.innerHTML=`<div class="wh"><div><small>การเงินเดือนนี้</small><div class="big ${inc-exp<0?'fe':''}">${THB(inc-exp)}</div></div><div class="mu"><span class="fi">+${short(inc)}</span> / <span class="fe">-${short(exp)}</span></div></div><div class="sbar" style="height:6px"><s style="width:${r}%;background:${r>=90?'var(--rd)':'var(--ac)'}"></s></div><small class="mu" style="display:block;margin-top:6px">${inc>0?'ใช้ไป '+Math.round(r)+'% ของรายรับ':L.length?'ยังไม่มีรายรับเดือนนี้':'แตะเพื่อเริ่มบันทึกรายรับรายจ่าย'}</small>`}
function finSet(){let e=$('#fset');if(!e){const v=$('#v-set');if(!v)return;e=document.createElement('div');e.id='fset';v.appendChild(e)}
 const rowC=c=>`<div class="row" onclick="window.FNT='${c.t}';openCE('${c.id}','f')" style="cursor:pointer"><span class="ib" style="background:${c.c}">${ic('c-'+c.i)}</span><div>${esc(c.n)}<small>${c.t=='e'?'รายจ่าย':'รายรับ'}</small></div>${ic('r','sm')}</div>`;
 e.innerHTML=`<h2>การเงิน</h2><div class="cd set">${S.fc.map(rowC).join('')}<div class="row" onclick="window.FNT='e';openCE(null,'f')" style="cursor:pointer"><span class="ib" style="background:var(--fill);color:var(--tx)">${ic('plus')}</span><div>เพิ่มหมวดรายจ่าย</div></div><div class="row" onclick="window.FNT='i';openCE(null,'f')" style="cursor:pointer"><span class="ib" style="background:var(--fill);color:var(--tx)">${ic('plus')}</span><div>เพิ่มหมวดรายรับ</div></div><div class="row"><div>ส่งออกบัญชี<small>ไฟล์ CSV เปิดใน Excel / Google Sheets ได้</small></div><button class="btn g" onclick="finCSV()">ส่งออก</button></div></div>`}
function finCSV(){const q=s=>'"'+String(s==null?'':s).replace(/"/g,'""')+'"',rows=[['วันที่','เวลา','ประเภท','หมวดหมู่','จำนวนเงิน','บันทึก','ที่มา','อ้างอิง'].map(q).join(',')];
 S.fin.slice().sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||''))).forEach(x=>rows.push([x.date,x.time||'',x.type=='i'?'รายรับ':'รายจ่าย',fcat(x.cat).n,x.amt.toFixed(2),x.note||'',x.src||'manual',x.ref||''].map(q).join(',')));
 dl('lifeplan-finance.csv','\ufeff'+rows.join('\r\n'),'text/csv')}
function finRender(f){finHome();finSet();if(view=='fin')finView(!!f)}
Object.assign(window,{finRender,finM,finC,finNav,finTy,finMore,finTip,finT2,finCat,finPick,openFin,closeFin,saveFin,delFin,openQR,closeQR,qrFile,slipFile,finCSV,applyQR});
finRender();
})();
