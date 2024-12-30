import '../../styles/puzzleTraining.css'
import NewDictionary from'./NewDictionary'
import { fillArray, fillProgressBar, optimizeCharacters, modifyStudyLevel, checkAvailableStudyWords } from '../../utils/utils'
import { spinner } from '../../utils/constants'

// TODO: implement centring chars into wordDiv parent
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
      currentDictionary = await fillArray(speechPart)
    }
  
    renderPage()
  }
}

function renderPage() {
  content.innerHTML = `
        <div class="wrapper">
          <div class="myProgressBar shadow"></div>
          <div class="rootArea shadow">
            <div class="spellArea">
              <div id="translateDiv">${currentDictionary.data[0].translate}</div>
                <div id="wordDiv"></div>
              </div>
              <div id="charArea" tabindex="0"></div>
              <div class="btnDiv">
                  <button class="myBtn" id="answerBtn" disabled>Не знаю</button>
                  <button class="myBtn" id="checkBtn" disabled>Проверить</button>
                  <button class="myBtn" id="clearBtn">Сбросить</button>
              </div>
            </div>
        </div>
      `
  
    fillProgressBar(initDictionary, currentDictionary)
  
    genCharacters(currentDictionary.data[0])
  
    const answerBtn = document.querySelector('#answerBtn')
    const checkBtn = document.querySelector('#checkBtn')
    const clearBtn = document.querySelector('#clearBtn')
    answerBtn.addEventListener('click', showAnswer)
    checkBtn.addEventListener('click', checkEnterWord)
    clearBtn.addEventListener('click', clearWordProgress)
    clearBtn.disabled = false

    const charArea = document.querySelector('#charArea')
    charArea.addEventListener('click', moveCharToWordArea)
    charArea.addEventListener('keydown', moveCharToWordArea)
}

function genCharacters(getWord) {
  do {
    chars = getWord.word.split('').sort(() => Math.random() - 0.5)
  } while (chars.join('') === getWord.word)

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

function clearWordProgress(event, word = currentDictionary.data[0]) {
  event.preventDefault()

  const answerBtn = document.querySelector('#answerBtn')
  const charArea = document.querySelector('#charArea')
  const wordDiv = document.querySelector('#wordDiv')
  answerBtn.disabled = true
  charArea.innerHTML = ''
  wordDiv.innerHTML = ''

  genCharacters(word)
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
  const answerBtn = document.querySelector('#answerBtn')
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
    answerBtn.disabled = true
    checkBtn.disabled = false
    clearBtn.disabled = true

    if (key === 'Enter') {
      checkBtn.addEventListener('keyDown', checkEnterWord(event))
    }
  } else if (answerBtn.disabled) answerBtn.disabled = false
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

  const translateDiv = document.querySelector('#translateDiv')
  const wordDiv = document.querySelector('#wordDiv')
  const btnDiv = document.querySelector('.btnDiv')
  const checkBtn = document.querySelector('#checkBtn')
  const clearBtn = document.querySelector('#clearBtn')
  const resultChars = document.querySelectorAll('#wordDiv > .char')

  let resultWord = ''

  for (let index = 0; index < currentDictionary.data[0].word.length; index++) {
    if (resultChars[index].textContent === '_') resultChars[index].textContent = ' '
    resultWord = resultWord.concat(resultChars[index].textContent)
  }

  if (resultWord === currentDictionary.data[0].word) {
    await modifyStudyLevel(currentDictionary.data[0].word, true)

    currentDictionary.data.shift()

    if (!currentDictionary.data.length) {
      currentDictionary = null
      initDictionary = null

      toggleClassForChar(resultChars)

      const progressBar = document.querySelector('.myProgressBar')
      progressBar.innerHTML = ''
      translateDiv.textContent = 'Отлично! Тебе это удалось :)'
      wordDiv.innerHTML = ''
      btnDiv.innerHTML = ''
      const newBtn = document.createElement('button')
      newBtn.classList.add('myBtn')
      newBtn.setAttribute('id', 'findNewBtn')
      newBtn.textContent = 'Выбрать слова'
      const retryBtn = document.createElement('button')
      retryBtn.classList.add('myBtn')
      retryBtn.setAttribute('id', 'retryBtn')
      retryBtn.textContent = 'Еще раз'
      btnDiv.append(newBtn)
      btnDiv.append(retryBtn)

      await checkAvailableStudyWords(speechPart)

      newBtn.addEventListener('click', NewDictionary.renderPage)
      retryBtn.addEventListener('click', () => new PuzzleTraining().initPage(speechPart))
    } else {
      toggleClassForChar(resultChars)

      setTimeout(() => {
        renderPage()
      }, 300)
    }
  } else {
    await modifyStudyLevel(currentDictionary.data[0].word)

    toggleClassForChar(resultChars, 'wrongChar')

    setTimeout(() => {
      clearWordProgress(event)

      checkBtn.disabled = true
      clearBtn.disabled = false
    }, 300)
  }
}

function toggleClassForChar(charArray, className = 'accessChar') {
  for (let index = 0; index < charArray.length; index++) {
    charArray[index].classList.toggle(className)
  }
}

export default new PuzzleTraining()