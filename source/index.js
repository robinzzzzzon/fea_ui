import './styles/main.css'
import Router from './core/Router'
import VocabularySectionPage from './pages/vocabulary/VocabularySectionPage'
import SpeakingSection from './pages/speaking/SpeakingSection'

const router = new Router({
  root: document.querySelector('.l-container'),
  routes: [
    { name: 'vocabulary', controller: VocabularySectionPage },
    { name: 'speaking',   controller: SpeakingSection },
  ],
})

router.start()

if (process.env.NODE_ENV !== 'production') window.__router = router
