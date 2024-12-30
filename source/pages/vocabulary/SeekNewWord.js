import '../../styles/seekNewWord.css'
import NewDictionary from './NewDictionary'
import TrainingList from './TrainingList'
import { makeRequest, filterCurrentDictionary } from '../../utils/utils'
import { domain, spinner } from '../../utils/constants'

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
            <div><b>${currentDictionary.data[0].word}</b></div>
            <div>${currentDictionary.data[0].translate}</div> 
        </div>
        <div class="cardBtnDiv">
            <button class="myBtn btn-lg" id="knowBtn">Уже знаю</button> 
            <button class="myBtn btn-lg" id="studyBtn">Изучить</button>
        </div>
    </div>
    `

  const wordArea = document.querySelector('#wordArea')
  const knowBtn = document.querySelector('#knowBtn')
  const studyBtn = document.querySelector('#studyBtn')

  wordArea.addEventListener('click', changeWord)
  knowBtn.addEventListener('click', showNewWord)
  studyBtn.addEventListener('click', studyThisWord)
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
  studyBtn.textContent = 'Изучить'
  studyBtn.disabled = false

  studyWordCounter++

  if (studyWordCounter === 10) {
    showTrainSuggest()
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
        <div class="cardBtnDiv">
            <button class="myBtn btn-lg" id="changeBtn">Изменить</button> 
            <button class="myBtn btn-lg" id="cancelBtn">Отмена</button> 
        </div>
    </div>
  `

  const changeBtn = document.querySelector('#changeBtn')
  const cancelBtn = document.querySelector('#cancelBtn')
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
} 

function renderEmptyDictionary() {
  const wordArea = document.querySelector('#wordArea')
  const cardBtnDiv = document.querySelector('.cardBtnDiv')

  wordArea.innerHTML = '<p>Вы посмотрели все слова!<br>Попробуем выучить новое? :)</p>'
  cardBtnDiv.innerHTML = `
      <button class="myBtn btn-lg" id="findNewBtn">Выбрать слова</button>
      <button class="myBtn btn-lg" id="studyBtn">Начать учить</button>
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

function showTrainSuggest() {
  currentDictionary.data.shift()

  const wordArea = document.querySelector('#wordArea')
  const cardBtnDiv = document.querySelector('.cardBtnDiv')

  wordArea.innerHTML = '<p>Хороший набор слов. <br>Переходим к тренировкам?)</p>'
  cardBtnDiv.innerHTML = `
      <button class="myBtn btn-lg" id="startTrainBtn">Тренировать</button>
      <button class="myBtn btn-lg" id="goOnBtn">Пока нет</button>
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