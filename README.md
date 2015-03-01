
# Peer to Peer Entropy Generator
## or Random numbers generator with p2p seeding
@version 0.3.2  [![Build Status](https://travis-ci.org/duzun/p2peg.js.svg?branch=master)](//travis-ci.org/duzun/p2peg.js)

## About

**Node**: This is a port to JS of [P2PEG](//github.com/duzun/P2PEG) for PHP.
It is still under development.

This library uses a combination of sources of entropy to generate random data as unpredictable as posible.
The key concept is sharing of random data between peers, where both peers benefit from the request.

Internally each peer generates random data using some system data, server performance/load,
some [PRNGs](http://en.wikipedia.org/wiki/Pseudorandom_number_generator) (Pseudo Random Number Generators),
timing and client supplied data.
The collected data is always combined with the internal state data, which changes at each request,
and digested by a [HMAC](https://en.wikipedia.org/wiki/Hash-based_message_authentication_code)
with the peer's secret key.

Each client-peer adds to the entropy of the server-peer by suppling variable data with the request
(in purpos or not) and by the fact of connecting to the server (the exact request time is also accounted),
thus changing internal state of the `P2PEG`.
The internal state is a (digested) sum of all collected entropy bits from system and from all peers
that have ever requested current peer.
The more requests a peer gets, the more unpredictable internal state it has.

For client-peer there is no way to know about `P2PEG`'s internal state or about other client-peers, 
hence generated data is truly random and unpredictable.

If one peer doesn't trust the other peer to be "honest", it can contact multiple peers 
to gather the random bits and combine the result with it's own PRN and internal state.

On a web-server entropy can also be collected from common website clients.


- [Docs](https://duzun.github.io/p2peg.js/docs/p2peg.html)
- [Specs](https://duzun.github.io/p2peg.js/spec/run/index.html)

## Basic Usage

Include the libary

```javascript
var P2PEG = require("./p2peg");
```
or
```html
<script src="/js/p2peg.js"></script>
```

Get the singleton instance or just create a new instance of P2PEG

```javascript
var p2peg = P2PEG.instance('optional secret');
// or
var p2peg = new P2PEG('optional secret');
```

Get a random binary string of a given length

```javascript
var str = p2peg.str(length);
```

Now you can use `str` as cryptographic salt, seed for PRNG, password generators
or anything else that requires unpredictable high entropy data.

Get some random integer numbers:

```javascript
var int1 = p2peg.int();
var int2 = p2peg.int16();
var int3 = p2peg.int32();
```

Get a random (base64 encoded) text of a given length

```javascript
var text = p2peg.text(length);
```

Get a random hex encoded string 

```javascript
var hex = p2peg.hex(length);
```

Get a pseudo random 32bit integer - this method is faster then int32()
for generating lots of numbers, but in turn it uses less entropy.

```javascript
var rand_int = p2peg.rand32();
```

## Advanced Usage

Before using the instance of `P2PEG` class, it is a good idea to set some properties:

Internal state file - optional.
Tip: Keep it inaccessible to other users on system by `chmod 0600 p2peg.dat`

```javascript
// @TODO
p2peg.setStateFile("/path/to/data/p2peg.dat");
```

A secret key chosen at setup

```javascript
p2peg.setSecret("some uniq secret that no one knows");
```

Seed the P2PEG with some bits of data of your choise

```javascript
p2peg.seed("some (random) string");
```

Create a (seeded) RNG

```javascript
// @TODO
var myRNG = p2peg.rng('optional seed');
var num1 = myRNG(); // a random Number from [0..1) interval
var num2 = myRNG(1,50); // a random integer from [1..50) interval

```

Write to `/dev/random` (node.js)

```javascript
// @TODO
p2peg.seedRandomDev("some (optional) entropy");
```

Get a 48bit integer (JS Number can handle integers up to 53bit long)

```javascript
var int48 = p2peg.int(6);
```

Display a random bitmap image

```javascript
// @TODO
p2peg.genImgBase64(width, height, method='rand32', itemSize=0);
```

Take care of what `method` you allow for `servImg()`,
cause it could display some private data to client.
The following methods are safe to display to client:

```javascript
var allowMethods = array('rand32', 'int','int32','int16','str','seed','text','hex','dynEntropy','clientEntropy','networkEntropy');
```

This method helps to visually inspect a random number generator (RNG).
It is not enough to know how good the RNG is, but it can tell that the RNG 
is bad or something is wrong.

Examples (PHP):
- https://duzun.me/entropy/img/rand32
- https://duzun.me/entropy/img/str


Get some entropy from outside

```javascript
// @TODO
p2peg.networkEntropy([autoseed=true]);
```

On cron event you could call

```javascript
// @TODO
p2peg.expensiveEntropy([autoseed=true]);
```

This method gathers some network entropy and server entropy and can be realy slow.
This is why it is a good idea to call it in background.
But at the same time it is a good idea to call it from time to time, 
to get some more unpredictable, crtypto-safe entropy.

 ... more comming soon


## Sample output (PHP)

https://duzun.me/entropy


## TODO

1. To improve the entropy unpredictability, I intend to create system where multiple machines periodically exchange entropy.
Each pear gets entropy and gives entropy at the same time with a simple GET request like this one:

    `curl "https://DUzun.Me/entropy/<hash(random_func().$secret)>"`

2. Seed `/dev/random` and update entropy count, to improve system performance

3. Count the amount of entropy generated

4. Test the quality of entropy



