import PageController from '../../core/PageController'
import { getTopicList, verifyRawEssayByGpt } from '../../utils/chatGptApi'
import { spinner } from '../../utils/constants'
import { generateWords } from '../../utils/utils'

export default class EssayTrainingPage extends PageController {

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
      <div class="essayAreaRoot">
        <h3>${this.topicList.shift()}</h3>
        <br>
        <p>You should use these words or phrases:</p>
        <div class="phrasesRoot"></div>
        <div id="essayArea">
          <textarea placeholder="Write your essay here..."></textarea>
        </div>
        <div class="btnContainer">
          <button class="btn btn--primary checkBtn">Check it</button>
          <button class="btn btn--secondary nextBtn">Next topic</button>
        </div>
      </div>
    `

    const phrasesRoot = document.querySelector('.phrasesRoot')
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

    const checkBtn = document.querySelector('.checkBtn')

    this.addListener(checkBtn, 'click', () => this.verifyEssayByGpt())

    const nextBtn = document.querySelector('.nextBtn')

    this.addListener(nextBtn, 'click', () => this.renderPage())
  }

  async verifyEssayByGpt() {
    const textArea = document.querySelector('#essayArea > textArea')

    if (!textArea.value) return

    const topicText = document.querySelector('.essayAreaRoot > h3')

    let gptAnalysis = await verifyRawEssayByGpt(
      topicText.textContent,
      textArea.value,
      this.config
    )

    gptAnalysis = gptAnalysis.choices[0].message.content

    textArea.value = `${textArea.value}
                      =================
                      ${gptAnalysis}`
  }
}
