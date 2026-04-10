import AddDictionaryWord from './AddDictionaryWord'
import ActualDictionary from './ActualDictionary'
import NewDictionary from './NewDictionary'
import StudyDictionary from './StudyDictionary'
import { domain, spinner, clear_icon, getModalWindow } from '../../utils/constants'
import { makeRequest, checkAvailableStudyWords, attachModalKeyboard } from '../../utils/utils'

class VocabularySection {
  lContainer = document.querySelector('.l-container')

  async renderPage(event) {
    event.preventDefault()
  
    this.lContainer.innerHTML = spinner
  
    const initList = await makeRequest({ methodType: 'GET', getUrl: `${domain}/words/init`})
    let studyList = await makeRequest({ methodType: 'GET', getUrl: `${domain}/words/study` })

    this.lContainer.innerHTML = `
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
      seekNewBtn.disabled = 'true'
    } else {
      this.addClearBtn({ wrapperListIndex: 0, dataName: 'removeInitList' })
    }
  
    if (!studyList.data.length) {
      const trainingBtn = document.querySelector('[data-name="getTraining"]')
      trainingBtn.disabled = 'true'

      const seeActualBtn = document.querySelector('[data-name="seeActual"]')
      seeActualBtn.disabled = 'true'
    } else {
      studyList = await checkAvailableStudyWords({ studyList })

      if (!studyList.data.length) {
        const trainingBtn = document.querySelector('[data-name="getTraining"]')
        trainingBtn.disabled = 'true'
      }

      this.addClearBtn({ wrapperListIndex: 2, dataName: 'removeStudyList' })
    }
  
    this.lContainer.addEventListener('click', this.renderNextPage)
  }

  async renderNextPage(event) {
    if (!event.target.dataset.name) return
  
    const name = event.target.dataset.name
  
    if (name === 'seekNew') {
      await NewDictionary.renderPage()
    } else if (name === 'getTraining') {
      await StudyDictionary.renderPage()
    } else if (name === 'seeActual') {
      await ActualDictionary.initPage()
    } else if (name === 'addNew') {
      AddDictionaryWord.renderPage()
    }
  }

  addClearBtn({ wrapperListIndex, dataName }) {
    const wrapperList = document.querySelectorAll('.nav-card-wrap')
    wrapperList[wrapperListIndex].insertAdjacentHTML('beforeend', clear_icon)
    const deleteDictionaryBtn = wrapperList[wrapperListIndex].querySelectorAll('button')[1]
    deleteDictionaryBtn.setAttribute('data-name', dataName)
    deleteDictionaryBtn.setAttribute('data-tooltip', dataName === 'removeInitList' ? 'Clear word list' : 'Clear study list')
    deleteDictionaryBtn.addEventListener('click', this.removeDictionary)
  }

  async removeDictionary(event) {
    const dictionaryTarget = event.target.closest('button')
    const lContainer = document.querySelector('.l-container')

    lContainer.insertAdjacentHTML('afterbegin', getModalWindow({ 
      title: 'Do you really want to delete this dictionary?',
      description: 'After confirmation this dictionary will be permanently deleted!',
      actionBtnText: 'Delete'
    }))
  
    const modalRoot = document.querySelector('.c-modal')
    const cleanupModalKeys = attachModalKeyboard(modalRoot)

    modalRoot.addEventListener('click', async (event) => {
      event.preventDefault()

      if (!event.target.dataset.action) return

      const modalTarget = event.target.closest('[data-action]')

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
    
        await new VocabularySection().renderPage(event)
      }
    })
  }
}

export default new VocabularySection()