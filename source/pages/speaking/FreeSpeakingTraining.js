import '../../styles/freeSpeakingTraining.css'
import { setTimer, generateWords } from '../../utils/utils'
import { getTopicList } from '../../utils/chatGptApi'
import { spinner } from '../../utils/constants'

const contentRoot = document.querySelector('.content')

let topicList = []

class FreeSpeakingTraining {
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
    <div class="speakingAreaRoot">
      <h3>${topicList.shift()}</h3>
      <br>
      <p>You should use these words or phrases:</p>
      <div class="availablePhrases"></div>
      <div id="timer"></div>
      <button class="myBtn nextBtn">Next</button>
    </div>
    `

    if (config.needTimer) {
      const timer = document.querySelector('#timer')

      setTimer(timer)
    }

    const phrasesRoot = document.querySelector('.availablePhrases')

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

    const nextBtn = document.querySelector('.nextBtn')
    nextBtn.addEventListener(
      'click',
      async () => await this.renderPage(event, config)
    )
  }
}

export default new FreeSpeakingTraining()
