import PageController from '../../core/PageController'
import NewDictionary from './NewDictionary'
import { fillArray, fillProgressBar, optimizeCharacters, modifyStudyLevel, checkAvailableStudyWords, attachSrsKeyboard } from '../../utils/utils'
import { spinner, feedbackArea, mascotCelebrate } from '../../utils/constants'

const BADGE_SPAN_CLASS = 'puzzle-char__badge'

export default class PuzzleTrainingPage extends PageController {

  async onMount({ speechPart } = {}) {
    this.speechPart = speechPart
    this.initDictionary = null
    this.currentDictionary = null
    this.chars = null

    const content = document.querySelector('.content')

    content.innerHTML = spinner

    this.initDictionary = await fillArray(this.speechPart)
    this.currentDictionary = await checkAvailableStudyWords({ speechPart: this.speechPart })
    this.currentDictionary.data = this.currentDictionary.data.sort(() => Math.random() - 0.5)

    content.innerHTML = `
      <div class="wrapper">
        <span class="training-counter"></span>
        <div class="progress-bar"></div>
        <div class="training-area training-area--puzzle"></div>
      </div>
    `

    this.renderPage()
  }

  renderPage() {
    const content = document.querySelector('.content')
    const rootArea = content.querySelector('.training-area')

    if (rootArea.innerHTML) rootArea.innerHTML = ''

    rootArea.innerHTML = `
      <div class="puzzle-spell-area">
        <div id="translateDiv" class="training-area__prompt"><p>${this.currentDictionary.data[0].translate}</p></div>
        <div id="wordDiv"></div>
      </div>
      <div id="charArea" class="puzzle-char-area" role="group" aria-label="Letter tiles" tabindex="0"></div>
      <div class="training-actions">
        <button class="btn btn--hint" id="suggestBtn" disabled>Get a cue</button>
        <button class="btn btn--primary" id="checkBtn" disabled>Check</button>
        <button class="btn btn--neutral" id="clearBtn">Reset</button>
      </div>
    `

    this.genRandomChars()

    const counter = content.querySelector('.training-counter')
    const completed = this.initDictionary.data.length - this.currentDictionary.data.length

    counter.textContent = `${completed} / ${this.initDictionary.data.length}`

    fillProgressBar(this.initDictionary, this.currentDictionary)

    const suggestBtn = rootArea.querySelector('#suggestBtn')
    const checkBtn = rootArea.querySelector('#checkBtn')
    const clearBtn = rootArea.querySelector('#clearBtn')

    clearBtn.disabled = false

    this.addListener(suggestBtn, 'click', (event) => this.showAnswer(event))
    this.addListener(checkBtn, 'click', (event) => this.checkEnterWord(event))
    this.addListener(clearBtn, 'click', (event) => this.clearWordProgress(event))

    const charArea = rootArea.querySelector('#charArea')

    this.addListener(charArea, 'click', (event) => this.moveCharToWordArea(event))
    this.addListener(charArea, 'keydown', (event) => this.moveCharToWordArea(event))
  }

  genRandomChars() {
    const currentWord = this.currentDictionary.data[0].word

    do {
      this.chars = currentWord.split('').sort(() => Math.random() - 0.5)
    } while (this.chars.join('') === currentWord)

    const optimizeChars = optimizeCharacters(this.chars)

    const charArea = document.querySelector('#charArea')

    charArea.style.gridTemplateColumns = `repeat(${optimizeChars.length}, minmax(40px, 80px))`

    const neededWidth = Math.max(700, Math.min(1000,
      optimizeChars.length * 40 + (optimizeChars.length - 1) * 8 + 80
    ))

    document.querySelector('.training-area--puzzle').style.width = neededWidth + 'px'

    for (let index = 0; index < optimizeChars.length; index++) {
      const charDiv = document.createElement('div')

      charDiv.classList.add('puzzle-char')

      if (optimizeChars[index].count > 1) {
        charDiv.innerHTML = `
          ${optimizeChars[index].element} <span class="${BADGE_SPAN_CLASS}">${optimizeChars[index].count}</span>
        `
      } else {
        charDiv.textContent = optimizeChars[index].element
      }

      charArea.append(charDiv)
    }

    charArea.style.outline = '0'
    charArea.focus()
  }

  clearWordProgress(event) {
    event.preventDefault()

    const suggestBtn = document.querySelector('#suggestBtn')
    const charArea = document.querySelector('#charArea')
    const wordDiv = document.querySelector('#wordDiv')

    suggestBtn.disabled = true
    charArea.innerHTML = ''
    wordDiv.innerHTML = ''

    this.genRandomChars()
  }

