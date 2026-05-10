const STORAGE_KEY = 'memonk-theme'
const SUN_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2"/><path d="M12 20v2"/>
    <path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/>
    <path d="M2 12h2"/><path d="M20 12h2"/>
    <path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
  </svg>
`
const MOON_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
  </svg>
`

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (stored === 'light' || stored === 'dark') return stored
  } catch (_ignored) { /* localStorage unavailable */ }

  return null
}

function writeStoredTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch (_ignored) { /* localStorage unavailable */ }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
}

function currentTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export function mountThemeToggle() {
  const slot = document.querySelector('.site-header__theme-toggle')

  if (!slot) return

  const button = document.createElement('button')

  button.type = 'button'
  button.classList.add('theme-toggle')
  button.setAttribute('aria-label', 'Toggle theme')
  button.innerHTML = `
    <span class="theme-toggle__icon theme-toggle__icon--sun">${SUN_ICON}</span>
    <span class="theme-toggle__icon theme-toggle__icon--moon">${MOON_ICON}</span>
  `

  button.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark'

    applyTheme(next)
    writeStoredTheme(next)
  })

  slot.appendChild(button)

  if (!readStoredTheme() && window.matchMedia) {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')

    mql.addEventListener('change', (event) => {
      if (readStoredTheme()) return
      applyTheme(event.matches ? 'dark' : 'light')
    })
  }
}
