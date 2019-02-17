.PHONY: clean

all: Keybook.json

clean:
	rm Keybook.json

Keybook.json: Keybook.sol
	solc Keybook.sol --combined-json abi,bin > Keybook.json
	cp Keybook.json ../frontend/Keybook.json