  showAnswer(event) {
    event.preventDefault()

    const charArea = document.querySelector('#charArea')
    const wordDiv = document.querySelector('#wordDiv')

    charArea.innerHTML = ''
    wordDiv.innerHTML = ''

    for (let index = 0; index < this.currentDictionary.data[0].word.length; index++) {
      const letter = document.createElement('div')

      letter.textContent = this.currentDictionary.data[0].word[index]
      letter.classList.add('puzzle-char')
      letter.style.position = 'relative'

      wordDiv.append(letter)
    }

    this.setTimeout(() => this.clearWordProgress(event), 1000)
  }

  moveCharToWordArea(event) {
    event.preventDefault()

    const target = event.target
    const key = event.key === ' ' ? '_' : event.key
    const charArea = document.querySelector('#charArea')
    const charsList = document.querySelectorAll('#charArea > .puzzle-char')
    const checkBtn = document.querySelector('#checkBtn')
    const clearBtn = document.querySelector('#clearBtn')
    const suggestBtn = document.querySelector('#suggestBtn')

    if (key) {
      for (let index = 0; index < charsList.length; index++) {
        if (charsList[index].textContent.trim().split(' ').join('').includes(key)) {
          this.handleKeyboardEvent(charsList[index], key)
          break
        }
      }
    }

    if (target.classList.contains('puzzle-char')) {
      this.handleKeyboardEvent(target)
    }

    if (!charArea.innerHTML) {
      suggestBtn.disabled = true
      checkBtn.disabled = false
      clearBtn.disabled = true

      if (key === 'Enter') {
        checkBtn.click()
      }
    } else if (suggestBtn.disabled) {
      suggestBtn.disabled = false
    }
  }

  handleKeyboardEvent(getChar, getKey) {
    const wordDiv = document.querySelector('#wordDiv')
    const charContent = getChar.textContent.trim().split(' ').join('')
    let key = getKey
    let count

    if (!key) {
      key = charContent.substring(0, 1)
    }

    count = Number.isInteger(+charContent.substring(2, 3)) ? charContent.substring(1, 3) : charContent.substring(1, 2)

    if (count > 1) {
      const charDiv = document.createElement('div')

      charDiv.classList.add('puzzle-char')
      charDiv.innerHTML = key
      wordDiv.append(charDiv)

      if (count > 2) {
        getChar.innerHTML = `${key} <span class="${BADGE_SPAN_CLASS}">${--count}</span>`
      } else {
        getChar.innerHTML = key
      }
    } else {
      getChar.innerHTML = key
      wordDiv.append(getChar)
    }
  }

  async checkEnterWord(event) {
    event.preventDefault()

    const resultChars = document.querySelectorAll('#wordDiv > .puzzle-char')

    let resultWord = ''

    for (let index = 0; index < this.currentDictionary.data[0].word.length; index++) {
      if (resultChars[index].textContent === '_') resultChars[index].textContent = ' '
      resultWord = resultWord.concat(resultChars[index].textContent)
    }

    if (resultWord === this.currentDictionary.data[0].word) {
      this.toggleClassForChar(resultChars)

      await new Promise((resolve) => this.setTimeout(resolve, 300))

      await this.askForRepetitionFeedback()
    } else {
      this.toggleClassForChar(resultChars, 'puzzle-char--wrong')

      await new Promise((resolve) => this.setTimeout(resolve, 300))

      await modifyStudyLevel({ studyWord: this.currentDictionary.data[0].word, resolution: 'FAIL' })

      this.clearWordProgress(event)

      const checkBtn = document.querySelector('#checkBtn')
      const clearBtn = document.querySelector('#clearBtn')

      checkBtn.disabled = true
      clearBtn.disabled = false
    }
  }

  async askForRepetitionFeedback() {
    const content = document.querySelector('.content')
    const translationText = content.querySelector('#translateDiv > p')

    translationText.textContent = 'How easy it was?'

    const wordDiv = content.querySelector('#wordDiv')

    wordDiv.innerHTML = ''
    wordDiv.style.display = 'none'

    const charArea = content.querySelector('#charArea')

    charArea.style.display = 'none'

    const puzzleSpellArea = content.querySelector('.puzzle-spell-area')

    puzzleSpellArea.style.height = 'auto'

    const btnArea = content.querySelector('.training-actions')

    btnArea.remove()

    const rootArea = content.querySelector('.training-area')

    rootArea.insertAdjacentHTML('beforeend', feedbackArea)

    const feedbackBtnArea = rootArea.querySelector('.srs-panel')
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
      NewDictionary.renderPage()
    })

    this.addListener(repeatBtn, 'click', async () => {
      const speechPart = this.speechPart

      await this.unmount()

      const next = new PuzzleTrainingPage()

      await next.mount({ speechPart })
    })
  }

  toggleClassForChar(charArray, className = 'puzzle-char--correct') {
    for (let index = 0; index < charArray.length; index++) {
      charArray[index].classList.toggle(className)
    }
  }
}
