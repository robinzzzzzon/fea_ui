import PageController from '../../core/PageController'
import SeekNewWordPage from './SeekNewWordPage'
import StudyDictionaryPage from './StudyDictionaryPage'
import { speechList, domain, spinner, add_icon, getModalWindow, mascotRest } from '../../utils/constants'
import { makeRequest, attachModalKeyboard } from '../../utils/utils'

export default class NewDictionaryPage extends PageController {

  async onMount() {
    const content = document.querySelector('.content')

    content.innerHTML = spinner

    const dictionaryRoot = document.createElement('div')

    dictionaryRoot.classList.add('l-container')

    const dbInitDeckList = await makeRequest({
      methodType: 'GET',
      getUrl: `${domain}/decks/init/`,
    })

    const deckList = dbInitDeckList.data.length ? dbInitDeckList.data : speechList
    let enabledCount = 0

    for (let index = 0; index < deckList.length; index++) {
      const deck = document.createElement('button')

      deck.classList.add('deck-card', `deck-card--tone-${(index % 6) + 1}`)
      deck.setAttribute('data-name', deckList[index].dataName)
      deck.textContent = deckList[index].dataName.toUpperCase()

      const initList = await makeRequest({
        methodType: 'GET',
        getUrl: `${domain}/words/init/`,
        getParams: { wordType: deckList[index].dataName },
      })

      const studyList = await makeRequest({
        methodType: 'GET',
        getUrl: `${domain}/words/study/`,
        getParams: { wordType: deckList[index].dataName },
      })

      const dictionaryWrapper = document.createElement('div')

      dictionaryWrapper.classList.add('nav-card-wrap')
      dictionaryWrapper.append(deck)

      if (initList.data.length === studyList.data.length) {
        deck.disabled = true
      } else {
        enabledCount++

        dictionaryWrapper.insertAdjacentHTML('beforeend', add_icon)

        const addDeckBtn = dictionaryWrapper.querySelectorAll('button')[1]

        this.addListener(addDeckBtn, 'click', (event) => this.addDeckToStudyList(event))
      }

      dictionaryRoot.append(dictionaryWrapper)
    }

    if (!dbInitDeckList.data.length) {
      await makeRequest({
        methodType: 'POST',
        getUrl: `${domain}/decks/init/all`,
        getBody: { deckList },
      })
    }

    if (enabledCount === 0) {
      content.innerHTML = `
        <div class="empty-state-hero">
          ${mascotRest}
          <p class="mascot-state__title">All words are in your study list!</p>
          <button class="btn btn--primary" id="goStudyBtn">Study words</button>
        </div>
      `

      this.addListener(document.querySelector('#goStudyBtn'), 'click', async () => {
        await this.unmount()

        const next = new StudyDictionaryPage()

        await next.mount()
      })

      return
    }

    content.innerHTML = ''
    content.append(dictionaryRoot)

    this.addListener(dictionaryRoot, 'click', async (event) => {
      event.preventDefault()

      if (!event.target.dataset.name) return

      const name = event.target.dataset.name

      await this.unmount()

      const seekPage = new SeekNewWordPage()

      await seekPage.mount({ speechPart: name })
    })
  }

  async addDeckToStudyList(event) {
    const addDeckBtn = event.target.closest('button[data-action]')

    if (!addDeckBtn) return

    const wrapper = addDeckBtn.closest('.nav-card-wrap')
    const deckBtn = wrapper.querySelector('button[data-name]')
    const lContainer = document.querySelector('.l-container')

    lContainer.insertAdjacentHTML('afterbegin', getModalWindow({
      title: 'Do you really want to start studying all words of this dictionary?',
      description: 'After confirmation this deck will be added to your current study list!',
      actionBtnText: 'Add',
    }))

    const modalRoot = document.querySelector('.c-modal')
    const cleanupModalKeys = attachModalKeyboard(modalRoot)

    this.addListener(modalRoot, 'click', async (modalEvent) => {
      modalEvent.preventDefault()

      if (!modalEvent.target.dataset.action) return

      const modalTarget = modalEvent.target.closest('[data-action]')

      if (modalTarget.dataset.action === 'closeWindow' || modalTarget.dataset.action === 'cancelAction') {
        cleanupModalKeys()
        modalRoot.remove()
      } else if (modalTarget.dataset.action === 'doAction') {
        cleanupModalKeys()

        const deckWordList = await makeRequest({
          methodType: 'GET',
          getUrl: `${domain}/words/init/`,
          getParams: { wordType: deckBtn.dataset.name },
        })

        await makeRequest({
          methodType: 'POST',
          getUrl: `${domain}/words/study/deck`,
          getBody: { wordList: deckWordList },
        })

        await this.unmount()

        const next = new NewDictionaryPage()

        await next.mount()
      }
    })
  }
}
