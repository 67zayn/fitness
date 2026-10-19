const C='lifeplan-v4',F=['./','./index.html','./finance.js','./icon.svg','./manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x))))));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);
 if(e.request.method!=='GET')return;
 if(u.origin!==location.origin&&!/fonts\.(googleapis|gstatic)\.com$/.test(u.host))return; // ไม่แคชไลบรารี OCR/QR ขนาดใหญ่ ให้เบราว์เซอร์จัดการเอง
 e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(C).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)))});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window'}).then(l=>l.length?l[0].focus():clients.openWindow('./')))});
