# mediaLoaded

A simple utility for checking whether images, videos and/or video posters have been loaded. Inspired by [imagesLoaded](https://github.com/desandro/imagesloaded).

Sidenote:
On touch devices, all videos that don't autoplay will be ignored as video events won't trigger until user interaction.

Install with [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/):

```bash
# via npm
npm install @maeertin/medialoaded

# or Yarn
yarn add @maeertin/medialoaded
```

Usage:

```js
import mediaLoaded from '@maeertin/medialoaded'

// Single node as target argument
const element = document.querySelector('#container')
mediaLoaded(element, instance => {
  console.log('All media loaded', instance)
})

// nodeList as target argument
const elements = document.querySelectorAll('.post')
mediaLoaded(elements, instance => {
  console.log('All media loaded', instance)
})

// String selector as target argument
mediaLoaded('.post', instance => {
  console.log('All media loaded', instance)
})
```
