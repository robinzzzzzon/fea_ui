import PageController from '../../core/PageController'
import NewDictionary from './NewDictionary'
import TrainingList from './TrainingList'
import { makeRequest, filterCurrentDictionary, attachModalKeyboard } from '../../utils/utils'
import { domain, spinner, alphabetList, getModalWindow, mascotEncourage, mascotAllDone } from '../../utils/constants'

export default class SeekNewWordPage extends PageController {

  async onMount({ speechPart } = {}) {
    this.speechPart = speechPart
    this.wordIndex = 0
    this.studyWordCounter = 0
    this.currentDictionary = []
    this._interactionsMuted = false

    const content = document.querySelector('.content')

    content.innerHTML = spinner

    this.currentDictionary = await makeRequest({
      methodType: 'GET',
      getUrl: `${domain}/words/init/`,
      getParams: { wordType: this.speechPart },
    })

    this.currentDictionary = await filterCurrentDictionary(this.currentDictionary, this.speechPart)

    this.addListener(document, 'keydown', (event) => {
      if (document.querySelector('.c-modal')) return

      if (event.key === 'ArrowLeft') document.querySelector('#backBtn')?.click()
      if (event.key === 'ArrowRight') document.querySelector('#nextBtn')?.click()

      if (event.key === 'Enter') {
        const studyBtn = document.querySelector('#studyBtn')
        if (studyBtn && !studyBtn.disabled) studyBtn.click()
      }
    })

    !this.currentDictionary.data.length
      ? this.renderEndDeck()
      : this.renderPage()
  }

  renderPage() {
    const content = document.querySelector('.content')

    content.innerHTML = `
      <div class="cardWrapper">
        <div class="alphabet-bar"></div>
        <div class="word-card">
          <div class="word-card__body" id="wordArea">
            <div>
              <b>${this.currentDictionary.data[this.wordIndex].word}</b>
            </div>
            <div>${this.currentDictionary.data[this.wordIndex].translate}</div>
          </div>
          <button type="button" class="word-card__close" id="deleteBtn"></button>
          <div class="word-card__actions">
            <button class="btn btn--lemon btn--icon" id="backBtn" data-tooltip="Previous word">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 16 16">
                <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                <path d="M10.205 12.456A.5.5 0 0 0 10.5 12V4a.5.5 0 0 0-.832-.374l-4.5 4a.5.5 0 0 0 0 .748l4.5 4a.5.5 0 0 0 .537.082"/>
              </svg>
            </button>
            <button class="btn btn--primary" id="studyBtn">Add to list</button>
            <button class="btn btn--lemon btn--icon" id="nextBtn" data-tooltip="Next word">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 16 16">
                <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                <path d="M5.795 12.456A.5.5 0 0 1 5.5 12V4a.5.5 0 0 1 .832-.374l4.5 4a.5.5 0 0 1 0 .748l-4.5 4a.5.5 0 0 1-.537.082"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `

    const alphabetRoot = document.querySelector('.alphabet-bar')
    const wordArea = document.querySelector('#wordArea')
    const studyBtn = document.querySelector('#studyBtn')
    const deleteBtn = document.querySelector('#deleteBtn')
    const nextBtn = document.querySelector('#nextBtn')
    const backBtn = document.querySelector('#backBtn')

    this.analyzeCharAbility()

    if (this.wordIndex === 0) {
      backBtn.disabled = true
    }

    this.addListener(alphabetRoot, 'click', (event) => this.chooseNeededLetter(event))
    this.addListener(deleteBtn, 'click', (event) => this.deleteWord(event))
    this.addListener(wordArea, 'click', (event) => this.changeWord(event))
    this.addListener(studyBtn, 'click', (event) => this.studyThisWord(event))

    this.addListener(backBtn, 'click', (event) => {
      this.wordIndex--
      this.showNewWord(event)
    })

    this.addListener(nextBtn, 'click', (event) => {
      this.wordIndex++
      this.showNewWord(event)
    })
  }

  showNewWord(event) {
    event.preventDefault()

    if (this.wordIndex === this.currentDictionary.data.length) {
      this.renderEndDeck()
      return
    }

    const wordArea = document.querySelector('#wordArea')

    if (wordArea) {
      wordArea.innerHTML = `
        <div><b>${this.currentDictionary.data[this.wordIndex].word}</b></div>
        <div>${this.currentDictionary.data[this.wordIndex].translate}</div>
      `

      document.querySelector('#backBtn').disabled = this.wordIndex === 0
      document.querySelector('#nextBtn').disabled = false

      this.analyzeCharAbility()
    } else {
      this.renderPage()
    }
  }

