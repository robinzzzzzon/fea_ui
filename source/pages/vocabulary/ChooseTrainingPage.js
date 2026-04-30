import PageController from '../../core/PageController'
import NewDictionaryPage from './NewDictionaryPage'
import { makeRequest, fillArray, fillProgressBar, modifyStudyLevel, checkAvailableStudyWords, attachSrsKeyboard } from '../../utils/utils'
import { domain, spinner, feedbackArea, system_colors, mascotCelebrate } from '../../utils/constants'

export default class ChooseTrainingPage extends PageController {

  async onMount({ speechPart } = {}) {
    this.speechPart = speechPart
    this.initDictionary = null
    this.currentDictionary = null
    this.fullDictionary = null

    const content = document.querySelector('.content')

    content.innerHTML = spinner

    this.initDictionary = await fillArray(this.speechPart)
    this.currentDictionary = await checkAvailableStudyWords({ speechPart: this.speechPart })
    this.currentDictionary.data = this.currentDictionary.data.sort(() => Math.random() - 0.5)

    content.innerHTML = `
      <div class="wrapper">
        <span class="training-counter"></span>
        <div class="progress-bar"></div>
        <div class="training-area training-area--choose">
          <div id="wordItem" class="training-area__word"></div>
          <div class="choice-grid"></div>
        </div>
      </div>
    `

    const trainArea = content.querySelector('.training-area')

    this.addListener(trainArea, 'click', (event) => this.validateChosenWord(event))

    this.addListener(document, 'keydown', (event) => {
      const items = document.querySelectorAll('.choice-item')

      if (!items.length) return

      const idx = parseInt(event.key) - 1

      if (idx >= 0 && idx < items.length) items[idx]?.click()
    })

    this.renderPage()
  }

  async renderPage() {
    const content = document.querySelector('.content')
    const translateArray = await this.getRandomTranslateArray(this.currentDictionary.data[0])

    const wordItem = content.querySelector('#wordItem')
    wordItem.innerHTML = `<p>${this.currentDictionary.data[0].word}</p>`

    let itemArea = content.querySelector('.choice-grid')

    if (!itemArea) {
      const feedbackBtnArea = content.querySelector('.srs-panel')
      feedbackBtnArea.remove()

      const trainArea = content.querySelector('.training-area')
      trainArea.insertAdjacentHTML('beforeend', '<div class="choice-grid"></div>')

      itemArea = content.querySelector('.choice-grid')
    }

    itemArea.innerHTML = `
      <div class="choice-item"><p>${translateArray[0]}</p></div>
      <div class="choice-item"><p>${translateArray[1]}</p></div>
      <div class="choice-item"><p>${translateArray[2]}</p></div>
      <div class="choice-item"><p>${translateArray[3]}</p></div>
    `

    const counter = content.querySelector('.training-counter')
    const completed = this.initDictionary.data.length - this.currentDictionary.data.length

    counter.textContent = `${completed} / ${this.initDictionary.data.length}`

    fillProgressBar(this.initDictionary, this.currentDictionary)
  }

  async getRandomTranslateArray(studyWord) {
    if (!this.fullDictionary) {
      this.fullDictionary = await makeRequest({
        methodType: 'GET',
        getUrl: `${domain}/words/init/`,
      })
    }

    const getTranslate = studyWord.translate
    const translateArray = []

    for (let index = 0; translateArray.length < 3; index++) {
      const translate = this.fullDictionary.data[Math.floor(Math.random() * this.fullDictionary.data.length)].translate

      if (!translateArray.includes(translate) && translate !== getTranslate) {
        translateArray.push(translate)
      }
    }

    translateArray.push(getTranslate)

    return translateArray.sort(() => Math.random() - 0.5)
  }

  async validateChosenWord(event) {
    event.preventDefault()

    const chooseWord = event.target.closest('.choice-item')

    if (!chooseWord) return

    if (chooseWord.textContent === this.currentDictionary.data[0].translate) {
      chooseWord.style.backgroundColor = system_colors.success

      await new Promise((resolve) => this.setTimeout(resolve, 300))

      await this.askForRepetitionFeedback()
    } else {
      chooseWord.style.backgroundColor = system_colors.failed

      await new Promise((resolve) => this.setTimeout(resolve, 300))

      await modifyStudyLevel({ studyWord: this.currentDictionary.data[0].word, resolution: 'FAIL' })

      await this.renderPage()
    }
  }

  async askForRepetitionFeedback() {
    const content = document.querySelector('.content')
    const wordItem = document.querySelector('#wordItem')

    wordItem.textContent = 'How easy it was?'

    const itemArea = document.querySelector('.choice-grid')
    itemArea.remove()

    const trainArea = content.querySelector('.training-area')
    trainArea.insertAdjacentHTML('beforeend', feedbackArea)

    const feedbackBtnArea = trainArea.querySelector('.srs-panel')
    const cleanupSrsKeys = attachSrsKeyboard(feedbackBtnArea)

    this.addListener(feedbackBtnArea, 'click', async (event) => {
      event.preventDefault()

      if (!event.target.dataset.action) return

      cleanupSrsKeys()

      const target = event.target.closest('[data-action]')

      await modifyStudyLevel({ studyWord: this.currentDictionary.data[0].word, resolution: target.textContent })

      this.currentDictionary.data.shift()

      if (this.currentDictionary.data.length) {
        await this.renderPage()
      } else {
        await this.renderEndScreen()
      }
    })
  }

  async renderEndScreen() {
    const content = document.querySelector('.content')

    content.innerHTML = `
      <div class="wrapper">
        <div class="progress-bar"></div>
        <div class="training-area">
          <div class="mascot-state">
            ${mascotCelebrate}
            <p class="mascot-state__title">Nice work!</p>
            <p class="mascot-state__text">Want to go again?</p>
          </div>
          <div class="srs-panel">
            <button type="button" class="btn btn--hint" id="findNewBtn">New words</button>
            <button type="button" class="btn btn--sage" id="repeatBtn">Repeat</button>
          </div>
        </div>
      </div>
    `

    const findNewBtn = document.querySelector('#findNewBtn')
    const repeatBtn = document.querySelector('#repeatBtn')

    const remainedStudyList = await checkAvailableStudyWords({ speechPart: this.speechPart })

    if (!remainedStudyList.data.length) repeatBtn.disabled = true

    this.addListener(findNewBtn, 'click', async () => {
      await this.unmount()

      const next = new NewDictionaryPage()

      await next.mount()
    })

    this.addListener(repeatBtn, 'click', async () => {
      const speechPart = this.speechPart

      await this.unmount()

      const next = new ChooseTrainingPage()

      await next.mount({ speechPart })
    })
  }
}
