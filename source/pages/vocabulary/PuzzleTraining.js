import '../../styles/puzzleTraining.css'
import NewDictionary from'./NewDictionary'
import { fillArray, fillProgressBar, optimizeCharacters, modifyStudyLevel, checkAvailableStudyWords } from '../../utils/utils'
import { spinner, feedbackArea } from '../../utils/constants'

const content = document.querySelector('.content')

let speechPart = null
let initDictionary = null
let currentDictionary = null
let chars = null
let badgeSpanClassList = 'position-absolute translate-middle badge rounded-pill charSpan'

class PuzzleTraining {
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
          <div class="myProgressBar shadow"></div>
          <div class="rootArea shadow"></div>
        </div>
      `
    
    renderPage()
  }
}

function renderPage() {
  const rootArea = content.querySelector('.rootArea')

  if (rootArea.innerHTML) rootArea.innerHTML = ''

  rootArea.innerHTML = `
      <div class="spellArea">
        <div id="translateDiv"><p>${currentDictionary.data[0].translate}</p></div>
        <div id="wordDiv"></div>
      </div>
      <div id="charArea" tabindex="0"></div>
      <div class="btnDiv">
        <button class="myBtn" id="suggestBtn" disabled>Get a cue</button>
        <button class="myBtn" id="checkBtn" disabled>Check</button>
        <button class="myBtn" id="clearBtn">Reset</button>
      </div>
    `
  
  genRandomChars()
  
  fillProgressBar(initDictionary, currentDictionary)
  
  const suggestBtn = rootArea.querySelector('#suggestBtn')
  const checkBtn = rootArea.querySelector('#checkBtn')
  const clearBtn = rootArea.querySelector('#clearBtn')
  suggestBtn.addEventListener('click', showAnswer)
  checkBtn.addEventListener('click', checkEnterWord)
  clearBtn.addEventListener('click', clearWordProgress)
  clearBtn.disabled = false

  const charArea = rootArea.querySelector('#charArea')
  charArea.addEventListener('click', moveCharToWordArea)
  charArea.addEventListener('keydown', moveCharToWordArea)
}

function genRandomChars() {
  const currentWord = currentDictionary.data[0].word

  do {
    chars = currentWord.split('').sort(() => Math.random() - 0.5)
  } while (chars.join('') === currentWord)

  const optimizeChars = optimizeCharacters(chars)

  const charArea = document.querySelector('#charArea')
  charArea.style.gridTemplateColumns = `repeat(${optimizeChars.length}, 1fr)`

  for (let index = 0; index < optimizeChars.length; index++) {
    const charDiv = document.createElement('div')
    charDiv.classList.add('char')

    if (optimizeChars[index].count > 1) {
      charDiv.innerHTML = `
      ${optimizeChars[index].element} <span class="${badgeSpanClassList}">${optimizeChars[index].count}</span>
      `
    } else {
      charDiv.textContent = optimizeChars[index].element
    }

    charArea.append(charDiv)
  }

  charArea.style.outline = '0'
  charArea.focus()
}

function clearWordProgress(event) {
  event.preventDefault()

  const suggestBtn = document.querySelector('#suggestBtn')
  const charArea = document.querySelector('#charArea')
  const wordDiv = document.querySelector('#wordDiv')
  suggestBtn.disabled = true
  charArea.innerHTML = ''
  wordDiv.innerHTML = ''

  genRandomChars()
}

function showAnswer(event) {
  event.preventDefault()

  const charArea = document.querySelector('#charArea')
  const wordDiv = document.querySelector('#wordDiv')

  charArea.innerHTML = ''
  wordDiv.innerHTML = ''

  for (let i = 0; i < currentDictionary.data[0].word.length; i++) {
    const letter = document.createElement('div')
    letter.textContent = currentDictionary.data[0].word[i]
    letter.classList.add('char')
    letter.style.position = 'relative'

    wordDiv.append(letter)
  }

  setTimeout(() => {
    clearWordProgress(event)
  }, 1000)
}

function moveCharToWordArea(event) {
  event.preventDefault()

  const target = event.target
  const key = event.key === ' ' ? '_' : event.key
  const charArea = document.querySelector('#charArea')
  const charsList = document.querySelectorAll('#charArea > .char')
  const wordDiv = document.querySelector('#wordDiv')
  const checkBtn = document.querySelector('#checkBtn')
  const clearBtn = document.querySelector('#clearBtn')
  const suggestBtn = document.querySelector('#suggestBtn')
  wordDiv.style.gridTemplateColumns = `repeat(${currentDictionary.data[0].word.length}, 1fr)`

  if (key) {
    for (let i = 0; i < charsList.length; i++) {
      if (charsList[i].textContent.trim().split(' ').join('').includes(key)) {
        handleKeyboardEvent(charsList[i], key)
        break
      }
    }
  }

  if (target.classList.contains('char')) {
    handleKeyboardEvent(target)
  }

  if (!charArea.innerHTML) {
    suggestBtn.disabled = true
    checkBtn.disabled = false
    clearBtn.disabled = true

    if (key === 'Enter') {
      checkBtn.addEventListener('keyDown', checkEnterWord(event))
    }
  } else if (suggestBtn.disabled) suggestBtn.disabled = false
}

function handleKeyboardEvent(getChar, getKey) {
  let content = getChar.textContent.trim().split(' ').join('')
  let key = getKey
  let count

  if (!key) {
    key = content.substring(0, 1)
  }

  Number.isInteger(+content.substring(2, 3)) ? count = content.substring(1, 3) : count = content.substring(1, 2)

  if (count > 1) {
    const charDiv = document.createElement('div')
    charDiv.classList.add('char')
    charDiv.innerHTML = key
    wordDiv.append(charDiv)

    count > 2 ? getChar.innerHTML = `${key} <span class="${badgeSpanClassList}">${--count}</span>` : getChar.innerHTML = key
  } else {
    getChar.innerHTML = key
    wordDiv.append(getChar)
  }
}

async function checkEnterWord(event) {
  event.preventDefault()

  const resultChars = document.querySelectorAll('#wordDiv > .char')

  let resultWord = ''

  for (let index = 0; index < currentDictionary.data[0].word.length; index++) {
    if (resultChars[index].textContent === '_') resultChars[index].textContent = ' '
    resultWord = resultWord.concat(resultChars[index].textContent)
  }

  if (resultWord === currentDictionary.data[0].word) {
    toggleClassForChar(resultChars)

    await new Promise(r => setTimeout(r, 300));

    await askForRepetitionFeedback()
  } else {
    toggleClassForChar(resultChars, 'wrongChar')

    await new Promise(r => setTimeout(r, 300));

    await modifyStudyLevel({ studyWord: currentDictionary.data[0].word, resolution: 'FAIL' })

    clearWordProgress(event)

    const checkBtn = document.querySelector('#checkBtn')
    const clearBtn = document.querySelector('#clearBtn')

    checkBtn.disabled = true
    clearBtn.disabled = false
  }
}

// TODO: refactor and replace as a pure fn a bit later.
async function askForRepetitionFeedback() {
  const translationText = content.querySelector('#translateDiv > p')
  translationText.textContent = 'How easy it was?'

  const wordDiv = content.querySelector('#wordDiv')
  wordDiv.innerHTML = ''

  const btnArea = content.querySelector('.btnDiv')
  btnArea.remove()

  const rootArea = content.querySelector('.rootArea')
  rootArea.insertAdjacentHTML('beforeend', feedbackArea)

  const feedbackBtnArea = rootArea.querySelector('.feedbackBtnArea')

  feedbackBtnArea.addEventListener('click', async (event) => {
    event.preventDefault()

    if (!event.target.dataset.action) return

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
          <div class="myProgressBar shadow"></div>
          <div class="trainArea shadow">
            <div id="wordItem"><p>It was great! Try again?</p></div>
            <div class="feedbackBtnArea">
              <button type="button" class="myBtn" id="findNewBtn">New words</button>
              <button type="button" class="myBtn" id="repeatBtn">Repeat</button>
            </div>
          </div>
        </div>
        `

      const findNewBtn = document.querySelector('#findNewBtn')
      const repeatBtn = document.querySelector('#repeatBtn')
    
      const remainedStudyList = await checkAvailableStudyWords({ speechPart })

      if (!remainedStudyList.data.length) repeatBtn.disabled = 'true'
    
      findNewBtn.addEventListener('click', async () => NewDictionary.renderPage())
      repeatBtn.addEventListener('click', () => new PuzzleTraining().initPage(speechPart))
    }
  })
}

function toggleClassForChar(charArray, className = 'accessChar') {
  for (let index = 0; index < charArray.length; index++) {
    charArray[index].classList.toggle(className)
  }
}

export default new PuzzleTraining()