  async studyThisWord(event) {
    event.preventDefault()

    const studyBtn = document.querySelector('#studyBtn')

    studyBtn.textContent = ''
    studyBtn.innerHTML = '<span class="spinner--sm"><span class="spinner__dot"></span><span class="spinner__dot"></span><span class="spinner__dot"></span></span>'
    studyBtn.disabled = true

    const addedStudyWord = {
      word: this.currentDictionary.data[this.wordIndex].word,
      translate: this.currentDictionary.data[this.wordIndex].translate,
      wordType: this.currentDictionary.data[this.wordIndex].wordType,
    }

    await makeRequest({
      methodType: 'POST',
      getUrl: `${domain}/words/study/`,
      getBody: addedStudyWord,
    })

    studyBtn.innerHTML = ''
    studyBtn.textContent = 'Add to list'
    studyBtn.disabled = false

    this.currentDictionary.data = this.currentDictionary.data.filter(
      (wordItem) => wordItem.word !== addedStudyWord.word
    )

    this.studyWordCounter++

    this.studyWordCounter === 10
      ? this.showTrainingSuggest()
      : this.showNewWord(event)
  }

  changeWord(event) {
    event.preventDefault()

    if (this._interactionsMuted) return

    const cardRoot = document.querySelector('.word-card')

    cardRoot.innerHTML = `
      <div class="word-card__body" id="wordArea">
        <div><input></input></div>
        <div><input></input></div>
      </div>
      <button type="button" class="word-card__close" id="deleteBtn"></button>
      <div class="word-card__actions">
        <button class="btn btn--primary" id="changeBtn">Change</button>
        <button class="btn btn--ghost" id="cancelBtn">Cancel</button>
      </div>
    `

    const changeBtn = document.querySelector('#changeBtn')
    const cancelBtn = document.querySelector('#cancelBtn')
    const deleteBtn = document.querySelector('#deleteBtn')
    const wordInput = document.querySelector('#wordArea > div:first-child > input')
    const translationInput = document.querySelector('#wordArea > div:last-child > input')

    wordInput.value = this.currentDictionary.data[this.wordIndex].word
    translationInput.value = this.currentDictionary.data[this.wordIndex].translate

    changeBtn.addEventListener('click', async () => {
      if (wordInput.value.length < 1 || translationInput.value.length < 1) return

      if (
        this.currentDictionary.data[this.wordIndex].word !== wordInput.value ||
        this.currentDictionary.data[this.wordIndex].translate !== translationInput.value
      ) {
        this.currentDictionary.data[this.wordIndex].word = wordInput.value
        this.currentDictionary.data[this.wordIndex].translate = translationInput.value

        await makeRequest({
          methodType: 'UPDATE',
          getUrl: `${domain}/words/init/${this.currentDictionary.data[this.wordIndex]._id}`,
          getBody: this.currentDictionary.data[this.wordIndex],
        })
      }

      this.renderPage()
    })

    cancelBtn.addEventListener('click', () => this.renderPage())

    deleteBtn.addEventListener('click', (event) => this.deleteWord(event))
  }

  async deleteWord(event) {
    event.preventDefault()

    if (this._interactionsMuted) return

    const content = document.querySelector('.content')

    content.insertAdjacentHTML('afterbegin', getModalWindow({
      title: 'Do you really want to delete this word?',
      description: 'After confirmation this word will be permanently deleted from this dictionary!',
      actionBtnText: 'Delete',
    }))

    const modalRoot = document.querySelector('.c-modal')
    const cleanupModalKeys = attachModalKeyboard(modalRoot)

    modalRoot.addEventListener('click', async (event) => {
      event.preventDefault()

      if (!event.target.dataset.action) return

      const target = event.target.closest('[data-action]')

      if (target.dataset.action === 'closeWindow' || target.dataset.action === 'cancelAction') {
        cleanupModalKeys()
        modalRoot.remove()
      } else if (target.dataset.action === 'doAction') {
        cleanupModalKeys()

        const deletedInitWord = await makeRequest({
          methodType: 'GET',
          getUrl: `${domain}/words/init`,
          getParams: { word: this.currentDictionary.data[this.wordIndex].word },
        })

        await makeRequest({
          methodType: 'DELETE',
          getUrl: `${domain}/words/init/${deletedInitWord.data[0]._id}`,
        })

        this.currentDictionary.data = this.currentDictionary.data.filter(
          (wordItem) => wordItem.word !== deletedInitWord.data[0].word
        )

        if (this.wordIndex === this.currentDictionary.data.length) {
          modalRoot.remove()
          this.renderEndDeck()
        } else {
          this.renderPage()
        }
      }
    })
  }

