const DEFAULT_DURATION = 4000

let containerNode = null

function ensureContainer() {
  if (containerNode && document.body.contains(containerNode)) return containerNode

  containerNode = document.createElement('div')
  containerNode.classList.add('toast-container')
  document.body.appendChild(containerNode)

  return containerNode
}

function dismiss(toastNode) {
  if (!toastNode || !toastNode.parentNode) return

  toastNode.classList.add('toast--exit')

  setTimeout(() => {
    if (toastNode.parentNode) toastNode.parentNode.removeChild(toastNode)
  }, 200)
}

export function showToast({ message, type = 'info', duration = DEFAULT_DURATION } = {}) {
  if (!message) return

  const container = ensureContainer()

  const toast = document.createElement('div')

  toast.classList.add('toast', `toast--${type}`)
  toast.setAttribute('role', 'alert')
  toast.innerHTML = `
    <span class="toast__message"></span>
    <button type="button" class="toast__close" aria-label="Close">&times;</button>
  `

  toast.querySelector('.toast__message').textContent = message

  const closeBtn = toast.querySelector('.toast__close')

  closeBtn.addEventListener('click', () => dismiss(toast))

  container.appendChild(toast)

  if (duration > 0) {
    setTimeout(() => dismiss(toast), duration)
  }

  return toast
}
