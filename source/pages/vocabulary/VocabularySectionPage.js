import PageController from '../../core/PageController'
import AddDictionaryWordPage from './AddDictionaryWordPage'
import ActualDictionaryPage from './ActualDictionaryPage'
import NewDictionaryPage from './NewDictionaryPage'
import StudyDictionaryPage from './StudyDictionaryPage'
import { domain, spinner, clear_icon, getModalWindow } from '../../utils/constants'
import { makeRequest, checkAvailableStudyWords, attachModalKeyboard } from '../../utils/utils'

export default class VocabularySectionPage extends PageController {

  async onMount() {
    const lContainer = document.querySelector('.l-container')

    lContainer.innerHTML = spinner

    const initList = await makeRequest({ methodType: 'GET', getUrl: `${domain}/words/init` })
    let studyList = await makeRequest({ methodType: 'GET', getUrl: `${domain}/words/study` })

    lContainer.setAttribute('aria-label', 'Vocabulary section')
    lContainer.innerHTML = `
      <div class="nav-card-wrap">
        <button class="nav-card" data-name="seekNew">CHOOSE WORDS</button>
      </div>
      <div class="nav-card-wrap">
        <button class="nav-card" data-name="getTraining">STUDY WORDS</button>
      </div>
      <div class="nav-card-wrap">
        <button class="nav-card" data-name="seeActual">ACTUAL DICTIONARY</button>
      </div>
      <div class="nav-card-wrap">
        <button class="nav-card" data-name="addNew">ADD NEW WORD</button>
      </div>
    `

    if (!initList.data.length) {
      const seekNewBtn = document.querySelector('[data-name="seekNew"]')
      seekNewBtn.disabled = true
    } else {
      this.addClearBtn({ wrapperListIndex: 0, dataName: 'removeInitList' })
    }

    if (!studyList.data.length) {
      const trainingBtn = document.querySelector('[data-name="getTraining"]')
      trainingBtn.disabled = true

      const seeActualBtn = document.querySelector('[data-name="seeActual"]')
      seeActualBtn.disabled = true
    } else {
      studyList = await checkAvailableStudyWords({ studyList })

      if (!studyList.data.length) {
        const trainingBtn = document.querySelector('[data-name="getTraining"]')
        trainingBtn.disabled = true
      }

      this.addClearBtn({ wrapperListIndex: 2, dataName: 'removeStudyList' })
    }

    this.addListener(lContainer, 'click', (event) => this.renderNextPage(event))
  }

  async renderNextPage(event) {
    if (!event.target.dataset.name) return

    const name = event.target.dataset.name

    if (['seekNew', 'getTraining', 'seeActual', 'addNew'].includes(name)) {
      await this.unmount()
    }

    if (name === 'seekNew') {
      const page = new NewDictionaryPage()
      await page.mount()
    } else if (name === 'getTraining') {
      const page = new StudyDictionaryPage()
      await page.mount()
    } else if (name === 'seeActual') {
      const page = new ActualDictionaryPage()
      await page.mount()
    } else if (name === 'addNew') {
      const page = new AddDictionaryWordPage()
      await page.mount()
    }
  }

  addClearBtn({ wrapperListIndex, dataName }) {
    const wrapperList = document.querySelectorAll('.nav-card-wrap')

    wrapperList[wrapperListIndex].insertAdjacentHTML('beforeend', clear_icon)

    const deleteDictionaryBtn = wrapperList[wrapperListIndex].querySelectorAll('button')[1]

    deleteDictionaryBtn.setAttribute('data-name', dataName)
    deleteDictionaryBtn.setAttribute('data-tooltip', dataName === 'removeInitList' ? 'Clear word list' : 'Clear study list')

    this.addListener(deleteDictionaryBtn, 'click', (event) => this.removeDictionary(event))
  }

  async removeDictionary(event) {
    const dictionaryTarget = event.target.closest('button')
    const lContainer = document.querySelector('.l-container')

    lContainer.insertAdjacentHTML('afterbegin', getModalWindow({
      title: 'Do you really want to delete this dictionary?',
      description: 'After confirmation this dictionary will be permanently deleted!',
      actionBtnText: 'Delete',
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

        if (dictionaryTarget.dataset.name === 'removeInitList') {
          await makeRequest({ methodType: 'DELETE', getUrl: `${domain}/words/init` })
        }

        if (['removeInitList', 'removeStudyList'].includes(dictionaryTarget.dataset.name)) {
          await makeRequest({ methodType: 'DELETE', getUrl: `${domain}/words/study` })
        }

        await this.unmount()

        const next = new VocabularySectionPage()

        await next.mount()
      }
    })
  }
}
