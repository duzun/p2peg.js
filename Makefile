CLOSURE = java -jar compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS

.PHONY: all test clean

all:

test:
	karma start spec/karma.conf.js

compiler.jar:
    wget -O- http://dl.google.com/closure-compiler/compiler-latest.tar.gz | tar -xz compiler.jar

min:
    $(CLOSURE) < p2peg.js > p2peg.min.js
    
clean:
    @rm -f p2peg.min.js