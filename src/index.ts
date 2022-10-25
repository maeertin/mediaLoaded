export type MLTarget = Element | Element[] | NodeListOf<Element> | string

export interface MLInstance {
  images: HTMLImageElement[]
  videos: HTMLVideoElement[]
  posters: HTMLImageElement[]
  hasBroken: boolean
  total: number
}

export type MLCallback = (instance: MLInstance) => void

export function makeArray(value: any) {
  if (Array.isArray(value)) {
    return value
  }

  const isArrayLike = value && typeof value === 'object' && 'length' in value
  if (isArrayLike) {
    return Array.prototype.slice.call(value)
  }

  return [value]
}

export default function mediaLoaded(target: MLTarget, onComplete: MLCallback): void {
  if (!target) {
    console.error('mediaLoaded: Invalid target', target)
    return
  }

  let elements = target
  if (typeof target === 'string') {
    elements = document.querySelectorAll(target)
  }

  const elementsArr = makeArray(elements)

  let images: HTMLImageElement[] = []
  let videos: HTMLVideoElement[] = []
  const posters: HTMLImageElement[] = []

  // Find all videos & images
  elementsArr.forEach((element) => {
    if (element instanceof HTMLImageElement) {
      images.unshift(element)
    } else if (element instanceof HTMLVideoElement) {
      videos.unshift(element)
    } else {
      images = images.concat(makeArray(element.getElementsByTagName('img')))
      videos = videos.concat(makeArray(element.getElementsByTagName('video')))
    }
  })

  // Find all posters
  videos.forEach((video) => {
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
    videos = videos.filter((video) => video.autoplay)
  }

  const total = images.length + videos.length + posters.length
  let hasBroken = false
  let count = 0

  const complete = () => {
    if (onComplete) {
      onComplete({
        images,
        videos,
        posters,
        hasBroken,
        total,
      })
    }
  }

  const handleMediaLoaded = (event?: Event | undefined) => {
    if (event && event.target) {
      event.target.removeEventListener(event.type, handleMediaLoaded)
    }

    if (event && event.type === 'error') {
      hasBroken = true
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

  images.concat(posters).forEach((image) => {
    // Check for non-zero, non-undefined naturalWidth
    if (!image.complete || !image.naturalWidth) {
      image.addEventListener('load', handleMediaLoaded)
      image.addEventListener('error', handleMediaLoaded)
    } else {
      handleMediaLoaded()
    }
  })

  videos.forEach((video) => {
    if (video.readyState < 2) {
      video.addEventListener('loadeddata', handleMediaLoaded)
      video.addEventListener('error', handleMediaLoaded)
    } else {
      handleMediaLoaded()
    }
  })
}