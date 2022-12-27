install:
	npm ci

build:
	rm -rf dist
	NODE_ENV=production NODE_OPTIONS=--openssl-legacy-provider npx webpack

develop:
	npx webpack serve

lint:
	npx eslint .

