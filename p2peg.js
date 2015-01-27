/**
 *  This file is under develoment.
 *
 *  @TODO:
 *  *  all ???
 *  *  API: https://developer.mozilla.org/en-US/docs/Web/API/RandomSource.getRandomValues
 *  *  clb: http://jsonlib.appspot.com/urandom?callback=p2peg.seed
 *  *  XHR: https://www.random.org/integers/?num=256&min=0&max=255&col=1&base=16&format=plain&rnd=new
 *
 *  @requires sha1, sha256, base64
 *
 *  @version 0.3.2
 *
 *  @author Dumitru Uzun (DUzun.Me)
 */

;(function $_P2PEG(name, root, FUNCTION, String, Object, Date, Math) {
    'use strict';
    // -------------------------------------------------
    var undefined
    ,   UNDEFINED = undefined + ''
    ,   hop = Object.prototype.hasOwnProperty

    ,   version   = '0.3.2'

    ,   INT_SIZE  = 4 // JS can handle only 32bit integers == 4 bytes
    ,   INT_LEN   = Math.round(INT_SIZE * Math.log(256) / Math.log(10))
    ,   MAX_INT   = -1 >>> 1
    ,   INT3BYTES = 0xFFFFFF
    ,   INT_SIGN_BIT = MAX_INT + 1


    ,   isCommonJs = typeof module != UNDEFINED && module.exports
    ,   isNode = isCommonJs && typeof exports !== UNDEFINED && root.exports !== exports // @TODO

    ,   perf = typeof performance !== 'undefined' && performance.now ? performance : undefined
    ,   proc = typeof process !== 'undefined' && process.hrtime ? process : null
    ,   now      = ! perf
                    ? typeof Date.now !== FUNCTION
                        ? function () { return (new Date).getTime() }
                        : function () { return Date.now() }
                    : function () { return perf.now() }
    ,   micronow = ! proc
                    ? ! perf
                        ? function () { return now() % 1e3; }
                        : function () { return ((perf.now() * 1e3)|0) % 1e6; }
                    : function () { return process.hrtime()[1] }

    ,   hrtime = proc
                    ? function (x) { return x ? process.hrtime(x) : process.hrtime(); }
                    : function (x) {
                        var r = now() / 1e3, i = r | 0;
                        r = [i, (r - i) * 1e9];
                        if ( x ) {
                            r[0] -= x[0]; r[1] -= x[1];
                            if ( r[1] < 0 ) {
                                --r[0], r[1] += 1e9;
                            }
                        }
                        return r;
                    }

    ,   start_hr = hrtime()

    ,   start_ts = now()

    ,   crypto = isNode ? require('crypto') : root.crypto
    ;
    // -------------------------------------------------
    // -------------------------------------------------
    (typeof define == FUNCTION && define.amd
        ? define // AMD
        : (function (require) {
            return typeof module != UNDEFINED && module.exports
                ? function (deps, factory) { module.exports = factory(require, module); }              // CommonJs
                : function (deps, factory) { root[name] = factory(require/*, module == undefined*/); } // Browser
        }
        (typeof require == FUNCTION ? require : function (id){return root[id.split('/').pop()]}))
    )
    /*define*/(
        ['require', 'module', './lib/sha1', './lib/sha256', './lib/base64']
        , function factory(require, module, sha1, sha256, base64) {
            // -------------------------------------------------
            if(!sha1)   sha1   = require('./lib/sha1');
            if(!sha256) sha256 = require('./lib/sha256');
            if(!base64) base64 = require('./lib/base64');

            var noop = function () {};

            // Private primitive hash function
            var _hash = function _hash(str, raw) {
                var ret = sha256(str);
                return raw ? hex2bin(ret) : ret;
            };

            var P2PEG = function P2PEG(secret) {
                    // Private
                    var _opad, _ipad

                    ,   _state
                    ,   _state_mtime

                    ,   _clientEntropy
                    ,   _serverEntropy
                    ,   _serverEEntropy
                    ,   _filesystemEntropy

                    ,   _b = ''
                    ,   _l = 0

                    ,   _self = this
                    ;

                    // -------------------------------------------------
                    // Private Methods
                    _self.setSecret = function setSecret(key) {
                        var size = 64;
                        var l = String(key).length;
                        if(size < l) {
                            key = sha1(key);
                            if(key === FALSE) return key;
                            key = hex2bin(key);
                            l = strlen($key);
                        }
                        if(l < size) {
                            key = str_pad(key, size, chr(0), false);
                        }
                        else {
                            key = key + substr(0, -1) + chr(0);
                        }

                        _opad = strxor(str_repeat(chr(0x5C), size), key);
                        _ipad = strxor(str_repeat(chr(0x36), size), key);

                        // Empty the buffer
                        _l = 0;
                    }

                    _self.seed = function seed(_seed) {
                        var ret = _self.state()
                                + String(_seed)
                                + _self.dynEntropy()
                        ;
                        ret = _self.hash(ret, true);
                        _state = strxor(_state, ret);
                        _b = ret;
                        _l = ret.length;
                        return ret;
                    }

                    _self.state = function state() {
                        if ( _state == undefined ) {
                          // @TODO
                          
                          // Seed the state
                          var seed = this.hash(this.clientEntropy() + this.dynEntropy() + this.serverEntropy());

                          _state = seed;
                        }
                        return _state;
                    }

                    /**
                     *  Return a random binary string of specified length.
                     */
                    _self.str = function str(len) {
                        var l, ret;

                        // If buffer is empty, fill it
                        if ( !(l = _l) ) {
                            this.seed(len);
                            l = _l;
                        }
                        // If we have to return exactly what is in the buffer, return quickly
                        if ( len == undefined || len == l ) {
                            // remove used data from buffer to avoid reusing it
                            ret = l < _b.length ? _b.substr(0, l) : _b;
                            // empty the buffer
                            _b = '';
                            _l = 0;
                            return ret;
                        }

                        ret = '';
                        // If we need more data than we have in the buffer, generate some more
                        if ( l < len ) {
                            // remove used data from buffer to avoid reusing it
                            if ( l < _b.length ) _b = _b.substr(0, l);

                            do {
                                ret += _b; // save what is in the buffer
                                this.seed(l);   // fill it again
                                l += _l;   // the sum of what we have saved in ret and what is in the buffer
                            } while(l < len);
                        }

                        // If buffer has more data then we need
                        if ( len < l ) {
                            // how much data we don't need from buffer ?
                            _l = l - len;
                            // get only that much we need from buffer and leave the rest for others
                            ret += _b.substr(_l, len);
                        }
                        // else buffer has exactly how much data we need - grab it all
                        else {
                            ret += _b;
                            // empty the buffer
                            _b = '';
                            _l = 0;
                        }
                        return ret;
                    }

                    // Strong hash function, HMAC
                    _self.hash = function hash(str, raw) {
                        if( raw === undefined ) raw = true; // default
                        str = _ipad + str;
                        var ret = _hash(_opad + _hash(_ipad + str, true), raw);
                        return ret;
                    }
                    // -------------------------------------------------
                    // __construct()
                    if ( secret == undefined ) {
                        secret = '!8L_JlACt:5!R9}~>yb!gPP=|(ao/&-Z';
                    }

                    _self.setSecret(secret);

                    _self.seedSys = _self.isServer();
                }

            ,   proto = P2PEG.prototype
            ;

            // -------------------------------------------------
            // Static
            P2PEG.version = version;
            P2PEG.displayName = name;
            P2PEG.debug = noop;

            /// Get the singleton instance
            var _instance;
            P2PEG.instance = function instance(secret) {
                if(!_instance) {
                    _instance = new P2PEG(secret);
                }
                return _instance;
            }

            // -------------------------------------------------
            proto.constructor = P2PEG;

            proto.setSecret = undefined; // private level access
            proto.seed      = undefined; // private level access
            proto.str       = undefined; // private level access
            proto.hash      = _hash;     // private level access

            // -------------------------------------------------
            proto.toString = function toString(mode) {
                switch(mode) {
                  case  16:
                  case 'hex':
                      return this.hex();

                  case 256:
                  case 'bin':
                      return this.str();

                  default:
                  case 64:
                  case 'text':
                      return this.text();
                }
            };

            // -------------------------------------------------

            /**
             *  Hex encoded string
             */
            proto.hex = function hex(len) {
                var l = len != undefined ? (len+1) >> 1 : len
                ,   ret = this.str(l)
                ;
                ret = bin2hex(ret);
                return len == undefined || ret.length == len
                    ? ret
                    : ret.substr(0, len)
                ;
            }

            /**
             *  Base64 encoded text for URL
             */
            proto.text = function text(len) {
                var l = len != undefined ? ceil(len * 3.0 / 4.0) : undefined
                ,   ret = bin2text(this.str(l))
                ;
                if(len != undefined && ret.length > len) ret = ret.substr(0, len);
                return ret;
            }

            /**
             *  Return a random 16 bit integer.
             *
             *  @return (int)random
             */
            proto.int16 = function int16() {
                return this.int(2);
            }

            /**
             *  Return a random 32 bit integer.
             *
             *  @return (int)random
             */
            proto.int32 = function int32() {
                return this.int(4);
            }

            /**
             *  Return a random integer.
             *
             *  @param (int)$size - number of bytes used to generate the integer [1..INT_SIZE].
             *                      Defaults to INT_SIZE (4 or 8, depending on system)
             *      Ex. If $size == 1, the result is a number from interval [0..255].
             *          If $size == 3, the result is a number from interval [0..16777215].
             *
             *  @return (int)random
             *
             */
            proto.int = function _int(size) {
                var s = size != undefined ? size : INT_SIZE
                ,   src = this.str(s)
                ,   r = 0
                ;
                for(;s--;) r = (r << 8) | src.charCodeAt(s);
                return r;
            }

            // -------------------------------------------------
            /**
             *   Quickly get some dynamic entropy.
             */
            proto.dynEntropy = function dynEntropy() {
                var _self = this
                ,   _entr = {}
                ;

                _entr[packInt(micronow())] = 'micronow';
                _entr[packFloat(Math.random())] = 'rand';

                // System performance/load indicator
                var r = hrtime(start_hr);
                _entr[packFloat(r.join('.'))] = 'delta';

                _entr = keys(_entr).join('');

                return _entr;
            };

            /**
             * Entropy private to server
             */
            proto.serverEntropy = function serverEntropy() {
                var _self = this
                ,   _entr = _self._serverEntropy
                ;

                if ( _entr == undefined ) {
                    var _el = 0, t, s;
                    _entr = {}

                    _entr[packFloat(start_hr.join('.'))] = 'start';
                    _entr[packIP4(version)] = 'ver';

                    if ( isNode ) {

                    }

                    if ( s = root.navigator ) {
                        _entr[s.userAgent || s.appVersion] = ++_el;
                        if ( t = s.productSub ) _entr[t] = ++_el;
                        if ( t = s.languages ) _entr[t] = ++_el;
                        if ( (t = s.plugins) && t.length ) {
                            each(t, function (i,p) {
                                _entr[p.description] = ++_el;
                                _entr[p.name] = ++_el;
                                _entr[p.filename] = ++_el;
                            });
                        }
                    }

                    if ( s = root.screen ) {
                        each(s, function (i,p) { _entr[p||i] = _el });
                    }

                    if ( s = root.document ) {
                        if ( t = s.cookie )   _entr[t] = ++_el;
                        if ( t = s.doctype )  _entr[t] = _el;
                        if ( t = s.domain )   _entr[t] = _el;
                        if ( t = s.location ) _entr[t.href] = _el;
                    }

                    // _entr might containt sensitive data (ex. cookie)
                    // hash it before using as entropy
                    if ( _el ) {
                        _entr[packFloat(hrtime(start_hr).join('.'))] = 1; // some randomness
                        _el = _self.hash(keys(_entr).join(''), true); // HMAC with secret
                        _entr = {}
                        _entr[_el] = 'client';
                        _el = 1;
                    }

                    if ( typeof process != UNDEFINED ) {
                        if ( t = process.arch ) _entr[t] = ++_el;
                        if ( t = process.platform ) _entr[t] = ++_el;
                        if ( t = process.pid ) _entr[packInt(t)] = ++_el;
                        if ( t = process.uptime && process.uptime() ) _entr[packInt(t)] = ++_el;
                        if ( t = process.getgid && process.getgid() ) _entr[packInt(t)] = ++_el;
                        if ( t = process.getuid && process.getuid() ) _entr[packInt(t)] = ++_el;
                        if ( t = process.version ) _entr[packIP4(t.slice(1))] = ++_el;
                        if ( t = process.versions ) each(t, function (n,v) {
                            _entr[packIP4(v)] = ++_el;
                        });
                    }

                    // if ( t = getlastmod() ) _entr[packInt(t)] = 'lastmod';

                    if ( crypto ) {
                        // Node
                        if( crypto.randomBytes ) {
                          _entr[arr2str(crypto.randomBytes(32))] = ++_el;
                        }
                        // Web API
                        if ( crypto.getRandomValues ) {
                          crypto.getRandomValues(t = new Uint8Array(64));
                          _entr[arr2str(t)] = ++_el;
                        }
                    }

                    _entr = keys(_entr).join('');
                    // P2PEG.debug(serverEntropy.name, bin2hex(_entr));

                    _self._serverEntropy = _entr;
                }
                return _entr;
            } ;
            // -------------------------------------------------
            proto.clientEntropy = function clientEntropy() {
                // ??? @TODO
                return '';
            };
            // -------------------------------------------------
            /**
             *  Pseudo-random 32bit integer numbers generator.
             *
             *  This function produces same result as this.int32(),
             *  but is much faster at generating long strings of random numbers.
             *
             *  @source http://en.wikipedia.org/wiki/Random_number_generation
             */
            proto.rand32 = function rand32() {
                var _self = this
                ,   rs_w = _self.rs_w
                ,   rs_z = _self.rs_z
                ;

                // Seed if necessary
                while(!rs_w || rs_w == 0x464fffff) {
                    /* must not be zero, nor 0x464fffff */
                    rs_w = _self.int32() ^ _self.int32();
                    // rs_w = (now()*Math.random())>>>0; // alternative
                }
                while(!rs_z || rs_z == 0x9068ffff) {
                    /* must not be zero, nor 0x9068ffff */
                    rs_z = _self.int32() ^ _self.int32();
                    // rs_z = (now()*Math.random())>>>0; // alternative
                }

                rs_z = 36969 * (rs_z & 0xFFFF) + (rs_z >> 16);
                rs_w = 18000 * (rs_w & 0xFFFF) + (rs_w >> 16);
                var ret = (rs_z << 16) + rs_w;  /* 32-bit result */

                _self.rs_w = rs_w;
                _self.rs_z = rs_z;

                // handle overflow:
                // in JS at overflow (int32) -> (float)
                return ret | 0;
            }

            proto.saveState = function saveState(sf) {
                // @TODO: save to fs or localStorage
            }

            proto.isServer = function isServer() {
                // @TODO: There might be other server environments besides node.js
                return isNode;
            }

            proto.seedSys = true;
            proto.rs_z = 0;
            proto.rs_w = 0;

            // -------------------------------------------------
            // Helpers:
            var str_repeat = function str_repeat(str, n) {
                var r = ''; while(n-->0) r += str; return r;
            };

            var floor = Math.floor;
            var ceil  = Math.ceil;

            var chr = String.fromCharCode;
            var arr2str = function (arr) { return chr.apply(String, arr); }

            // Be polite, if possible
            if ( typeof chr.bind == 'function' ) chr = chr.bind(String);

            var each = function each(o, f) {
                if(!o) return o;
                var i, s, l;
                if ( o instanceof Array || typeof o.length === 'number' && typeof o != FUNCTION ) {
                    for(i=0,l=o.length>>>0; i<l; i++) if(hop.call(o, i)) {
                        s = o[i];
                        if(f.call(s, i, s, o) === false) return i;
                    }
                }
                else {
                    for(i in o) if(hop.call(o, i)) {
                        s = o[i];
                        if(f.call(s, i, s, o) === false) return i;
                    }
                    // Warning: IE hasDontEnumBug - not implemented!
                }
                return o
            } ;

            var isEmpty = function isEmpty(obj) {
                var ret = true;
                each(obj, function () { return ret = false });
                return ret
            } ;

            var keys = Object.keys;
            if ( typeof keys !== FUNCTION ) {
                keys = function keys(o) {
                    var ret = [];
                    each(o, function (k,v) { ret.push(k); });
                    return ret;
                };
            }

            var str_pad = function (t, n, s, left) {
                n >>>= 0;
                var l = t.length
                ,   d = n - l
                ,   i
                ,   p
                ;
                if(0 < d) {
                    if(s == null) s = ' ';
                    p = s.length;
                    i = 1 + (d / p) >> 0;
                    if(left) {
                        while(i--) t = s + t;
                        i = t.length;
                        t = n < i ? t.substr(i-n) : _(t)
                    }
                    else {
                        while(i--) t += s;
                        i = t.length;
                        t = n < i ? t.substr(0, n) : _(t)
                    }
                }
                return t;
            };

            /// Returns hex representation of the string
            /// If this is UTF8, it gets converted
            var bin2hex = function bin2hex(s, encodeUtf8) {
                var ret = ''
                ,   i = 0
                ,   l = s.length
                ,   c
                ;
                for (; i<l; i++) {
                    c = s.charCodeAt(i);
                    // if(encodeUtf8 && c > 0xFF) return hex.call(s.utf8Encode()); //??? todo
                    if(c < 16) ret += '0';
                    ret += c.toString(16);
                }
                return ret;
            }

            /// Converts a string of HEX digits (0-f) to its binary string representation
            var hex2bin = function hex2bin(s) {
                var ret = []
                ,   i = 0
                ,   l = s.length
                ,   c, k
                ;
                for ( ; i < l; i += 2 ) {
                    c = parseInt(s.substr(i, 1), 16);
                    k = parseInt(s.substr(i+1, 1), 16);
                    if(isNaN(c) || isNaN(k)) return false;
                    ret.push( (c << 4) | k );
                }
                return arr2str(ret);
            };

            var bin2text = function bin2text(bin) {
                return base64.byteUrlEncode(bin);
            };

            var text2bin = function text2bin(text) {
                return base64.byteUrlDecode(text);
            };

            var strxor = function strxor($a,$b) {
                var a = $a ? String($a) : ''
                ,   b = $b ? String($b) : ''
                ,   m = a.length
                ,   n = b.length
                ,   ret = []
                ;
                if(m != n) {
                    if(!m || !n) return a + b;
                    if(n < m) {
                        b = str_repeat(b, floor(m / n)) . b.substr(0, m % n);
                        n = m;
                    }
                    else {
                        a = str_repeat(a, floor(n / m)) . a.substr(0, n % m);
                    }
                }
                for(m=0;m<n;m++) ret[m] = a.charCodeAt(m) ^ b.charCodeAt(m);
                return arr2str(ret);
            };

            var packIP4 = function packIP4(ip) {
                ip = String(ip).split('.');
                var r = []
                ,   l = ip.length
                ,   i = 0
                ,   hasNaN
                ,   t
                ;
                for ( ; i<l; i++ ) {
                    t = parseInt(ip[i]);
                    if ( isNaN(t) ) {
                        hasNaN = true;
                        continue;
                    }
                    r.push(t & 0xFF);
                }
                if ( hasNaN && r.length == 0 ) return false;
                r = arr2str(r);
                return r;
            };

            var packInt = function packInt($int) {
                var r = [];
                if(typeof $int === 'string') {
                    $int = $int.replace(/^[0.]+/, '');
                    if($int.length > INT_LEN) {
                        for(var i = 0, l = $int.length; i<l; i += INT_LEN) {
                            r.push(packInt($int.substr(i, INT_LEN)|0));
                        }
                        return r.join('');
                    }
                    $int = parseInt($int);
                    if ( isNaN($int) ) return false;
                }
                // When $int is bigger then int32, shift cuts out some bits.
                // Split the number into 3 pieces of 24 bits (Number is a 53 bit precision double)
                if ( $int > INT_SIGN_BIT ) {
                    return  packInt($int & INT3BYTES) +
                            packInt(($int /= INT3BYTES+1) & INT3BYTES) +
                            packInt(($int / (INT3BYTES+1))|0) ;
                }

                var m = $int < 0 ? -1 : 0;
                while($int != m) {
                    r.push($int & 0xFF);
                    $int >>= 8;
                }
                r = arr2str(r);
                return r;
            };

            var packFloat = function packFloat($float) {
                var t = String($float).split('.');
                return t.length == 2
                        ? packInt(t[1]+t[0]) + packInt(t[1].length)
                        : packInt($float);
            };

            // -------------------------------------------------
            // Export as static methods:
            P2PEG.bin2hex   = bin2hex;
            P2PEG.hex2bin   = hex2bin;
            P2PEG.bin2text  = bin2text;
            P2PEG.text2bin  = text2bin;
            P2PEG.strxor    = strxor;
            P2PEG.packInt   = packInt;
            P2PEG.packFloat = packFloat;
            P2PEG.packIP4   = packIP4;
            P2PEG.chr       = chr;
            P2PEG.arr2str   = arr2str;

            P2PEG.keys      = keys;
            P2PEG.isEmpty   = isEmpty;
            P2PEG.each      = each;

            // Export constants:
            P2PEG.INT_SIGN_BIT = INT_SIGN_BIT;
            P2PEG.MAX_INT      = MAX_INT;
            P2PEG.INT_LEN      = INT_LEN;
            P2PEG.INT_SIZE     = INT_SIZE;

            return P2PEG;
        }
    );

    // -------------------------------------------------
}
('P2PEG', typeof global == 'undefined' ? this : global, 'function'
, String, Object, Date, Math)); // primitive dependencies
