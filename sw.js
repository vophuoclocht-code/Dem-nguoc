importScripts("tb.js");
var V="dem-nguoc-v7";
var FILES=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./badge-96.png","./blank.png","./tb.js"];
self.addEventListener("install",function(e){
  e.waitUntil(caches.open(V).then(function(c){return c.addAll(FILES);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(k){
    return Promise.all(k.filter(function(n){return n!==V&&n!=="dem-data";}).map(function(n){return caches.delete(n);}));
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
self.addEventListener("periodicsync",function(e){
  if(e.tag!=="dem-nguoc-tick") return;
  e.waitUntil(caches.open("dem-data").then(function(c){
    return Promise.all([c.match("data.json"),c.match("slot.json")]).then(function(rs){
      return Promise.all([rs[0]?rs[0].json():null,rs[1]?rs[1].json():null]);
    }).then(function(v){
      var d=v[0], o=v[1], slot=self.lastSlot(Date.now());
      if(!d||!d.on||(o&&o.slot>=slot)) return;
      var n=self.buildNote(d.items);
      return c.put("slot.json",new Response(JSON.stringify({slot:slot}),{headers:{"Content-Type":"application/json"}})).then(function(){
        if(!n) return self.registration.getNotifications({tag:"dem-nguoc"}).then(function(l){ l.forEach(function(x){x.close();}); });
        return self.registration.showNotification(n.title,{body:n.body,icon:"blank.png",badge:"badge-96.png",tag:"dem-nguoc",renotify:true,silent:false,requireInteraction:true,timestamp:Date.now()});
      });
    });
  }).catch(function(){}));
});
self.addEventListener("notificationclick",function(e){
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(function(l){
    for(var i=0;i<l.length;i++){ if("focus" in l[i]) return l[i].focus(); }
    return self.clients.openWindow("./index.html");
  }));
});
