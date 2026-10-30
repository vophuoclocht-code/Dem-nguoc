importScripts("tb.js");
var V="dem-nguoc-v8";
var FILES=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./badge-96.png","./notify-icon.png","./tb.js"];
self.addEventListener("install",function(e){
  e.waitUntil(caches.open(V).then(function(c){
    return Promise.all(FILES.map(function(f){return c.add(f).catch(function(){});}));
  }).then(function(){return self.skipWaiting();}));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(k){
    return Promise.all(k.filter(function(n){return n!==V&&n!=="dem-data";}).map(function(n){return caches.delete(n);}));
  }).then(function(){return self.clients.claim();}));
});
// Phản hồi đã bị chuyển hướng không dùng được cho trang chính (gây lỗi khi tải lại) -> tạo bản sao sạch
function clean(res){
  if(!res.redirected) return Promise.resolve(res);
  return res.blob().then(function(b){return new Response(b,{status:res.status,statusText:res.statusText,headers:res.headers});});
}
function fromCache(req){
  if(req.mode==="navigate") return caches.match("./index.html");
  return caches.match(req,{ignoreSearch:true});
}
self.addEventListener("fetch",function(e){
  var req=e.request;
  if(req.method!=="GET"||new URL(req.url).origin!==self.location.origin) return;
  e.respondWith(new Promise(function(resolve){
    var done=false;
    function fin(r){ if(!done&&r){ done=true; resolve(r); } }
    var t=setTimeout(function(){ fromCache(req).then(fin); },3000);
    fetch(req).then(function(res){
      clearTimeout(t);
      if(res&&res.ok&&res.type==="basic"){
        clean(res.clone()).then(function(x){
          caches.open(V).then(function(c){ c.put(req.mode==="navigate"?"./index.html":req,x); });
        });
      }
      return clean(res).then(fin);
    }).catch(function(){
      clearTimeout(t);
      fromCache(req).then(function(r){
        if(r) fin(r); else if(!done){ done=true; resolve(Response.error()); }
      });
    });
  }));
});
self.addEventListener("periodicsync",function(e){
  if(e.tag!=="dem-nguoc-tick") return;
  e.waitUntil(self.loadData(self.registration).then(function(d){
    if(!d||!d.on) return;
    return self.checkSlot(self.registration,d.items,false);
  }).catch(function(){}));
});
self.addEventListener("notificationclick",function(e){
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(function(l){
    for(var i=0;i<l.length;i++){ if("focus" in l[i]) return l[i].focus(); }
    return self.clients.openWindow("./index.html");
  }));
});
