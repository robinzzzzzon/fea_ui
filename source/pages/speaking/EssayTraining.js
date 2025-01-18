import '../../styles/essayTraining.css'
import { getTopicList, verifyRawEssayByGpt } from '../../utils/chatGptApi'
import { spinner } from '../../utils/constants'
import { generateWords } from '../../utils/utils'

const contentRoot = document.querySelector('.content')

let topicList = []

class EssayTraining {
  async renderPage(event, config) {
    event.preventDefault()

    if (!topicList.length) {
      contentRoot.innerHTML = spinner

      topicList = await getTopicList(config)
      topicList = topicList.choices[0].message.content
        .split('[TOPIC]')
        .filter((el) => el)
    }

    contentRoot.innerHTML = `
    <div class="essayAreaRoot">
      <h3>${topicList.shift()}</h3>
      <br>
      <p>You should use these words or phrases:</p>
      <div class="phrasesRoot"></div>
      <div id="essayArea">
        <textarea class="shadow-sm" placeholder="Write your essay here..."></textarea>
      </div>
      <div class="btnContainer">
        <button class="myBtn checkBtn">Check it</button>
        <button class="myBtn nextBtn">Next topic</button>
      </div>
    </div>
    `

    const phrasesRoot = document.querySelector('.phrasesRoot')

    const wordList = generateWords(config)

    for (let index = 0; index < wordList.length; index++) {
      const phrase = document.createElement('div')
      phrase.setAttribute('id', 'phrase')
      phrase.textContent = wordList[index].word
      phrasesRoot.append(phrase)
    }

    phrasesRoot.addEventListener('click', (event) => {
      const target = event.target.closest('div')

      if (target.id !== 'phrase') return

      target.style.backgroundColor = '#DCDCDC'
    })

    const checkBtn = document.querySelector('.checkBtn')
    checkBtn.addEventListener(
      'click',
      async () => await this.verifyEssayByGpt(event, config)
    )

    const nextBtn = document.querySelector('.nextBtn')
    nextBtn.addEventListener(
      'click',
      async () => await this.renderPage(event, config)
    )
  }

  async verifyEssayByGpt(event, config) {
    event.preventDefault()

    const textArea = document.querySelector('#essayArea > textArea')

    if (textArea.value) {
      const topicText = document.querySelector('.essayAreaRoot > h3')

      let gptAnalysis = await verifyRawEssayByGpt(
        topicText.textContent,
        textArea.value,
        config
      )

      gptAnalysis = gptAnalysis.choices[0].message.content

      textArea.value = `${textArea.value} 
                        ================= 
                        ${gptAnalysis}`
    }
  }
}

export default new EssayTraining()
