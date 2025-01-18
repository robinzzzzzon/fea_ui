import '../../styles/seekNewWord.css'
import NewDictionary from './NewDictionary'
import TrainingList from './TrainingList'
import { makeRequest, filterCurrentDictionary } from '../../utils/utils'
import { domain, spinner, modalHtml } from '../../utils/constants'

const content = document.querySelector('.content')

let speechPart
let currentDictionary = []
let studyWordCounter = 0

class SeekNewWord {
  async initPage(name) {
    speechPart = name
  
    content.innerHTML = spinner
  
    if (!currentDictionary.length) {
      currentDictionary = await makeRequest({
        methodType: 'GET',
        getUrl: `${domain}/words/init/`,
        getParams: { wordType: speechPart },
      })
  
      currentDictionary = await filterCurrentDictionary(currentDictionary, speechPart)
  
      if (!currentDictionary.data.length) renderEmptyDictionary()
    }
  
    renderPage()
  }
}

function renderPage() {
  content.innerHTML = `
    <div class="cardRoot shadow">
        <div class="cardWordArea" id="wordArea">
          <div>
            <b>${currentDictionary.data[0].word}</b>
          </div>
          <div>${currentDictionary.data[0].translate}</div>
        </div>
        <button type="button" class="btn-close" id="deleteBtn"></button>
        <div class="cardBtnDiv">
            <button class="myBtn btn-lg" id="knowBtn">Already know</button> 
            <button class="myBtn btn-lg" id="studyBtn">Add to list</button>
        </div>
    </div>
    `

  const wordArea = document.querySelector('#wordArea')
  const knowBtn = document.querySelector('#knowBtn')
  const studyBtn = document.querySelector('#studyBtn')
  const deleteBtn = document.querySelector('#deleteBtn')

  wordArea.addEventListener('click', changeWord)
  knowBtn.addEventListener('click', showNewWord)
  studyBtn.addEventListener('click', studyThisWord)
  deleteBtn.addEventListener('click', deleteWord)
}

function showNewWord(event) {
  event.preventDefault()

  currentDictionary.data.shift()

  if (!currentDictionary.data.length) {
    renderEmptyDictionary()
  } else {
    renderPage()
  }
}

