import NewDictionary from './NewDictionary'
import { fillArray, fillProgressBar, modifyStudyLevel, checkAvailableStudyWords, attachSrsKeyboard } from '../../utils/utils'
import { spinner, feedbackArea, system_colors } from '../../utils/constants'

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
      currentDictionary = await checkAvailableStudyWords({ speechPart })
      currentDictionary.data = currentDictionary.data.sort(() => Math.random() - 0.5)
    }

    content.innerHTML = `
      <div class="wrapper">
        <span class="training-counter"></span>
        <div class="progress-bar"></div>
        <div class="training-area training-area--write"></div>
      </div>
    `

    renderPage()
  }
}

function renderPage() {
    const rootDiv = content.querySelector('.training-area')

    if (rootDiv.innerHTML) rootDiv.innerHTML = ''

    rootDiv.insertAdjacentHTML('afterbegin', `
      <div class="training-area__prompt"><p>${currentDictionary.data[0].translate}</p></div>
      <input type="text" class="training-input" placeholder=" Write here...">
      <div class="training-actions">
        <button class="btn btn--hint" id="suggestBtn">Get a cue</button>
        <button class="btn btn--primary" id="checkBtn">Check</button>
      </div>
    `)
  
    const counter = content.querySelector('.training-counter')
    const completed = initDictionary.data.length - currentDictionary.data.length
    counter.textContent = `${completed} / ${initDictionary.data.length}`

    fillProgressBar(initDictionary, currentDictionary)

    const input = document.querySelector('.training-input')
    input.focus()
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        checkWord(event)
      }
    })

    const writeInput = document.querySelector('.training-input')
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

  const input = document.querySelector('.training-input')
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

  const input = document.querySelector('.training-input')
  const enterWord = input.value.toLowerCase().trim()

  if (enterWord === currentDictionary.data[0].word || 'to'.concat(' ', enterWord) === currentDictionary.data[0].word) {
    input.style.backgroundColor = system_colors.success
    charIndex = 0

    await new Promise(r => setTimeout(r, 300));

    await askForRepetitionFeedback()
  } else {
    input.style.backgroundColor = system_colors.failed

    await new Promise(r => setTimeout(r, 300));

    await modifyStudyLevel({ studyWord: currentDictionary.data[0].word, resolution: 'FAIL' })

    clearProgress()
  }
}

function clearProgress() {
  const input = document.querySelector('.training-input')
  input.style.backgroundColor = ''
  input.value = ''
  charIndex = 0

  checkCharCount()
}

function checkCharCount() {
  const input = document.querySelector('.training-input')
  const checkBtn = document.querySelector('#checkBtn')
  const suggestBtn = document.querySelector('#suggestBtn')

  input.value.length > 1 ? checkBtn.disabled = false : checkBtn.disabled = true
  input.value === currentDictionary.data[0].word ? suggestBtn.disabled = true : suggestBtn.disabled = false
}

// TODO: refactor and replace as a pure fn a bit later.
async function askForRepetitionFeedback() {
  const translationText = content.querySelector('.training-area__prompt > p')
  translationText.textContent = 'How easy it was?'

  const wordInput = content.querySelector('.training-input')
  wordInput.removeAttribute('placeholder')
  wordInput.value = null
  wordInput.style.backgroundColor = system_colors.muted
  wordInput.disabled = true

  const btnArea = content.querySelector('.training-actions')
  btnArea.remove()

  const rootDiv = content.querySelector('.training-area')
  rootDiv.insertAdjacentHTML('beforeend', feedbackArea)

  const feedbackBtnArea = rootDiv.querySelector('.srs-panel')
  const cleanupSrsKeys = attachSrsKeyboard(feedbackBtnArea)

  feedbackBtnArea.addEventListener('click', async (event) => {
    event.preventDefault()

    if (!event.target.dataset.action) return

    cleanupSrsKeys()

    const target = event.target.closest('[data-action]')

    await modifyStudyLevel({ studyWord: currentDictionary.data[0].word, resolution: target.textContent })

    currentDictionary.data.shift()

    if (currentDictionary.data.length) {
      renderPage()
    } else {
      currentDictionary = null
      initDictionary = null
    
      content.innerHTML = `
        <div class="wrapper">
          <div class="progress-bar"></div>
          <div class="training-area">
            <div id="wordItem" class="training-area__word"><p>It was great! Try again?</p></div>
            <div class="srs-panel">
              <button type="button" class="btn btn--hint" id="findNewBtn">New words</button>
              <button type="button" class="btn btn--sage" id="repeatBtn">Repeat</button>
            </div>
          </div>
        </div>
        `

      const findNewBtn = document.querySelector('#findNewBtn')
      const repeatBtn = document.querySelector('#repeatBtn')
    
      const remainedStudyList = await checkAvailableStudyWords({ speechPart })

      if (!remainedStudyList.data.length) repeatBtn.disabled = 'true'
    
      findNewBtn.addEventListener('click', async () => NewDictionary.renderPage())
      repeatBtn.addEventListener('click', () => new WriteTraining().initPage(speechPart))
    }
  })
}

export default new WriteTraining()