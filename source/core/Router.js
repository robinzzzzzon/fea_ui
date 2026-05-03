import PageController from './PageController'
import { showToast } from '../components/toast'

export default class Router {
  constructor({ root, routes = [] } = {}) {
    if (!root) throw new Error('[Router] root element is required')

    this._root = root
    this._initialRootHTML = root.innerHTML
    this._routes = new Map()

    this._currentPage = null
    this._currentName = null
    this._navToken = 0
    this._started = false

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
      this._restoreHome()
      showToast({ message: `Unknown page: ${name}`, type: 'error' })
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

      this._restoreHome()
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

    throw new Error(`[Router] route "${name}" must be a PageController subclass or instance`)
  }

  _onRootClick(event) {
    const target = event.target.closest('[data-name]')
    if (!target) return

    const name = target.dataset.name
    if (!this._routes.has(name)) return // let page-local handlers take it

    event.preventDefault()

    this.navigate(name, { event, target })
  }

  _restoreHome() {
    this._root.innerHTML = this._initialRootHTML
  }
}
