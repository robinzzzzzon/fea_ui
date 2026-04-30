import './styles/main.css'
import Router from './core/Router'
import VocabularySectionPage from './pages/vocabulary/VocabularySectionPage'
import SpeakingSectionPage from './pages/speaking/SpeakingSectionPage'

const router = new Router({
  root: document.querySelector('.l-container'),
  routes: [
    { name: 'vocabulary', controller: VocabularySectionPage },
    { name: 'speaking',   controller: SpeakingSectionPage },
  ],
})

router.start()

if (process.env.NODE_ENV !== 'production') window.__router = router
