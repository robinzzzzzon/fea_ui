import PageController from '../../core/PageController'
import { setTimer, generateWords } from '../../utils/utils'
import { getTopicList } from '../../utils/chatGptApi'
import { spinner } from '../../utils/constants'

export default class FreeSpeakingTrainingPage extends PageController {

  async onMount({ config } = {}) {
    this.config = config
    this.topicList = []

    await this.renderPage()
  }

  async renderPage() {
    const contentRoot = document.querySelector('.content')

    if (!this.topicList.length) {
      contentRoot.innerHTML = spinner

      let response = await getTopicList(this.config)

      this.topicList = response.choices[0].message.content
        .split('[TOPIC]')
        .filter((element) => element)
    }

    contentRoot.innerHTML = `
      <div class="speakingAreaRoot">
        <h3>${this.topicList.shift()}</h3>
        <br>
        <p>You should use these words or phrases:</p>
        <div class="availablePhrases"></div>
        <div id="timer"></div>
        <button class="btn btn--secondary nextBtn">Next</button>
      </div>
    `

    if (this.config.needTimer) {
      const timer = document.querySelector('#timer')

      setTimer(timer)
    }

    const phrasesRoot = document.querySelector('.availablePhrases')
    const wordList = generateWords(this.config)

    for (let index = 0; index < wordList.length; index++) {
      const phrase = document.createElement('div')

      phrase.setAttribute('id', 'phrase')
      phrase.textContent = wordList[index].word
      phrasesRoot.append(phrase)
    }

    this.addListener(phrasesRoot, 'click', (event) => {
      const target = event.target.closest('div')

      if (target.id !== 'phrase') return

      target.style.backgroundColor = '#DCDCDC'
    })

    const nextBtn = document.querySelector('.nextBtn')

    this.addListener(nextBtn, 'click', () => this.renderPage())
  }
}
