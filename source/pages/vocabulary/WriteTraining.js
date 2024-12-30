import '../../styles/writeTraining.css'
import NewDictionary from './NewDictionary'
import { fillArray, fillProgressBar, modifyStudyLevel, checkAvailableStudyWords } from '../../utils/utils'
import { spinner, system_colors } from '../../utils/constants'

const content = document.querySelector('.content')

let speechPart
let initDictionary = null
let currentDictionary = null
let charIndex = 0

class WriteTraining {
  async initPage(name) {
    speechPart = name
  
    content.innerHTML = spinner
  
    if (!initDictionary) {
      initDictionary = await fillArray(speechPart)
    }
  
    if (!currentDictionary) {
      currentDictionary = await fillArray(speechPart)
    }

    renderPage()
  }
}

function renderPage() {
  content.innerHTML = `
      <div class="wrapper">
        <div class="myProgressBar shadow"></div>
        <div class="rootDiv shadow">
          <div class="translateDiv">${currentDictionary.data[0].translate}</div>
          <input type="text" class="writeInput" placeholder=" Пишите здесь...">
          <div class="btnDiv">
              <button class="myBtn" id="suggestBtn">Подсказать</button>
              <button class="myBtn" id="checkBtn">Проверить</button>
          </div>
        </div>
      </div>
      `
  
    fillProgressBar(initDictionary, currentDictionary)
  
    const input = document.querySelector('.writeInput')
    input.focus()
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        checkWord(event)
      }
    })
  
    const writeInput = document.querySelector('.writeInput')
    const suggestBtn = document.querySelector('#suggestBtn')
    const checkBtn = document.querySelector('#checkBtn')
    checkBtn.disabled = true
    suggestBtn.addEventListener('click', suggestChar)
    checkBtn.addEventListener('click', checkWord)
    writeInput.addEventListener('input', checkCharCount)
}

function suggestChar(event) {
  event.preventDefault()

  checkCharCount()

  const input = document.querySelector('.writeInput')
  let chars = currentDictionary.data[0].word.split('')

  if (!currentDictionary.data[0].word.includes(input.value) || !chars[charIndex]) {
    return
  } 
  
  if (input.value.length !== charIndex) {
    charIndex = input.value.length
  }
  
  input.value = currentDictionary.data[0].word.substring(0, charIndex + 1)
  charIndex++
}

async function checkWord(event) {
  event.preventDefault()

  const input = document.querySelector('.writeInput')
  const enterWord = input.value.toLowerCase().trim()

  if (enterWord === currentDictionary.data[0].word || 'to'.concat(' ', enterWord) === currentDictionary.data[0].word) {
    await modifyStudyLevel(currentDictionary.data[0].word, true)

    currentDictionary.data.shift()

    input.style.backgroundColor = system_colors.success
    charIndex = 0

    if (!currentDictionary.data.length) {
      currentDictionary = null
      initDictionary = null

      const progressBar = document.querySelector('.myProgressBar')
      progressBar.innerHTML = ''
      input.outerHTML = ''
      const translateDiv = document.querySelector('.translateDiv')
      translateDiv.textContent = 'Это было круто! Ты молодец :)'
      const btnDiv = document.querySelector('.btnDiv')
      btnDiv.innerHTML = ''
      const newBtn = document.createElement('button')
      newBtn.classList.add('myBtn')
      newBtn.setAttribute('id', 'findNewBtn')
      newBtn.textContent = 'Выбрать слова'
      const oneMoreBtn = document.createElement('button')
      oneMoreBtn.classList.add('myBtn')
      oneMoreBtn.setAttribute('id', 'retryBtn')
      oneMoreBtn.textContent = 'Еще раз'
      btnDiv.append(newBtn)
      btnDiv.append(oneMoreBtn)

      await checkAvailableStudyWords(speechPart)

      newBtn.addEventListener('click', NewDictionary.renderPage)
      oneMoreBtn.addEventListener('click', () => new WriteTraining().initPage(speechPart))
    } else {
      setTimeout(() => {
        renderPage()
      }, 200)
    }
  } else {
    await modifyStudyLevel(currentDictionary.data[0].word)

    input.style.backgroundColor = system_colors.failed

    setTimeout(() => {
      clearProgress()
    }, 200)
  }
}

function clearProgress() {
  const input = document.querySelector('.writeInput')
  input.style.backgroundColor = ''
  input.value = ''
  charIndex = 0

  checkCharCount()
}

function checkCharCount() {
  const input = document.querySelector('.writeInput')
  const checkBtn = document.querySelector('#checkBtn')

  input.value.length > 1 ? checkBtn.disabled = false : checkBtn.disabled = true
}

export default new WriteTraining()