import FreeSpeakingConfiguration from './FreeSpeakingConfiguration'
import TranslationConfiguration from './TranslationConfiguration'
import EssayConfiguration from './EssayConfiguration'

class SpeakingSection {
  renderPage(event) {
    event.preventDefault()
    
    const actionRoot = document.querySelector('.actionRoot')
    
    actionRoot.innerHTML = `
      <button class="dictionary initItem shadow-lg" data-name="translation">TRANSLATION</button>
      <button class="dictionary initItem shadow-lg" data-name="speaking">FREE SPEAKING</button>
      <button class="dictionary initItem shadow-lg" data-name="essay">ESSAY WRITING</button>
    `
  
    actionRoot.addEventListener('click', this.renderNextPage)
  }

  renderNextPage(event) {
    if (!event.target.dataset.name) return
  
    const name = event.target.dataset.name
  
    if (name === 'speaking') {
      FreeSpeakingConfiguration.renderPage(event)
    } else if (name === 'translation') {
      TranslationConfiguration.renderPage(event)
    } else if (name === 'essay') {
      EssayConfiguration.renderPage(event)
    }
  }
}

export default new SpeakingSection()