async function studyThisWord(event) {
  event.preventDefault()

  const studyBtn = document.querySelector('#studyBtn')
  studyBtn.textContent = ''
  studyBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`
  studyBtn.disabled = true

  const addStudyWord = {
    word: currentDictionary.data[0].word,
    translate: currentDictionary.data[0].translate,
    wordType: currentDictionary.data[0].wordType,
    studyLevel: 0,
  }

  await makeRequest({
    methodType: 'POST',
    getUrl: `${domain}/words/study/`,
    getBody: addStudyWord,
  })

  studyBtn.innerHTML = ''
  studyBtn.textContent = 'Add to list'
  studyBtn.disabled = false

  studyWordCounter++

  if (studyWordCounter === 10) {
    showTrainingSuggest()
  } else {
    showNewWord(event)
  }
}

function changeWord(event) {
  event.preventDefault()

  content.innerHTML = `
  <div class="cardRoot shadow">
        <div class="cardWordArea" id="wordArea">
            <div><input></input></div>
            <div><input></input></div> 
        </div>
        <button type="button" class="btn-close" id="deleteBtn"></button>
        <div class="cardBtnDiv">
            <button class="myBtn btn-lg" id="changeBtn">Change</button> 
            <button class="myBtn btn-lg" id="cancelBtn">Cancel</button> 
        </div>
    </div>
  `

  const changeBtn = document.querySelector('#changeBtn')
  const cancelBtn = document.querySelector('#cancelBtn')
  const deleteBtn = document.querySelector('#deleteBtn')
  const wordInput = document.querySelector('#wordArea > div:first-child > input')
  const translationInput = document.querySelector('#wordArea > div:last-child > input')

  wordInput.value = currentDictionary.data[0].word
  translationInput.value = currentDictionary.data[0].translate

  changeBtn.addEventListener('click', async () => {

    if (wordInput.value.length < 1 || translationInput.value.length < 1) return

    if (currentDictionary.data[0].word !== wordInput.value || currentDictionary.data[0].translate !== translationInput.value) {
      currentDictionary.data[0].word = wordInput.value
      currentDictionary.data[0].translate = translationInput.value

      await makeRequest({
        methodType: 'UPDATE',
        getUrl: `${domain}/words/init/${currentDictionary.data[0]._id}`,
        getBody: currentDictionary.data[0],
      })
    }

    renderPage()
  })

  cancelBtn.addEventListener('click', renderPage)
  deleteBtn.addEventListener('click', deleteWord)
}

async function deleteWord(event) {
  event.preventDefault()

  content.insertAdjacentHTML('afterbegin', modalHtml)

  const modalRoot = document.querySelector('.c-modal')

  modalRoot.addEventListener('click', async (event) => {
    event.preventDefault()

    const target = event.target

    if (target.id !== 'modalBtn') return

    if (target.classList.contains('c-modal-close') || target.classList.contains('c-modal-cancel')) {
      modalRoot.remove()
    } else if (target.classList.contains('c-modal-delete')) {
      const wordList = await makeRequest({
        methodType: 'GET',
        getUrl: `${domain}/words/init`,
        getParams: { word: currentDictionary.data[0].word }
      })

      await makeRequest({
        methodType: 'DELETE',
        getUrl: `${domain}/words/init/${wordList.data[0]._id}`,
      })

      currentDictionary.data.shift()

      currentDictionary.data.length ? renderPage() : renderEmptyDictionary()
    }
  })
}

function muteWordInteractions() {
  const deleteBtn = document.querySelector('#deleteBtn')

  wordArea.removeEventListener('click', changeWord)
  wordArea.style.cursor = 'default'

  deleteBtn.removeEventListener('click', deleteWord)
  deleteBtn.disabled = true
}

function renderEmptyDictionary() {
  const wordArea = document.querySelector('#wordArea')
  const cardBtnDiv = document.querySelector('.cardBtnDiv')

  muteWordInteractions()

  wordArea.innerHTML = '<p>This is the end of the deck!<br>Are you ready for studying new? :)</p>'
  cardBtnDiv.innerHTML = `
      <button class="myBtn btn-lg" id="findNewBtn">New words</button>
      <button class="myBtn btn-lg" id="studyBtn">Study words</button>
    `

  const findNewBtn = document.querySelector('#findNewBtn')
  findNewBtn.addEventListener('click', NewDictionary.renderPage)

  checkTrainAvailable()
}

async function checkTrainAvailable() {
  const studyList = await makeRequest({
    methodType: 'GET',
    getUrl: `${domain}/words/study/`,
    getParams: { wordType: speechPart },
  })

  const studyBtn = document.querySelector('#studyBtn')

  !studyList.data.length 
    ? studyBtn.disabled = true
    : studyBtn.addEventListener('click', () => TrainingList.renderPage(speechPart))
}

function showTrainingSuggest() {
  currentDictionary.data.shift()

  const wordArea = document.querySelector('#wordArea')
  const cardBtnDiv = document.querySelector('.cardBtnDiv')

  muteWordInteractions()

  wordArea.innerHTML = '<p>Excellent supply of added words! <br>Ready for training?</p>'
  cardBtnDiv.innerHTML = `
      <button class="myBtn btn-lg" id="startTrainBtn">Let's study!</button>
      <button class="myBtn btn-lg" id="goOnBtn">Not yet</button>
    `

  const trainBtn = document.querySelector('#startTrainBtn')
  trainBtn.addEventListener('click', () => TrainingList.renderPage(speechPart))
  const goOnBtn = document.querySelector('#goOnBtn')
  goOnBtn.addEventListener('click', () => {
    studyWordCounter = 0
    renderPage()
  })
}

export default new SeekNewWord()