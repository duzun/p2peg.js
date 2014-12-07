/**
 *  Try to detect and use WEB API for hash functions
 *
 *  Ussage:
 *      cryptoHash('SHA-256', 'hello', function (error, digest) {
 *          console.log(digest); // => '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
 *      })
 *
 *  IE: http://msdn.microsoft.com/en-us/library/ie/dn302328(v=vs.85).aspx
 *      * SHA-1
 *      * SHA-256
 *      * SHA-384
 *
 *  W3C: https://github.com/ttaubert/octoblog/blob/master/source/_posts/2014-06-04-hashing-using-the-web-cryptography-api.markdown
 *
 *  @author Dumitru Uzun (DUzun.Me)
 *
 */
(function(name, root, String) {
    'use strict';

    (typeof define !== 'function' || !define.amd
        ? typeof module == 'undefined' || !module.exports
            ? function (deps, factory) { root[name] = factory(); } // Browser
            : function (deps, factory) { module.exports = factory(); } // CommonJs
        : define // AMD
    )
    /*define*/(/*name, */[], function factory() {
      var crypto = root.crypto || root.msCrypto || root.webkitCrypto;
      var subtle = crypto.subtle || crypto.webkitSubtle;

      if ( !subtle ) return false;

      var hash = function (algo, message, cb) {
        try {
          var p = subtle.digest({name:algo}, str2Uint8(message))
          ,   done = function (a) { cb&&cb(null, Uint2Hex(new Uint8Array(a))); }
          ;
          // Webkit
          if(p.then) {
            p.then(done, cb);
          }
          // IE
          else {
            p.oncomplete = function (evt) {
              done(evt.target.result);
            };
            p.onerror = function (evt) {
                cb&&cb(evt);
            };
          }
          return p;
        }
        catch(err) {
          cb&&cb(err);
        }
      };

      // Some helpers
      var slice = [].slice;
      var map = [].map;

      function str2Uint8(str) {
          return new Uint8Array(slice.call(str).map(function(c){return c.charCodeAt(0)}));
      }
      function Uint2Str(uint) {
          return String.fromCharCode.apply(String, uint);
      }
      function Uint2Hex(uint) {
          return map.call(uint, function (c) { return (c < 16 ? '0':'') + c.toString(16) }).join('');
      }


      // Export some stuff:
      hash.str2Uint8 = str2Uint8;
      hash.Uint2Str = Uint2Str;
      hash.Uint2Hex = Uint2Hex;

      hash.crypto = crypto;
      hash.subtle = subtle;

      return hash;
    });
}
('cryptoHash', this, String));