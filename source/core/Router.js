import PageController from './PageController'

const FALLBACK_404 = (name) => `
  <div class="page-error">
    <p>Unknown route: <b>${escapeText(name)}</b></p>
    <button type="button" class="btn btn--primary" data-name="home">Home</button>
  </div>
`

const FALLBACK_ERROR = (name) => `
  <div class="page-error">
    <p>Failed to load <b>${escapeText(name)}</b>.</p>
    <button type="button" class="btn btn--primary" data-name="home">Home</button>
  </div>
`

function escapeText(text) {
  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;',
  }

  return String(text).replace(/[&<>"']/g, (char) => escapeMap[char])
}

class LegacyPageAdapter extends PageController {
  constructor(singleton, name) {
    super()

    this._singleton = singleton
    this._routeName = name
    this._warned = false
  }

  async onMount(params = {}) {
    const event = params.event || {
      preventDefault() {},
      target: { dataset: {} },
    }

    if (typeof this._singleton.initPage === 'function') {
      await this._singleton.initPage(this._routeName)
    } else if (typeof this._singleton.renderPage === 'function') {
      await this._singleton.renderPage(event)
    } else {
      throw new Error(`[Router] legacy page "${this._routeName}" has no renderPage/initPage`)
    }
  }

  async onUnmount() {
    if (this._warned) return

    this._warned = true
    console.warn(`[Router] legacy page "${this._routeName}" has no cleanup — listeners may leak until migrated`)
  }
}

export default class Router {
  constructor({ root, routes = [], fallback404, fallbackError } = {}) {
    if (!root) throw new Error('[Router] root element is required')

    this._root = root
    this._routes = new Map()

    this._currentPage = null
    this._currentName = null
    this._navToken = 0
    this._started = false

    this._fallback404 = fallback404 || FALLBACK_404
    this._fallbackError = fallbackError || FALLBACK_ERROR

    routes.forEach((route) => this.register(route.name, route.controller))

    this._onRootClick = this._onRootClick.bind(this)
  }

  register(name, controller) {
    if (!name || !controller) {
      throw new Error('[Router] register requires name and controller')
    }

    this._routes.set(name, controller)
  }

  get currentName() { return this._currentName }

  get currentPage() { return this._currentPage }

  start() {
    if (this._started) return

    this._started = true
    this._root.addEventListener('click', this._onRootClick)
  }

  stop() {
    if (!this._started) return

    this._started = false
    this._root.removeEventListener('click', this._onRootClick)
  }

  async navigate(name, params = {}) {
    const token = ++this._navToken

    if (this._currentPage) {
      try {
        await this._currentPage.unmount()
      } catch (error) {
        console.error('[Router] unmount threw', error)
      }

      if (token !== this._navToken) return

      this._currentPage = null
      this._currentName = null
    }

    if (!this._routes.has(name)) {
      this._render404(name)
      return
    }

    let page

    try {
      page = this._instantiate(name)

      this._currentPage = page
      this._currentName = name

      await page.mount(params)

      if (token !== this._navToken) {
        try {
          await page.unmount()
        } catch (_ignored) { /* noop */ }

        return
      }
    } catch (error) {
      console.error(`[Router] mount failed for "${name}"`, error)

      this._currentPage = null
      this._currentName = null

      this._renderError(name)
    }
  }

  _instantiate(name) {
    const entry = this._routes.get(name)

    // PageController subclass — construct a new instance per mount
    if (typeof entry === 'function' && entry.prototype instanceof PageController) {
      return new entry()
    }

    // PageController instance — already constructed (mostly for tests)
    if (entry instanceof PageController) return entry

    // Legacy singleton — wrap in adapter so lifecycle still works
    return new LegacyPageAdapter(entry, name)
  }

  _onRootClick(event) {
    const target = event.target.closest('[data-name]')
    if (!target) return

    const name = target.dataset.name
    if (!this._routes.has(name)) return // let page-local handlers take it

    event.preventDefault()

    this.navigate(name, { event, target })
  }

  _render404(name) {
    this._root.innerHTML = this._fallback404(name)
  }

  _renderError(name) {
    this._root.innerHTML = this._fallbackError(name)
  }
}
