import PageController from '../../core/PageController'
import FreeSpeakingConfigurationPage from './FreeSpeakingConfigurationPage'
import EssayConfigurationPage from './EssayConfigurationPage'

export default class SpeakingSectionPage extends PageController {

  async onMount() {
    const lContainer = document.querySelector('.l-container')

    lContainer.innerHTML = `
      <button class="nav-card" data-name="freeSpeaking">FREE SPEAKING</button>
      <button class="nav-card" data-name="essay">ESSAY WRITING</button>
    `

    this.addListener(lContainer, 'click', (event) => this.renderNextPage(event))
  }

  async renderNextPage(event) {
    if (!event.target.dataset.name) return

    const name = event.target.dataset.name

    if (name === 'freeSpeaking' || name === 'essay') {
      await this.unmount()
    }

    if (name === 'freeSpeaking') {
      const page = new FreeSpeakingConfigurationPage()

      await page.mount()
    } else if (name === 'essay') {
      const page = new EssayConfigurationPage()

      await page.mount()
    }
  }
}
