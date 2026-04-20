import NewDictionary from './NewDictionary'
import { makeRequest, fillArray, fillProgressBar, modifyStudyLevel, checkAvailableStudyWords, attachSrsKeyboard } from '../../utils/utils'
import { domain, spinner, feedbackArea, system_colors, mascotCelebrate } from '../../utils/constants'

const content = document.querySelector('.content')

let speechPart = null
let initDictionary = null
let currentDictionary = null
let fullDictionary = null
let choiceKeyHandler = null

class ChooseTraining {
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
      <div class="training-area training-area--choose">
        <div id="wordItem" class="training-area__word"></div>
        <div class="choice-grid"></div>
      </div>
    </div>
    `

    const trainArea = content.querySelector('.training-area')
    trainArea.addEventListener('click', validateChosenWord)
  
    renderPage()
  }
}

async function renderPage() {
  const translateArray = await getRandomTranslateArray(currentDictionary.data[0])
  
  const wordItem = content.querySelector('#wordItem')
  wordItem.innerHTML = `<p>${currentDictionary.data[0].word}</p>`
  
  let itemArea = content.querySelector('.choice-grid')

  if (!itemArea) {
    const feedbackBtnArea = content.querySelector('.srs-panel')
    feedbackBtnArea.remove()
    const trainArea = content.querySelector('.training-area')
    trainArea.insertAdjacentHTML('beforeend', '<div class="choice-grid"></div>')
    itemArea = content.querySelector('.choice-grid')
  }

  itemArea.innerHTML = `
    <div class="choice-item"><p>${translateArray[0]}</p></div>
    <div class="choice-item"><p>${translateArray[1]}</p></div>
    <div class="choice-item"><p>${translateArray[2]}</p></div>
    <div class="choice-item"><p>${translateArray[3]}</p></div>
  `

  const counter = content.querySelector('.training-counter')
  const completed = initDictionary.data.length - currentDictionary.data.length
  counter.textContent = `${completed} / ${initDictionary.data.length}`

  fillProgressBar(initDictionary, currentDictionary)

  if (choiceKeyHandler) document.removeEventListener('keydown', choiceKeyHandler)
  choiceKeyHandler = (e) => {
    const idx = parseInt(e.key) - 1
    if (idx >= 0 && idx <= 3) document.querySelectorAll('.choice-item')[idx]?.click()
  }
  document.addEventListener('keydown', choiceKeyHandler)
}

async function getRandomTranslateArray(studyWord) {
  if (!fullDictionary) {
    fullDictionary = await makeRequest({
      methodType: 'GET',
      getUrl: `${domain}/words/init/`,
    })
  }

  const getTranslate = studyWord.translate
  let translateArray = []

  for (let index = 0; translateArray.length < 3; index++) {
    const translate = fullDictionary.data[Math.floor(Math.random() * fullDictionary.data.length)].translate
    if (!translateArray.includes(translate) && translate !== getTranslate) {
      translateArray.push(translate)
    }
  }

  translateArray.push(getTranslate)

  return translateArray.sort(() => Math.random() - 0.5)
}

async function validateChosenWord(event) {
  event.preventDefault()

  const chooseWord = event.target.closest('.choice-item')

  if (!chooseWord) return

  if (chooseWord.textContent === currentDictionary.data[0].translate) {
    chooseWord.style.backgroundColor = system_colors.success

    document.removeEventListener('keydown', choiceKeyHandler)
    choiceKeyHandler = null

    await new Promise(r => setTimeout(r, 300))

    await askForRepetitionFeedback()
  } else {
    chooseWord.style.backgroundColor = system_colors.failed

    await new Promise(r => setTimeout(r, 300))

    await modifyStudyLevel({ studyWord: currentDictionary.data[0].word, resolution: 'FAIL' })

    await renderPage()
  }
}

// TODO: refactor and replace as a pure fn a bit later.
async function askForRepetitionFeedback() {
  const wordItem = document.querySelector('#wordItem')
  wordItem.textContent = 'How easy it was?'

  const itemArea = document.querySelector('.choice-grid')
  itemArea.remove()

  const trainArea = content.querySelector('.training-area')
  trainArea.insertAdjacentHTML('beforeend', feedbackArea)

  const feedbackBtnArea = trainArea.querySelector('.srs-panel')
  const cleanupSrsKeys = attachSrsKeyboard(feedbackBtnArea)

  feedbackBtnArea.addEventListener('click', async (event) => {
    event.preventDefault()

    if (!event.target.dataset.action) return

    cleanupSrsKeys()

    const target = event.target.closest('[data-action]')

    await modifyStudyLevel({ studyWord: currentDictionary.data[0].word, resolution: target.textContent })

    currentDictionary.data.shift()

    if (currentDictionary.data.length) {
      await renderPage()
    } else {
      currentDictionary = null
      initDictionary = null

      content.innerHTML = `
        <div class="wrapper">
          <div class="progress-bar"></div>
          <div class="training-area">
            <div class="mascot-state">
              ${mascotCelebrate}
              <p class="mascot-state__title">Nice work!</p>
              <p class="mascot-state__text">Want to go again?</p>
            </div>
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
      repeatBtn.addEventListener('click', () => new ChooseTraining().initPage(speechPart))
    }
  })
}

export default new ChooseTraining()