(function(g){
  var SLOTS=[6,13,19];
  g.lastSlot=function(now){
    var d=new Date(now), best=0;
    for(var k=0;k<2;k++){
      SLOTS.forEach(function(h){
        var t=new Date(d.getFullYear(),d.getMonth(),d.getDate()-k,h,0,0,0).getTime();
        if(t<=now&&t>best) best=t;
      });
    }
    return best;
  };
  function z2(n){ return (n<10?"0":"")+n; }
  g.ymd=function(ts){ var d=new Date(ts); return d.getFullYear()+"-"+z2(d.getMonth()+1)+"-"+z2(d.getDate()); };
  g.buildNote=function(items,now){
    now=now||Date.now();
    var up=(items||[]).map(function(i){
      var p=i.date.split("-").map(Number), t=(i.time||"07:30").split(":").map(Number);
      return {i:i,ms:new Date(p[0],p[1]-1,p[2],t[0],t[1]).getTime()-now};
    }).filter(function(x){return x.ms>0;}).sort(function(a,b){return a.ms-b.ms;});
    if(!up.length) return null;
    var f=up[0], s=Math.floor(f.ms/1000), d=Math.floor(s/86400), h=Math.floor(s%86400/3600);
    var time=d>0?d+" ngày "+h+" giờ":h>0?h+" giờ":"dưới 1 giờ";
    var tk=f.i.tasks||[], td=g.ymd(now), dn=tk.filter(function(t){return t.done&&(!t.rep||t.last===td);}).length;
    return {title:f.i.name,body:"Còn "+time+" · "+dn+"/"+tk.length};
  };
  function get(scope,name){
    return caches.open("dem-data").then(function(c){return c.match(scope+name);}).then(function(r){return r?r.json():null;}).catch(function(){return null;});
  }
  function put(scope,name,obj){
    return caches.open("dem-data").then(function(c){
      return c.put(scope+name,new Response(JSON.stringify(obj),{headers:{"Content-Type":"application/json"}}));
    }).catch(function(){});
  }
  g.saveData=function(reg,obj){ return put(reg.scope,"data.json",obj); };
  g.loadData=function(reg){ return get(reg.scope,"data.json"); };
  // Đến khung giờ 6h / 13h / 19h (hoặc đã qua mà chưa báo) thì gửi thông báo một lần
  g.checkSlot=function(reg,items,force){
    var now=Date.now(), slot=g.lastSlot(now);
    return get(reg.scope,"state.json").then(function(st){
      if(!force&&st&&st.shown>=slot) return;
      var n=g.buildNote(items,now);
      if(!n) return reg.getNotifications({tag:"dem-nguoc"}).then(function(l){ l.forEach(function(x){x.close();}); });
      return put(reg.scope,"state.json",{shown:slot}).then(function(){
        return reg.showNotification(n.title,{body:n.body,icon:"notify-icon.png",badge:"badge-96.png",tag:"dem-nguoc",renotify:true,vibrate:[200,100,200],timestamp:now});
      });
    }).catch(function(){});
  };
})(typeof self!=="undefined"?self:window);
