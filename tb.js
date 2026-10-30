(function(g){
  g.buildNote=function(items,now){
    now=now||Date.now();
    var up=(items||[]).map(function(i){
      var p=i.date.split("-").map(Number), t=(i.time||"07:30").split(":").map(Number);
      return {i:i,ms:new Date(p[0],p[1]-1,p[2],t[0],t[1]).getTime()-now};
    }).filter(function(x){return x.ms>0;}).sort(function(a,b){return a.ms-b.ms;});
    if(!up.length) return null;
    var f=up[0], s=Math.floor(f.ms/1000), d=Math.floor(s/86400), h=Math.floor(s%86400/3600);
    var time=d>0?d+" ngày "+h+" giờ":h>0?h+" giờ":"dưới 1 giờ";
    var tk=f.i.tasks||[], dn=tk.filter(function(t){return t.done;}).length;
    return {title:f.i.name,body:"Còn "+time+" · "+dn+"/"+tk.length};
  };
  /* mốc thông báo gần nhất đã qua: 6h, 13h, 19h mỗi ngày */
  g.lastSlot=function(now){
    var d=new Date(now), y=d.getFullYear(), m=d.getMonth(), day=d.getDate();
    var best=new Date(y,m,day-1,19,0,0,0).getTime();
    [6,13,19].forEach(function(h){ var t=new Date(y,m,day,h,0,0,0).getTime(); if(t<=now) best=t; });
    return best;
  };
})(typeof self!=="undefined"?self:window);
