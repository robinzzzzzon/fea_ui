import TrainingList from './TrainingList'
import { domain, spinner } from '../../utils/constants'
import { makeRequest, checkAvailableStudyWords } from '../../utils/utils'

const content = document.querySelector('.content')

class StudyDictionary {
  async renderPage() {
    let dictionaryRoot = document.createElement('div')
    dictionaryRoot.classList.add('nav-grid')
  
    content.innerHTML = spinner

    let dbInitDeckList = await makeRequest({
      methodType: 'GET',
      getUrl: `${domain}/decks/init/`,
    })
  
    let allStudyList = await makeRequest({
      methodType: 'GET',
      getUrl: `${domain}/words/study/`,
    })

    allStudyList = await checkAvailableStudyWords({ studyList: allStudyList })
  
    let toneIndex = 0

    if (allStudyList.data.length) {
      const dictionary = createStudyDictionary(undefined, toneIndex++)
      dictionaryRoot.append(dictionary)
    }

    for (let index = 0; index < dbInitDeckList.data.length; index++) {
      let studyList = await makeRequest({
        methodType: 'GET',
        getUrl: `${domain}/words/study/`,
        getParams: { wordType: dbInitDeckList.data[index].dataName },
      })

      studyList = await checkAvailableStudyWords({ studyList })

      if (studyList.data.length) {
        const dictionary = createStudyDictionary(dbInitDeckList.data[index], toneIndex++)
        dictionaryRoot.append(dictionary)
      }
    }
  
    content.innerHTML = ''
    content.append(dictionaryRoot)
  
    dictionaryRoot.addEventListener('click', (event) => {
      event.preventDefault()
  
      if (!event.target.dataset.name) return
  
      const name = event.target.dataset.name
  
      TrainingList.renderPage(name)
    })
  }
}

function createStudyDictionary(speechListItem, toneIndex) {
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

export default new StudyDictionary()