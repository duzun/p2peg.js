// -----------------------------------------------------
/**
 *  Low level tests of  P2PEG class.
 *
 *  @TODO: Test the quality of generated data
 *
 *  @author DUzun.Me
 *
 */
// -----------------------------------------------------
;(function (name, root) {
  'use strict';

  (typeof define == 'function' && define.amd
      ? define
      : (function (require) {
          return typeof module != 'undefined' && module.exports
              ? function (deps, factory) { module.exports = factory(require, module, require('../p2peg')); }
              : function (deps, factory) { root[name] = factory(require, undefined, root.P2PEG); }
      }
      (typeof require == 'function' ? require : function (id){return root[id]}))
  )
  /*define*/(
  ['require', 'module'
      , '../p2peg'
      , '../lib/crypto_hash'
      , '../lib/sha256'
  ]
  , function (require, module, P2PEG, cryptoHash, sha256) {

    var cons = P2PEG
    ,   inst
    ,   log = function () {
          console.log.apply(console, arguments);
        }
    //  bin2hex() helps visualize binary strings,
    //  but I suggest not to rely on it for test results
    ,   bin2hex = P2PEG.bin2hex
    ;
    if ( typeof dump == 'function' ) cons.debug = dump;


    if(!cryptoHash) {
      console.warn('Warning: No WEB API crypto support!');
    }
    else
    describe('cryptoHash', function () {
      it('sha256("hello") should be equal to cryptoHash(SHA-256, "hello")', function (done) {
        var msg = 'hello';
        var dgst = sha256(msg);
        cryptoHash('sha-256', msg, function (err, digest) {
            err && console.error(err);
            expect(digest).toBe(dgst);
            done();
        });
      });
    });

    describe("P2PEG class: ", function () {
        it('should have version property', function () {
            expect(cons.version).toBeDefined();
        });
        it("should have static method instance([secret])", function () {
            expect(typeof cons.instance).toBe('function');
        });
        it(".instance(secret) should return an instance of P2PEG", function () {
            inst = cons.instance('Unit test: instance()');
            expect(inst instanceof cons).toBeTruthy();
            expect(inst.constructor).toBe(cons);
        });
        it('should have packInt($int)', function () {
            expect(typeof cons.packInt).toBe('function');
        });
        it('should have packFloat($float)', function () {
            expect(typeof cons.packFloat).toBe('function');
        });
        it('should have packIP4(ip)', function () {
            expect(typeof cons.packIP4).toBe('function');
        });
        it('should have chr(byte)', function () {
            expect(typeof cons.chr).toBe('function');
        });
        it('should have strxor(str1,str2)', function () {
            expect(typeof cons.strxor).toBe('function');
        });
        it('should have bin2hex(bin)', function () {
            expect(typeof cons.bin2hex).toBe('function');
        });
        it('should have hex2bin(hexStr)', function () {
            expect(typeof cons.hex2bin).toBe('function');
        });
        it('should have bin2text(bin)', function () {
            expect(typeof cons.bin2text).toBe('function');
        });
        it('should have text2bin(text)', function () {
            expect(typeof cons.text2bin).toBe('function');
        });
    });

    describe('P2PEG.strxor(str1, str2)', function () {
      it('should combine two strings of the same length', function () {
          var str1 = 'P2PEG.strxor(str1, str2);';
          var str2 = ';)2rts ,1rts(roxrts.GEP2P';
          var strx = P2PEG.strxor(str1, str2);

          expect(strx).not.toEqual(str1);
          expect(strx).not.toEqual(str2);
          expect(strx.length).toEqual(str2.length);
      });

      it('should combine two strings of different lengths', function () {
          var str1 = 'P2PEG.strxor(str1, str2);';
          var str2 = 'expect(strx).not.toEqual(str1);expect(strx.length).toEqual(str2.length);';
          var strx = P2PEG.strxor(str1, str2);

          expect(strx).not.toEqual(str1);
          expect(strx).not.toEqual(str2);
          expect(strx.length).toEqual(Math.max(str1.length, str2.length));
          expect(P2PEG.strxor(strx, str2)).not.toEqual(str1);
      });
    });

    describe('chr(byte)', function () {
        it('shoult return one char string', function () {
            // ASCII
            expect(cons.chr('A'.charCodeAt(0))).toBe('A');

            // non-ASCII
            var c = cons.chr(200);
            expect(typeof c).toBe('string');
            expect(c.length).toBe(1);

            // Multiple chars
            expect(cons.chr(
                'A'.charCodeAt(0)
              , 'B'.charCodeAt(0)
              , 'C'.charCodeAt(0)
            ))
              .toBe('ABC');
        });
    });

    describe('bin2hex(bin)', function () {
        // bin2hex(bin)
        it('bin2hex(String.fromCharCode(0x00)) should be "00"', function () {
            expect(cons.bin2hex(String.fromCharCode(0x00))).toBe('00');
        });
        it('bin2hex("DUzun") should be "44557a756e"', function () {
            expect(cons.bin2hex('DUzun')).toBe('44557a756e');
        });
    });

    describe('bin-text converter', function () {
        if(!inst) inst = cons.instance();
        var str     = inst.str();
        var text    = cons.bin2text(str);
        var text2   = cons.bin2text(text);
        var untext2 = cons.text2bin(text2);
        var untext  = cons.text2bin(untext2);

        it('should change input', function () {
            expect(str).not.toEqual(text);
            expect(text).not.toEqual(text2);
        });
        it('should decode to original', function () {
            expect(str).toEqual(untext);
            expect(text).toEqual(untext2);
        });
    });

    describe('packInt(int)', function () {
        it('should return "" for packInt(0) and packInt(-1)', function () {
            expect(cons.packInt(0)).toBe("");
            expect(cons.packInt(-1)).toBe("");
        });
        it('packInt(0x1FFFFFFFFFFFFF) should handle numbers bigger then int32', function () {
            expect(bin2hex(cons.packInt(0x1FFFFFFFFFFFFF)))
                .toBe(bin2hex("\xFF\xFF\xFF\xFF\xFF\xFF\x1F"));
        });
        it('packInt(-1>>0) should handle max unsigned int32', function () {
            expect(cons.packInt(-1>>>0)).toBe("\xFF\xFF\xFF\xFF");
        });
        it('should return binary representation of packInt(number)', function () {
            expect(cons.packInt(-1>>>1)).toBe("\xFF\xFF\xFF\x7F");
            expect(cons.packInt(parseInt('12345678', 16))).toBe("\x78\x56\x34\x12");
            expect(cons.packInt(parseInt('9ABCDEF', 16))).toBe("\xEF\xCD\xAB\x09");
        });
        it('packInt("long-str-number") should handle arbitrary length integers in string ', function () {
            var longStrNumber = '1234567890123456789012345678901234567890'
            ,   bin = cons.packInt(longStrNumber)
            ;
            expect(bin).toBeTruthy();
            expect(bin.length)
              .toBeGreaterThan(longStrNumber.length / cons.INT_LEN * cons.INT_SIZE - 1);
        });
        it('should accept float and string for packInt(mixed)', function () {
            var b123 = cons.packInt(12345|0);
            expect(cons.packInt(12345.6789)).toBe(b123);
            expect(cons.packInt('12345.6789')).toBe(b123);
        });
    });

    describe('packFloat(float)', function () {
        it('packFloat(int) should return the same result as packInt(int) only for int.', function () {
            var numbers = [
                4293048097.654321 // >4 bytes matiss
              ,-4293048097.654321 // >4 bytes matiss
              , 4293409.654321
              ,-4293409.654321
              , Math.random() * (-1>>>0)
            ];
            numbers.forEach(function (r) {
                var bInt = cons.packInt(r);
                expect(bin2hex(cons.packFloat(parseInt(r)))).toBe(bin2hex(bInt), r);
                expect(cons.packFloat(r)).not.toBe(bInt, r);
            });
        });
    });

    describe('packIP4(ip)', function () {
        it('packIP4(wrongFormat) should return false', function () {
            expect(cons.packIP4('not a number at all')).toBe(false);
            expect(cons.packIP4('N.a.N.with.dots')).toBe(false);

            expect(cons.packIP4('24.is.a.number.like.87.is'))
                .toBe(String.fromCharCode(24,87));
        });
        it('packIP4(ip) accepts values in IPv4 style with variable number of positions', function () {
            expect(cons.packIP4('1.0')).toBe("\x01\x00");
            expect(cons.packIP4('127.0.255.450')).toBe("\x7F\x00\xFF\xC2");
            expect(cons.packIP4('1.2.3.4.5.6')).toBe("\x01\x02\x03\x04\x05\x06");
            expect(cons.packIP4(Math.PI)).toBe("\x03\x21");
        });
    });

    describe("P2PEG instance: ", function () {
        var inst = cons.instance('Unit test');

        beforeEach(function() {
            inst && inst.seed('beforeEach');
        });

        describe('.hash()', function () {
          var nhex_reg = /[^0-9a-fA-F]/;

          inst.setSecret('secret 1');
          var h1  = inst.hash('test', true);
          var h1r = inst.hash('test', false);

          inst.setSecret('secret 2');
          var h2 = inst.hash('test', true);

          it('should not be empty', function () {
            expect(h1.length).toBeGreaterThan(0);
            expect(h1r.length).toBeGreaterThan(0);
          });
          it('should return non-hex for raw = true', function () {
            expect(nhex_reg.test(h1)).toBeTruthy()
          });
          it('should return only hex for raw = false', function () {
            expect(nhex_reg.test(h1r)).toBeFalsy();
          });
          it('should return same value for same input', function () {
             expect(bin2hex(h1)).toBe(h1r);
          });
          it('should change on secret change', function () {
            expect(h2).not.toBe(h1);
          });
        });

        describe('.str()', function () {
          var s1  = inst.str();
          var s2  = inst.str();
          var len = s2.length;

          // log("str() ->", s1.substr(0, 48)+ '...');
          log('str().length ==', len);

          it('should return different result at each call', function () {
            expect(s1).not.toEqual(s2);
          });
          it('should never return empty result', function () {
            expect(s1).toBeTruthy();
            expect(s2).toBeTruthy();
          });
          it('should have non-ASCII chars', function () {
            var reg = /[^\x08-\x80]/;
            expect(reg.test(s2) || reg.test(s1)).toBeTruthy();
          });

          var s1l = len - 10;  // less then len, from begining
          var s2l = 5;         // buffer has more data then we need
          var s3l = 8;         // buffer has less data then we need
          var s4l = 3*len;     // buffer + seed more times
          var s1 = inst.str(s1l);
          var s2 = inst.str(s2l);
          var s3 = inst.str(s3l);
          var s4 = inst.str(s4l);

          it('str('+s1l+') should never return empty result', function () {
            expect(s1).toBeTruthy();
          });
          it('str() should never return empty result', function () {
            expect(s2).toBeTruthy();
          });
          it('str('+s1l+') returned different length: '+s1.length, function () {
            expect(s1.length).toEqual(s1l);
          });
          it('str('+s2l+') returned different length: '+s2.length, function () {
            expect(s2.length).toEqual(s2l);
          });
          it('str('+s3l+') returned different length: '+s3.length, function () {
            expect(s3.length).toEqual(s3l);
          });
          it('str('+s4l+') returned different length: '+s4.length, function () {
            expect(s4.length).toEqual(s4l);
          });
        });

        describe('.text()', function () {
          var s1  = inst.text();
          var s2  = inst.text();
          var len = s2.length;

          log("text() ->", s1.substr(0, 48) + '...');
          log('text().length ==', len);

          it('should return different result at each call', function () {
            expect(s1).not.toEqual(s2);
          });
          it('should never return empty result', function () {
            expect(s1).toBeTruthy();
            expect(s2).toBeTruthy();
          });
          it('should be b64 encoded', function () {
            expect(/^[a-zA-Z0-9_\\/\\+\\-]+$/.test(s2)).toBeTruthy();
          });

          var s1l = len - 16;  // less then len, from begining
          var s2l = 13;        // buffer has more data then we need
          var s3l = 22;        // buffer has less data then we need
          var s4l = 3*len;     // buffer + seed more times
          var s1 = inst.text(s1l);
          var s2 = inst.text(s2l);
          var s3 = inst.text(s3l);
          var s4 = inst.text(s4l);

          it('text('+s1l+') should never return empty result', function () {
            expect(s1).toBeTruthy();
          });
          it('text() should never return empty result', function () {
            expect(s2).toBeTruthy();
          });
          it('text('+s1l+') returned different length: '+s1.length, function () {
            expect(s1.length).toEqual(s1l);
          });
          it('text('+s2l+') returned different length: '+s2.length, function () {
            expect(s2.length).toEqual(s2l);
          });
          it('text('+s3l+') returned different length: '+s3.length, function () {
            expect(s3.length).toEqual(s3l);
          });
          it('text('+s4l+') returned different length: '+s4.length, function () {
            expect(s4.length).toEqual(s4l);
          });
        });

        describe('.hex()', function () {
          var s1  = inst.hex();
          var s2  = inst.hex();
          var len = s2.length;

          log("hex() ->", s1.substr(0, 48) + '...');
          log('hex().length ==', len);

          it('should return different result at each call', function () {
            expect(s1).not.toEqual(s2);
          });
          it('should never return empty result', function () {
            expect(s1).toBeTruthy();
            expect(s2).toBeTruthy();
          });
          it('should have only hex digits', function () {
            expect(/^[a-fA-F0-9]+$/.test(s2)).toBeTruthy();
          });

          var s1l = len - 14;  // less then len, from begining
          var s2l = 11;        // buffer has more data then we need
          var s3l = 16;        // buffer has less data then we need
          var s4l = 3*len;     // buffer + seed more times
          var s1 = inst.hex(s1l);
          var s2 = inst.hex(s2l);
          var s3 = inst.hex(s3l);
          var s4 = inst.hex(s4l);

          it('hex('+s1l+') should never return empty result', function () {
            expect(s1).toBeTruthy();
          });
          it('hex() should never return empty result', function () {
            expect(s2).toBeTruthy();
          });
          it('hex('+s1l+') returned different length: '+s1.length, function () {
            expect(s1.length).toEqual(s1l);
          });
          it('hex('+s2l+') returned different length: '+s2.length, function () {
            expect(s2.length).toEqual(s2l);
          });
          it('hex('+s3l+') returned different length: '+s3.length, function () {
            expect(s3.length).toEqual(s3l);
          });
          it('hex('+s4l+') returned different length: '+s4.length, function () {
            expect(s4.length).toEqual(s4l);
          });
        });

        describe('.seed()', function () {
          var s1   = inst.state();
          var e    = inst.hash(s1 + '.seed()', true);
          var bytes = 64; // for network seeding

          // Uncomment next lines to use P2P seeding:
          // Note: HTTPS is better for security, but it is too slow. Use HTTP for tests.

          // $e = file_get_contents('https://duzun.me/entropy/str/'.self::$inst->bin2text($e));
          // self::log('e', self::$inst->bin2text($e));

          // $e = file_get_contents('https://jsonlib.appspot.com/urandom?bytes='.$bytes);
          // $t = json_decode($e) and $t = $t->urandom and $e = $t;
          // self::log('e', self::$inst->bin2text($e));

          // $e = file_get_contents('http://www.random.org/cgi-bin/randbyte?format=f&nbytes='.$bytes);
          // self::log('e', self::$inst->bin2text($e));

          var seed = inst.seed(e);
          var s2   = inst.state();

          it('should change the state', function () {
            expect(s1).not.toEqual(s2);
          });
          it('should not return empty', function () {
            expect(seed).toBeTruthy();
          });
        });

        describe('.serverEntropy()', function () {
          var entr = inst.serverEntropy();

          it('should not be empty', function () {
            expect(entr).toBeTruthy();
          });
        });

        describe('.dynEntropy()', function () {
          var entr1 = inst.dynEntropy();
          var entr2 = inst.dynEntropy();
          var entr3 = inst.dynEntropy();

          it('should return different values', function () {
            expect(entr1).not.toEqual(entr2);
            expect(entr1).not.toEqual(entr3);
          });
          it('should not be empty', function () {
            expect(entr1).toBeTruthy();
            expect(entr2).toBeTruthy();
            expect(entr3).toBeTruthy();
          });

          log('dynEntropy() -> '+cons.bin2text(entr1));
          log('dynEntropy() -> '+cons.bin2text(entr2));
          log('dynEntropy() -> '+cons.bin2text(entr3));
        });

        // log(inst.hash(inst.dynEntropy(), false))
    });

    describe('random()', function () {
        if(!inst) inst = cons.instance();
        var r = []
        ,   v = {}
        ,   l = 10000
        ;
        // beforeAll(function () {
            for(var i = 0; i < l; i++) v[r[i] = inst.random()] = i;
        // });

        it('should return a number from interval [0..1)', function () {
            var e;
            expect(r.every(function (n) { e = n; return 0 <= n && n < 1; })).toBeTruthy(e);
        });

        it('should not return same value with a probability of 99.9%', function () {
            expect(Object.keys(v).length > ( l * .999 )).toBeTruthy();
        });
    });

  });

}('P2PEGSpec', typeof global == 'undefined' ? this : global));
