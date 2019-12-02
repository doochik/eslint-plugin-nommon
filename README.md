[![npm version](https://badge.fury.io/js/eslint-plugin-nommon.svg)](https://badge.fury.io/js/eslint-plugin-nommon)
[![Build Status](https://travis-ci.org/doochik/eslint-plugin-nommon.svg?branch=master)](https://travis-ci.org/doochik/eslint-plugin-nommon)

# eslint-plugin-nommon

ESLint plugin for [nommon](https://github.com/pasaran/nommon)

## Installation

```
$ npm install eslint-plugin-nommon --save-dev
```

## Usage

Add `eslint-plugin-nommon` to the plugins section of your `.eslintrc` configuration file:

```json
{
    "plugins": [
        "eslint-plugin-nommon"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "nommon/no-dynamic-jpath": "error"
    }
}
```

### Rule "nommon/no-dynamic-jpath"

**autofixable**

`nommon/no-dynamic-jpath` disallow JS variables in no.jpath().

**Motivation**: `no.jpath(<jpath>)` compiles given `jpath` to native JS function and stores it in cache.
Dynamic `jpath` may increase memory usage and decrease application performance due to `jpath` compilation.
You should use only static strings in `jpath`. 

Bad examples:
```javascript
no.jpath('.foo.' + bar, data);

no.jpath(`.foo.${ bar }`, data);

no.jpath(`.foo{ .bar === "${ baz }"`, data);
```

Good examples:
```javascript
no.jpath('.foo' + '.bar', data);

no.jpath('.foo[bar]', data, { bar });

no.jpath('.foo{ .bar === baz}', data, { baz });
```
