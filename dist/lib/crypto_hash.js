(function(e,b,l){("function"===typeof define&&define.amd?define:"undefined"!=typeof module&&module.exports?function(b,f){module.exports=f()}:function(g,f){b[e]=f()})([],function(){function g(a){return new Uint8Array(e.call(a).map(function(a){return a.charCodeAt(0)}))}function f(a){return m.call(a,function(a){return(16>a?"0":"")+a.toString(16)}).join("")}var h=b.crypto||b.msCrypto||b.webkitCrypto,k=h.subtle||h.webkitSubtle;if(!k)return!1;var c=function(a,c,d){try{var b=k.digest({name:a},g(c)),e=function(a){d&&
d(null,f(new Uint8Array(a)))};b.then?b.then(e,d):(b.oncomplete=function(a){e(a.target.result)},b.onerror=function(a){d&&d(a)});return b}catch(n){d&&d(n)}},e=[].slice,m=[].map;c.str2Uint8=g;c.Uint2Str=function(a){return l.fromCharCode.apply(l,a)};c.Uint2Hex=f;c.crypto=h;c.subtle=k;return c})})("cryptoHash",this,String);
