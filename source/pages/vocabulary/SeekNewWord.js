import '../../styles/seekNewWord.css'
import NewDictionary from './NewDictionary'
import TrainingList from './TrainingList'
import { makeRequest, filterCurrentDictionary } from '../../utils/utils'
import { domain, spinner, modalHtml, alphabetList } from '../../utils/constants'

const content = document.querySelector('.content')

let speechPart = null;
let currentDictionary = []
let studyWordCounter = 0
let wordIndex = 0

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
    }
  
    !currentDictionary.data.length ? renderEndDeck() : renderPage()
  }
}

/**
 * TODO: 
 * 1)Replace all variables and the rest of all fn's stuff to the class (Tech debt)
 * 2)Need to refactor so that it will be possible to rerender only wordArea (Tech debt)
 */
function renderPage() {
  content.innerHTML = `
    <div class="cardWrapper">
      <div class="alphabetRoot"></div>
      <div class="cardRoot shadow">
          <div class="cardWordArea" id="wordArea">
            <div>
              <b>${currentDictionary.data[wordIndex].word}</b>
            </div>
            <div>${currentDictionary.data[wordIndex].translate}</div>
          </div>
          <button type="button" class="btn-close" id="deleteBtn"></button>
          <div class="cardBtnDiv">
              <button class="arrowBtn" id="backBtn">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-caret-left-square" viewBox="0 0 16 16">
                  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                  <path d="M10.205 12.456A.5.5 0 0 0 10.5 12V4a.5.5 0 0 0-.832-.374l-4.5 4a.5.5 0 0 0 0 .748l4.5 4a.5.5 0 0 0 .537.082"/>
                </svg>
              </button>
              <button class="myBtn" id="studyBtn">Add to list</button>
              <button class="arrowBtn" id="nextBtn">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-caret-right-square" viewBox="0 0 16 16">
                  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                  <path d="M5.795 12.456A.5.5 0 0 1 5.5 12V4a.5.5 0 0 1 .832-.374l4.5 4a.5.5 0 0 1 0 .748l-4.5 4a.5.5 0 0 1-.537.082"/>
                </svg>
              </button> 
          </div>
      </div>
    </div>
    `

  const alphabetRoot = document.querySelector('.alphabetRoot')
  const wordArea = document.querySelector('#wordArea')
  const studyBtn = document.querySelector('#studyBtn')
  const deleteBtn = document.querySelector('#deleteBtn')
  const nextBtn = document.querySelector('#nextBtn')
  const backBtn = document.querySelector('#backBtn')

  analizeCharAbility()

  if (wordIndex === 0) {
    backBtn.disabled = true
  }

  alphabetRoot.addEventListener('click', chooseNeededLetter)
  deleteBtn.addEventListener('click', deleteWord)
  wordArea.addEventListener('click', changeWord)
  studyBtn.addEventListener('click', studyThisWord)
  backBtn.addEventListener('click', (event) => {
    --wordIndex
    showNewWord(event)
  })

  nextBtn.addEventListener('click', (event) => {
    ++wordIndex
    showNewWord(event)
  })
}

function showNewWord(event) {
  event.preventDefault()

  wordIndex === currentDictionary.data.length ? renderEndDeck() : renderPage()
}

async function studyThisWord(event) {
  event.preventDefault()

  const studyBtn = document.querySelector('#studyBtn')
  studyBtn.textContent = ''
  studyBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`
  studyBtn.disabled = true

  const addedStudyWord = {
    word: currentDictionary.data[wordIndex].word,
    translate: currentDictionary.data[wordIndex].translate,
    wordType: currentDictionary.data[wordIndex].wordType,
    studyLevel: 0,
  }

  await makeRequest({
    methodType: 'POST',
    getUrl: `${domain}/words/study/`,
    getBody: addedStudyWord,
  })

  studyBtn.innerHTML = ''
  studyBtn.textContent = 'Add to list'
  studyBtn.disabled = false

  currentDictionary.data = currentDictionary.data.filter(el => el.word !== addedStudyWord.word)

  studyWordCounter++

  studyWordCounter === 10 ? showTrainingSuggest() : showNewWord(event)
}

function changeWord(event) {
  event.preventDefault()

  const cardRoot = document.querySelector('.cardRoot')

  cardRoot.innerHTML = `
    <div class="cardWordArea" id="wordArea">
      <div><input></input></div>
      <div><input></input></div> 
    </div>
      <button type="button" class="btn-close" id="deleteBtn"></button>
      <div class="cardBtnDiv">
        <button class="myBtn btn-lg" id="changeBtn">Change</button> 
        <button class="myBtn btn-lg" id="cancelBtn">Cancel</button> 
      </div>
    `

  const changeBtn = document.querySelector('#changeBtn')
  const cancelBtn = document.querySelector('#cancelBtn')
  const deleteBtn = document.querySelector('#deleteBtn')
  const wordInput = document.querySelector('#wordArea > div:first-child > input')
  const translationInput = document.querySelector('#wordArea > div:last-child > input')

  wordInput.value = currentDictionary.data[wordIndex].word
  translationInput.value = currentDictionary.data[wordIndex].translate

  changeBtn.addEventListener('click', async () => {

    if (wordInput.value.length < 1 || translationInput.value.length < 1) return

    if (currentDictionary.data[wordIndex].word !== wordInput.value || currentDictionary.data[wordIndex].translate !== translationInput.value) {
      currentDictionary.data[wordIndex].word = wordInput.value
      currentDictionary.data[wordIndex].translate = translationInput.value

      await makeRequest({
        methodType: 'UPDATE',
        getUrl: `${domain}/words/init/${currentDictionary.data[wordIndex]._id}`,
        getBody: currentDictionary.data[wordIndex],
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
      const deletedInitWord = await makeRequest({
        methodType: 'GET',
        getUrl: `${domain}/words/init`,
        getParams: { word: currentDictionary.data[wordIndex].word }
      })

      await makeRequest({
        methodType: 'DELETE',
        getUrl: `${domain}/words/init/${deletedInitWord.data[0]._id}`,
      })

      currentDictionary.data = currentDictionary.data.filter(el => el.word !== deletedInitWord.data[0].word)

      if (wordIndex === currentDictionary.data.length) {
        modalRoot.remove()
        renderEndDeck()
      } else {
        renderPage()
      }
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

function renderEndDeck() {
  const wordArea = document.querySelector('#wordArea')
  const cardBtnDiv = document.querySelector('.cardBtnDiv')
  wordIndex = 0

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
    wordIndex === currentDictionary.data.length ? renderEndDeck() : renderPage()
  })
}

function analizeCharAbility() {
  const charRoot = document.querySelector('.alphabetRoot')
  const alphabet = alphabetList.split('');

  const referenceChars = [...new Set(currentDictionary.data.map(el => el.word.substring(0,1).toUpperCase()))]

  for (let i = 0; i < alphabet.length; i++) {
    const char = document.createElement('button')
    char.classList.add('alphaChar')
    char.classList.add('shadow')
    char.textContent = alphabet[i]
    charRoot.appendChild(char)

    if (!referenceChars.includes(char.textContent)) {
      char.style.backgroundColor = '#FFFAFA'
      char.disabled = true
    }
  }
}

function chooseNeededLetter(event) {
  event.preventDefault()

  if (event.target.tagName !== 'BUTTON') return

  const targetBtn = event.target.closest('button')

  if (targetBtn.classList.contains('alphaChar')) {
    wordIndex = currentDictionary.data.findIndex(el => el.word.startsWith(targetBtn.textContent.trim().toLowerCase()))

    renderPage()
  }
}

export default new SeekNewWord()