;(function(window, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], () => factory(window))
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(window)
  } else {
    // Browser globals
    window.mediaLoaded = factory(window)
  }
})(typeof window !== 'undefined' ? window : this, function factory(window) {
  function makeArray(value) {
    if (Array.isArray(value)) {
      return value
    }

    const isArrayLike = typeof value === 'object' && typeof value.length === 'number'
    if (isArrayLike) {
      return Array.prototype.slice.call(value)
    }

    return [value]
  }

  function mediaLoaded(el, onComplete) {
    let elements = el
    if (typeof el === 'string') {
      elements = document.querySelectorAll(el)
    }

    if (!elements) {
      console.error('mediaLoaded: Invalid element', el)
      return
    }

    elements = makeArray(elements)

    let images = []
    let videos = []
    const posters = []

    // Find all videos & images
    elements.forEach(element => {
      if (element.tagName === 'IMG') {
        images.unshift(element)
      } else if (element.tagName === 'VIDEO') {
        videos.unshift(element)
      } else {
        images = images.concat(makeArray(element.getElementsByTagName('img')))
        videos = videos.concat(makeArray(element.getElementsByTagName('video')))
      }
    })

    // Find all posters
    videos.forEach(video => {
      if (video.poster) {
        const poster = new Image()
        poster.src = video.poster
        posters.push(poster)
      }
    })

    // With all posters found, filter out non autoplay videos for touch devices
    // as video events won't trigger until user interaction.
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (isTouch) {
      videos = videos.filter(video => video.autoplay)
    }

    const total = images.length + videos.length + posters.length
    let hasBroken = false
    let count = 0

    const complete = () => {
      if (onComplete) {
        onComplete({ images, videos, posters, hasBroken, total })
      }
    }

    const handleMediaLoaded = event => {
      if (event) {
        event.target.removeEventListener(event.type, handleMediaLoaded)

        if (event.type === 'error') {
          hasBroken = true
        }
      }

      count += 1

      if (total === count) {
        complete()
      }
    }

    // Complete if no media found.
    if (total === 0) {
      complete()
      return
    }

    images.concat(posters).forEach(image => {
      // Check for non-zero, non-undefined naturalWidth
      if (!image.complete || !image.naturalWidth) {
        image.addEventListener('load', handleMediaLoaded)
        image.addEventListener('error', handleMediaLoaded)
      } else {
        handleMediaLoaded()
      }
    })

    videos.forEach(video => {
      if (video.readyState < 2) {
        video.addEventListener('loadeddata', handleMediaLoaded)
        video.addEventListener('error', handleMediaLoaded)
      } else {
        handleMediaLoaded()
      }
    })
  }

  return mediaLoaded
})
