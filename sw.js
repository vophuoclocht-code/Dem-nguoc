var V="dem-nguoc-v4";
var FILES=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png"];
self.addEventListener("install",function(e){
  e.waitUntil(caches.open(V).then(function(c){return c.addAll(FILES);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(k){
    return Promise.all(k.filter(function(n){return n!==V;}).map(function(n){return caches.delete(n);}));
  }).then(function(){return self.clients.claim();}));
});
self.addEventListener("fetch",function(e){
  if(e.request.method!=="GET") return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(function(r){
    return r||fetch(e.request).then(function(res){
      var cp=res.clone(); caches.open(V).then(function(c){c.put(e.request,cp);}); return res;
    }).catch(function(){return caches.match("./index.html");});
  }));
});
self.addEventListener("notificationclick",function(e){
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(function(l){
    for(var i=0;i<l.length;i++){ if("focus" in l[i]) return l[i].focus(); }
    return self.clients.openWindow("./index.html");
  }));
});
