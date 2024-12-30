import AddDictionaryWord from './AddDictionaryWord'
import ActualDictionary from './ActualDictionary'
import NewDictionary from './NewDictionary'
import StudyDictionary from './StudyDictionary'
import { domain, spinner } from '../../utils/constants'
import { makeRequest } from '../../utils/utils'

class VocabularySection {
  actionRoot = document.querySelector('.actionRoot')

  async renderPage(event) {
    event.preventDefault()
  
    this.actionRoot.innerHTML = spinner
  
    const studyList = await makeRequest({ methodType: 'GET', getUrl: `${domain}/words/study` })
  
    this.actionRoot.innerHTML = `
      <button class="dictionary initItem shadow-lg" data-name="seekNew">CHOOSE WORDS</button>
      <button class="dictionary initItem shadow-lg" data-name="getTraining">STUDY WORDS</button>
      <button class="dictionary initItem shadow-lg" data-name="seeActual">MY DICTIONARY</button>
      <button class="dictionary initItem shadow-lg" data-name="addNew">ADD DICTIONARY WORD</button>
    `
  
    if (!studyList.data.length) {
      const trainingBtn = document.querySelector('[data-name="getTraining"]')
      trainingBtn.disabled = 'true'
  
      const seeActualBtn = document.querySelector('[data-name="seeActual"]')
      seeActualBtn.disabled = 'true'
    }
  
    this.actionRoot.addEventListener('click', this.renderNextPage)
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
}

export default new VocabularySection()