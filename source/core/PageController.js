export default class PageController {
  constructor() {
    this._mounted = false
    this._controller = null
  }

  get isMounted() {
    return this._mounted
  }

  get signal() {
    return this._controller ? this._controller.signal : null
  }

  async mount(params) {
    if (this._mounted) {
      console.warn('[PageController] mount called while already mounted; ignored')
      return
    }

    this._mounted = true
    this._controller = new AbortController()

    try {
      await this.onMount(params)
    } catch (error) {
      try {
        this._controller.abort()
      } catch (_ignored) { /* noop */ }

      this._mounted = false
      this._controller = null

      throw error
    }
  }

  async unmount() {
    if (!this._mounted) return

    this._mounted = false

    const controller = this._controller
    this._controller = null

    try {
      controller.abort()
    } catch (error) {
      console.error('[PageController] abort threw', error)
    }

    try {
      await this.onUnmount()
    } catch (error) {
      console.error('[PageController] onUnmount threw', error)
    }
  }

  async onMount(_params) { /* override */ }

  async onUnmount() { /* override */ }

  addListener(element, event, handler, options = {}) {
    if (!this._mounted) {
      throw new Error('[PageController] addListener called before mount')
    }

    element.addEventListener(event, handler, { ...options, signal: this._controller.signal })
  }

  setTimeout(callback, delayMs) {
    if (!this._mounted || this._controller.signal.aborted) return -1

    const timerId = window.setTimeout(() => {
      if (!this._controller || this._controller.signal.aborted) return

      callback()
    }, delayMs)

    this._controller.signal.addEventListener('abort', () => clearTimeout(timerId), { once: true })

    return timerId
  }

  setInterval(callback, delayMs) {
    if (!this._mounted || this._controller.signal.aborted) return -1

    const timerId = window.setInterval(() => {
      if (!this._controller || this._controller.signal.aborted) return

      callback()
    }, delayMs)

    this._controller.signal.addEventListener('abort', () => clearInterval(timerId), { once: true })

    return timerId
  }

  fetch(url, options = {}) {
    if (!this._mounted) {
      throw new Error('[PageController] fetch called before mount')
    }

    return window.fetch(url, { ...options, signal: this._controller.signal })
  }

  // XSS-boundary marker. Phase 6.3 will introduce sanitization.
  // Contract: `trustedTemplate` must come from source/utils/constants.js
  // or a template literal with no user-controlled substitutions.
  setHTML(element, trustedTemplate) {
    element.innerHTML = trustedTemplate
  }
}
