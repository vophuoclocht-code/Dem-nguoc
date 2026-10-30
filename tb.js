(function(g){
  g.buildNote=function(items,now){
    now=now||Date.now();
    var up=(items||[]).map(function(i){
      var p=i.date.split("-").map(Number), t=(i.time||"07:30").split(":").map(Number);
      return {i:i,ms:new Date(p[0],p[1]-1,p[2],t[0],t[1]).getTime()-now};
    }).filter(function(x){return x.ms>0;}).sort(function(a,b){return a.ms-b.ms;});
    if(!up.length) return null;
    var f=up[0], s=Math.floor(f.ms/1000), d=Math.floor(s/86400), h=Math.floor(s%86400/3600), m=Math.floor(s%3600/60);
    var time=d>0?d+" ngày "+h+" giờ":h>0?h+" giờ "+m+" phút":m+" phút";
    var tk=f.i.tasks||[], dn=tk.filter(function(x){return x.done;}).length;
    var slot=Math.floor(now/(3*3600*1000));
    return {title:f.i.name,body:"Còn "+time+" · "+dn+"/"+tk.length,key:f.i.id+"|"+dn+"/"+tk.length+"|"+slot};
  };
})(typeof self!=="undefined"?self:window);
