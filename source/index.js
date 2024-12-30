import './styles/indexStyles.css'
import './styles/commonStyles.css'
import './bootstrap/btstrp_css/bootstrap.min.css'
import SpeakingSection from './pages/speaking/SpeakingSection'
import VocabularySection from './pages/vocabulary/VocabularySection'

const actionRoot = document.querySelector('.actionRoot')

actionRoot.addEventListener('click', renderNextPage)

async function renderNextPage(event) {
  event.preventDefault()

  if (!event.target.dataset.name) return

  const name = event.target.dataset.name

  if (name === 'vocabulary') {
    await VocabularySection.renderPage(event)
  } else if (name === 'speaking') {
    SpeakingSection.renderPage(event)
  }
}
