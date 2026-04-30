import PageController from '../../core/PageController'
import TrainingListPage from './TrainingListPage'
import NewDictionaryPage from './NewDictionaryPage'
import { domain, spinner, speechList, mascotThinking } from '../../utils/constants'
import { makeRequest, checkAvailableStudyWords } from '../../utils/utils'

export default class StudyDictionaryPage extends PageController {

  async onMount() {
    const content = document.querySelector('.content')
    const dictionaryRoot = document.createElement('div')

    dictionaryRoot.classList.add('nav-grid')

    content.innerHTML = spinner

    const dbInitDeckList = await makeRequest({
      methodType: 'GET',
      getUrl: `${domain}/decks/init/`,
    })

    let allStudyList = await makeRequest({
      methodType: 'GET',
      getUrl: `${domain}/words/study/`,
    })

    allStudyList = await checkAvailableStudyWords({ studyList: allStudyList })

    const deckList = dbInitDeckList.data.length ? dbInitDeckList.data : speechList
    let toneIndex = 0

    if (allStudyList.data.length) {
      const dictionary = this.createStudyDictionary(undefined, toneIndex++)

      dictionaryRoot.append(dictionary)
    }

    for (let index = 0; index < deckList.length; index++) {
      let studyList = await makeRequest({
        methodType: 'GET',
        getUrl: `${domain}/words/study/`,
        getParams: { wordType: deckList[index].dataName },
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

        await next.mount()
      })

      return
    }

    content.append(dictionaryRoot)

    this.addListener(dictionaryRoot, 'click', async (event) => {
      event.preventDefault()

      if (!event.target.dataset.name) return

      const name = event.target.dataset.name

      await this.unmount()

      const next = new TrainingListPage()

      await next.mount({ speechPart: name })
    })
  }

  createStudyDictionary(speechListItem, toneIndex) {
    const dictionary = document.createElement('button')

    dictionary.classList.add('deck-card', `deck-card--tone-${(toneIndex % 6) + 1}`)

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
