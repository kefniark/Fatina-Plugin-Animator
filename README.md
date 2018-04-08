![Logo](logo.png)

# Fatina Helpers
Small & Light tweening library for **Games** / **Web**

* **Website**: [Here](https://kefniark.github.io/Fatina/)
* **API**: [Here](https://kefniark.github.io/Fatina/api/basic/)
* **Samples**: [Here](https://kefniark.github.io/Fatina/samples/generic/)

[![NPM Version](https://img.shields.io/npm/v/fatina-plugin-animator.svg)](https://npmjs.org/package/fatina-plugin-animator)
[![NPM Downloads](https://img.shields.io/npm/dm/fatina-plugin-animator.svg)](https://npmjs.org/package/fatina-plugin-animator)
[![Build Status](https://img.shields.io/travis/kefniark/Fatina-Plugin-Animator.svg)](https://travis-ci.org/kefniark/Fatina-Plugin-Animator)
[![Coverage Status](https://coveralls.io/repos/github/kefniark/Fatina-Plugin-Animator/badge.svg?branch=master)](https://coveralls.io/github/kefniark/Fatina-Plugin-Animator?branch=master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/d829934eb7014fd191c0777ecfe11acd)](https://www.codacy.com/app/kefniark/Fatina-Plugin-Animator?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=kefniark/Fatina-Plugin-Animator&amp;utm_campaign=Badge_Grade)
[![License](https://img.shields.io/npm/l/fatina-plugin-animator.svg)](https://npmjs.org/package/fatina-plugin-animator)

## Description
This plugin provide tools to manage and use animations in **html5** games any library (pixi, phaser, ...)

This is split in two parts:
* AnimationManager: use to store/instantiate animations and manage tickers
* Animator: Component added to an object to animate.

**This plugin requires Fatina** : [Here](https://github.com/kefniark/Fatina)

## Getting Started

### Install
If you use directly the minified version
```ts
<script src="fatina-plugin-animator.min.js"></script>
```
Or if you use NPM
```ts
> npm install fatina-plugin-animator
```

### Init
```ts
// standard node.js require
var FatinaPluginAnimator = require('fatina-plugin-animator');
// OR
// standard import with typescript (typed version)
import * as FatinaPluginAnimator from 'fatina-plugin-animator';
```

and initialize (add this plugin to **Fatina**)
```ts
Fatina.init();
Fatina.loadPlugin(FatinaPluginAnimator.get());
```

* [Documentation](https://kefniark.github.io/Fatina/plugins/animator-api/)
* [Samples](https://kefniark.github.io/Fatina/plugins/animator/)