  muteWordInteractions() {
    this._interactionsMuted = true

    const wordArea = document.querySelector('#wordArea')
    const deleteBtn = document.querySelector('#deleteBtn')

    if (wordArea) wordArea.style.cursor = 'default'
    if (deleteBtn) deleteBtn.disabled = true
  }

  renderEndDeck() {
    const wordArea = document.querySelector('#wordArea')
    const cardBtnDiv = document.querySelector('.word-card__actions')

    this.wordIndex = 0

    this.muteWordInteractions()
    this.analyzeCharAbility()

    wordArea.innerHTML = `
      <div class="mascot-state">
        ${mascotEncourage}
        <p class="mascot-state__title">That's the whole deck!</p>
        <p class="mascot-state__text">Ready to study?</p>
      </div>
    `

    cardBtnDiv.innerHTML = `
      <button class="btn btn--hint" id="findNewBtn">New words</button>
      <button class="btn btn--sage" id="studyBtn">Study words</button>
    `

    const findNewBtn = document.querySelector('#findNewBtn')

    this.addListener(findNewBtn, 'click', () => {
      this.unmount()
      NewDictionary.renderPage()
    })

    this.checkTrainAvailable()
  }

  async checkTrainAvailable() {
    const studyList = await makeRequest({
      methodType: 'GET',
      getUrl: `${domain}/words/study/`,
      getParams: { wordType: this.speechPart },
    })

    const studyBtn = document.querySelector('#studyBtn')

    if (!studyList.data.length) {
      studyBtn.disabled = true
    } else {
      this.addListener(studyBtn, 'click', () => {
        this.unmount()
        TrainingList.renderPage(this.speechPart)
      })
    }
  }

  showTrainingSuggest() {
    const wordArea = document.querySelector('#wordArea')
    const cardBtnDiv = document.querySelector('.word-card__actions')

    this.muteWordInteractions()

    wordArea.innerHTML = `
      <div class="mascot-state">
        ${mascotAllDone}
        <p class="mascot-state__title">Great haul!</p>
        <p class="mascot-state__text">Ready for training?</p>
      </div>
    `

    cardBtnDiv.innerHTML = `
      <button class="btn btn--primary" id="startTrainBtn">Let's study!</button>
      <button class="btn btn--secondary" id="goOnBtn">Not yet</button>
    `

    const trainBtn = document.querySelector('#startTrainBtn')
    const goOnBtn = document.querySelector('#goOnBtn')

    this.addListener(trainBtn, 'click', () => {
      this.unmount()
      TrainingList.renderPage(this.speechPart)
    })

    this.addListener(goOnBtn, 'click', () => {
      this.studyWordCounter = 0

      this.wordIndex === this.currentDictionary.data.length
        ? this.renderEndDeck()
        : this.renderPage()
    })
  }

  analyzeCharAbility() {
    const alphabet = alphabetList.split('')
    const charRoot = document.querySelector('.alphabet-bar')
    const currentChars = charRoot.querySelectorAll('button')

    if (currentChars.length) charRoot.innerHTML = ''

    const referenceChars = [
      ...new Set(this.currentDictionary.data.map((wordItem) => wordItem.word.substring(0, 1).toUpperCase()))
    ]

    for (let index = 0; index < alphabet.length; index++) {
      const charButton = document.createElement('button')

      charButton.classList.add('alpha-btn')
      charButton.textContent = alphabet[index]
      charRoot.appendChild(charButton)

      if (!referenceChars.includes(charButton.textContent)) {
        charButton.disabled = true
      }
    }
  }

  chooseNeededLetter(event) {
    event.preventDefault()

    if (event.target.tagName !== 'BUTTON') return

    const targetButton = event.target.closest('button')

    if (targetButton.classList.contains('alpha-btn')) {
      this.wordIndex = this.currentDictionary.data.findIndex(
        (wordItem) => wordItem.word.startsWith(targetButton.textContent.trim().toLowerCase())
      )

      this.renderPage()
    }
  }
}
