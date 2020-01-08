;(function(window, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory)
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory()
  } else {
    // Browser globals
    window.mediaLoaded = factory()
  }
})(typeof window !== 'undefined' ? window : this, function factory() {
  function mediaLoaded(el, onComplete) {
    if (!el) {
      console.error(`mediaLoaded: Bad element ${el}`)
    }

    // Find all imgs
    const images = Array.from(el.getElementsByTagName('img'))
    if (el.tagName === 'IMG') {
      images.unshift(el)
    }

    // Find all videos
    const videos = Array.from(el.getElementsByTagName('video'))
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

    const total = images.length + videos.length + posters.length
    let progress = 0

    const handleComplete = () => {
      if (onComplete) {
        onComplete({ images, videos, posters, total })
      }
    }

    // Complete if no media
    if (total === 0) {
      handleComplete()
      return
    }

    const handleMediaLoaded = event => {
      if (event) {
        event.target.removeEventListener(event.type, handleMediaLoaded)
      }

      progress += 1

      if (progress === total) {
        handleComplete()
      }
    }

    images.concat(posters).forEach(image => {
      // Check for non-zero, non-undefined naturalWidth
      if (!image.complete || !image.naturalWidth) {
        image.addEventListener('load', handleMediaLoaded)
      } else {
        handleMediaLoaded()
      }
    })

    videos.forEach(video => {
      if (video.readyState < 2) {
        video.addEventListener('loadeddata', handleMediaLoaded)
      } else {
        handleMediaLoaded()
      }
    })
  }

  return mediaLoaded
})
