import PageController from '../../core/PageController'
import TrainingListPage from './TrainingListPage'
import NewDictionaryPage from './NewDictionaryPage'
import LevelSelectionPage from './LevelSelectionPage'
import { domain, spinner, speechList, mascotThinking } from '../../utils/constants'
import { makeRequest, checkAvailableStudyWords } from '../../utils/utils'

export default class StudyDictionaryPage extends PageController {

  async onMount({ wordCategory } = {}) {
    this.wordCategory = wordCategory

    const content = document.querySelector('.content')
    const dictionaryRoot = document.createElement('div')

    dictionaryRoot.classList.add('nav-grid')

    content.innerHTML = spinner

    const dbInitDeckList = await makeRequest({
      methodType: 'GET',
      getUrl: `${domain}/decks/init/`,
    })

    const allParams = {}
    if (this.wordCategory) allParams.wordCategory = this.wordCategory

    let allStudyList = await makeRequest({
      methodType: 'GET',
      getUrl: `${domain}/words/study/`,
      getParams: allParams,
    })

    allStudyList = await checkAvailableStudyWords({ studyList: allStudyList })

    const deckList = dbInitDeckList.data.length ? dbInitDeckList.data : speechList
    let toneIndex = 0

    if (allStudyList.data.length) {
      const dictionary = this.createStudyDictionary(undefined, toneIndex++)

      dictionaryRoot.append(dictionary)
    }

    for (let index = 0; index < deckList.length; index++) {
      const deckParams = { wordType: deckList[index].dataName }
      if (this.wordCategory) deckParams.wordCategory = this.wordCategory

      let studyList = await makeRequest({
        methodType: 'GET',
        getUrl: `${domain}/words/study/`,
        getParams: deckParams,
      })

      studyList = await checkAvailableStudyWords({ studyList })

      if (studyList.data.length) {
        const dictionary = this.createStudyDictionary(deckList[index], toneIndex++)

        dictionaryRoot.append(dictionary)
      }
    }

    content.innerHTML = ''

    if (!dictionaryRoot.children.length) {
      content.innerHTML = `
        <div class="empty-state-hero">
          ${mascotThinking}
          <p class="mascot-state__title">Nothing to repeat yet. Find new words!</p>
          <button class="btn btn--primary" id="findWordsBtn">Find words</button>
        </div>
      `

      this.addListener(document.querySelector('#findWordsBtn'), 'click', async () => {
        await this.unmount()

        const next = new NewDictionaryPage()

        await next.mount({ wordCategory: this.wordCategory })
      })

      return
    }

    if (this.wordCategory) {
      content.append(this.createBackButton())
    }

    content.append(dictionaryRoot)

    this.addListener(dictionaryRoot, 'click', async (event) => {
      event.preventDefault()

      if (!event.target.dataset.name) return

      const name = event.target.dataset.name

      await this.unmount()

      const next = new TrainingListPage()

      await next.mount({ speechPart: name, wordCategory: this.wordCategory })
    })
  }

  createBackButton() {
    const backBtn = document.createElement('button')
    backBtn.classList.add('back-to-levels')
    backBtn.type = 'button'
    backBtn.innerHTML = '<span aria-hidden="true">←</span> Back to level selection'

    this.addListener(backBtn, 'click', async () => {
      await this.unmount()
      const next = new LevelSelectionPage()
      await next.mount({ target: 'study' })
    })

    return backBtn
  }

  createStudyDictionary(speechListItem, toneIndex) {
    const dictionary = document.createElement('button')
    const tone = speechListItem?.tone || ((toneIndex % 6) + 1)

    dictionary.classList.add('deck-card', `deck-card--tone-${tone}`)

    if (speechListItem) {
      dictionary.setAttribute('data-name', `${speechListItem.dataName}`)
      dictionary.textContent = speechListItem.dataName.toUpperCase()
    } else {
      dictionary.setAttribute('data-name', 'all-study-words')
      dictionary.textContent = 'ALL WORDS'
    }

    return dictionary
  }
}
