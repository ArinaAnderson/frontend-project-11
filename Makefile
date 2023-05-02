install:
	npm ci

build:
	npm run build

develop:
	npx webpack serve

lint:
	npx eslint .

.PHONY: test
