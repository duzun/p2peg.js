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
    /*define*/(['require', 'module', '../p2peg'], function (require, module, P2PEG) {

        var cons = P2PEG
        //  bin2hex() helps visualize binary strings,
        //  but I suggest not to rely on it for test results
        ,   bin2hex = P2PEG.bin2hex
        ;
        if ( typeof dump == 'function' ) cons.debug = dump;

        describe('playground', function () {
            iit('crypto exists', function () {
                expect(typeof crypto).not.toBe('undefined');
            })
            iit('crypto.subtle exists', function () {
                expect(crypto.subtle).toBeDefined();
            })
            iit('crypto.subtle.digest exists', function () {
                expect(typeof crypto.subtle.digest).not.toBe('undefined');
            })
            
            it('crypto.subtle.digest', function () {
                function str2Uint8(str) {
                    return new Uint8Array([].slice.call(str).map(function(c){return c.charCodeAt(0)}));
                }
                function Uint2Str(uint) {
                    return String.fromCharCode.apply(String, uint);
                }
                var s = 'hello';
                var a = str2Uint8(s);
                var p = crypto.subtle.digest({name:'sha-256'}, a); 
                p.oncomplete = function(a){console.log(a)}
            })
        })
        
        describe("P2PEG static helpers: ", function () {
            it('should contain version', function () {
                expect(cons.version).toBeDefined();
            });
            it('should contain packInt($int)', function () {
                expect(typeof cons.packInt).toBe('function');
            });
            it('should contain packFloat($float)', function () {
                expect(typeof cons.packFloat).toBe('function');
            });
            it('should contain packIP4(ip)', function () {
                expect(typeof cons.packIP4).toBe('function');
            });
            it('should contain chr(byte)', function () {
                expect(typeof cons.chr).toBe('function');
            });
            it('should contain strxor(str1,str2)', function () {
                expect(typeof cons.strxor).toBe('function');
            });
            it('should contain bin2hex(bin)', function () {
                expect(typeof cons.bin2hex).toBe('function');
            });
            it('should contain hex2bin(hexStr)', function () {
                expect(typeof cons.hex2bin).toBe('function');
            });
            it('should contain bin2text(bin)', function () {
                expect(typeof cons.bin2text).toBe('function');
            });
            it('should contain text2bin(text)', function () {
                expect(typeof cons.text2bin).toBe('function');
            });

            // chr(byte)
            it('chr(byte) shoult return one char string', function () {
                var c = cons.chr(123);
                expect(typeof c).toBe('string');
                expect(c.length).toBe(1);
            });

            // bin2hex(bin)
            it('bin2hex(String.fromCharCode(0x00)) should be "00"', function () {
                expect(cons.bin2hex(String.fromCharCode(0x00))).toBe('00');
            });
            it('bin2hex("DUzun") should be "44557a756e"', function () {
                expect(cons.bin2hex('DUzun')).toBe('44557a756e');
            });

            // packInt(int)
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

            // packFloat(float)
            it('packFloat(int) should return the same result as packInt(int) only for int.', function () {
                var r = Math.random() * (-1>>>0);
                var bInt = cons.packInt(r);
                expect(bin2hex(cons.packFloat(r|0))).toBe(bin2hex(bInt));
                expect(cons.packFloat(r)).not.toBe(bInt);
            });

            // packIP4(ip)
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

            afterEach(function() {
            });

            it("should have static method P2PEG::instance()", function () {
                expect(typeof cons.instance).toBe('function');
            });

            it("P2PEG:instance(secret) should return an instance of P2PEG", function () {
                inst = cons.instance('Unit test');
                expect(inst instanceof cons).toBeTruthy();
                expect(inst.constructor).toBe(cons);
            });

            it('serverEntropy() should not be empty', function () {
                var entr = inst.serverEntropy();
                expect(entr).toBeTruthy();
            });
            
            it('dynEntropy() should change', function () {
                var entr1 = inst.dynEntropy();
                var entr2 = inst.dynEntropy();
                var entr3 = inst.dynEntropy();
                expect(entr1).not.toEqual(entr2);
                expect(entr1).not.toEqual(entr3);
            });

            // dump(inst.hash(inst.dynEntropy(), false))

            inst = null;

        });

    });

}('P2PEGSpec', typeof global == 'undefined' ? this : global));
