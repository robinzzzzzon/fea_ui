import './styles/main.css'
import VocabularySection from './pages/vocabulary/VocabularySection'
import SpeakingSection from './pages/speaking/SpeakingSection'

const lContainer = document.querySelector('.l-container')

lContainer.addEventListener('click', renderNextPage)

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
