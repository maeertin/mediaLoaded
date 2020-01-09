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
  function mediaLoaded(el, onComplete) {
    if (!el) {
      console.error('mediaLoaded: Invalid element', el)
    }

    // Find all imgs
    const images = Array.from(el.getElementsByTagName('img'))
    if (el.tagName === 'IMG') {
      images.unshift(el)
    }

    // Find all videos
    let videos = Array.from(el.getElementsByTagName('video'))
    if (el.tagName === 'VIDEO') {
      videos.unshift(el)
    }

    // Find all posters
    const posters = videos.reduce((acc, video) => {
      if (video.poster) {
        const poster = new Image()
        poster.src = video.poster
        acc.push(poster)
      }
      return acc
    }, [])

    // Filter out non autoplay videos for touch devices as video events won't
    // trigger until user interaction.
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (isTouch) {
      videos = videos.filter(video => video.autoplay)
    }

    const total = images.length + videos.length + posters.length
    let progress = 0
    let hasBroken = false

    const complete = () => {
      if (onComplete) {
        onComplete({ images, videos, posters, hasBroken, total })
      }
    }

    // Complete if no media
    if (total === 0) {
      complete()
      return
    }

    const handleMediaLoaded = event => {
      if (event) {
        event.target.removeEventListener(event.type, handleMediaLoaded)

        if (event.type === 'error') {
          hasBroken = true
        }
      }

      progress += 1

      if (progress === total) {
        complete()
      }
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
