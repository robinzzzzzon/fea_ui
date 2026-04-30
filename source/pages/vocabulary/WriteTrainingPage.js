import PageController from '../../core/PageController'
import NewDictionaryPage from './NewDictionaryPage'
import { fillArray, fillProgressBar, modifyStudyLevel, checkAvailableStudyWords, attachSrsKeyboard } from '../../utils/utils'
import { spinner, feedbackArea, system_colors, mascotCelebrate } from '../../utils/constants'

export default class WriteTrainingPage extends PageController {

  async onMount({ speechPart } = {}) {
    this.speechPart = speechPart
    this.initDictionary = null
    this.currentDictionary = null
    this.charIndex = 0

    const content = document.querySelector('.content')

    content.innerHTML = spinner

    this.initDictionary = await fillArray(this.speechPart)
    this.currentDictionary = await checkAvailableStudyWords({ speechPart: this.speechPart })
    this.currentDictionary.data = this.currentDictionary.data.sort(() => Math.random() - 0.5)

    content.innerHTML = `
      <div class="wrapper">
        <span class="training-counter"></span>
        <div class="progress-bar"></div>
        <div class="training-area training-area--write"></div>
      </div>
    `

    this.renderPage()
  }

  renderPage() {
    const content = document.querySelector('.content')
    const rootDiv = content.querySelector('.training-area')

    if (rootDiv.innerHTML) rootDiv.innerHTML = ''

    rootDiv.insertAdjacentHTML('afterbegin', `
      <div class="training-area__prompt"><p>${this.currentDictionary.data[0].translate}</p></div>
      <input type="text" class="training-input" placeholder=" Write here...">
      <div class="training-actions">
        <button class="btn btn--hint" id="suggestBtn">Get a cue</button>
        <button class="btn btn--primary" id="checkBtn">Check</button>
      </div>
    `)

    const counter = content.querySelector('.training-counter')
    const completed = this.initDictionary.data.length - this.currentDictionary.data.length

    counter.textContent = `${completed} / ${this.initDictionary.data.length}`

    fillProgressBar(this.initDictionary, this.currentDictionary)

    const writeInput = document.querySelector('.training-input')
    const suggestBtn = document.querySelector('#suggestBtn')
    const checkBtn = document.querySelector('#checkBtn')

    checkBtn.disabled = true

    writeInput.focus()

    this.addListener(writeInput, 'keydown', (event) => {
      if (event.key === 'Enter') this.checkWord(event)
    })

    this.addListener(suggestBtn, 'click', (event) => this.suggestChar(event))
    this.addListener(checkBtn, 'click', (event) => this.checkWord(event))
    this.addListener(writeInput, 'input', () => this.checkCharCount())
  }

  suggestChar(event) {
    event.preventDefault()

    this.checkCharCount()

    const input = document.querySelector('.training-input')
    const chars = this.currentDictionary.data[0].word.split('')

    if (!this.currentDictionary.data[0].word.includes(input.value) || !chars[this.charIndex]) {
      return
    }

    if (input.value.length !== this.charIndex) {
      this.charIndex = input.value.length
    }

    input.value = this.currentDictionary.data[0].word.substring(0, this.charIndex + 1)
    this.charIndex++
  }

  async checkWord(event) {
    event.preventDefault()

    const input = document.querySelector('.training-input')
    const enterWord = input.value.toLowerCase().trim()

    if (enterWord === this.currentDictionary.data[0].word || 'to'.concat(' ', enterWord) === this.currentDictionary.data[0].word) {
      input.style.backgroundColor = system_colors.success
      this.charIndex = 0

      await new Promise((resolve) => this.setTimeout(resolve, 300))

      await this.askForRepetitionFeedback()
    } else {
      input.style.backgroundColor = system_colors.failed

      await new Promise((resolve) => this.setTimeout(resolve, 300))

      await modifyStudyLevel({ studyWord: this.currentDictionary.data[0].word, resolution: 'FAIL' })

      this.clearProgress()
    }
  }

  clearProgress() {
    const input = document.querySelector('.training-input')

    input.style.backgroundColor = ''
    input.value = ''
    this.charIndex = 0

    this.checkCharCount()
  }

  checkCharCount() {
    const input = document.querySelector('.training-input')
    const checkBtn = document.querySelector('#checkBtn')
    const suggestBtn = document.querySelector('#suggestBtn')

    checkBtn.disabled = input.value.length <= 1
    suggestBtn.disabled = input.value === this.currentDictionary.data[0].word
  }

  async askForRepetitionFeedback() {
    const content = document.querySelector('.content')
    const translationText = content.querySelector('.training-area__prompt > p')

    translationText.textContent = 'How easy it was?'

    const wordInput = content.querySelector('.training-input')

    wordInput.removeAttribute('placeholder')
    wordInput.value = null
    wordInput.style.backgroundColor = system_colors.muted
    wordInput.disabled = true

    const btnArea = content.querySelector('.training-actions')

    btnArea.remove()

    const rootDiv = content.querySelector('.training-area')

    rootDiv.insertAdjacentHTML('beforeend', feedbackArea)

    const feedbackBtnArea = rootDiv.querySelector('.srs-panel')
    const cleanupSrsKeys = attachSrsKeyboard(feedbackBtnArea)

    this.addListener(feedbackBtnArea, 'click', async (event) => {
      event.preventDefault()

      if (!event.target.dataset.action) return

      cleanupSrsKeys()

      const target = event.target.closest('[data-action]')

      await modifyStudyLevel({ studyWord: this.currentDictionary.data[0].word, resolution: target.textContent })

      this.currentDictionary.data.shift()

      if (this.currentDictionary.data.length) {
        this.renderPage()
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

      const next = new WriteTrainingPage()

      await next.mount({ speechPart })
    })
  }
}
