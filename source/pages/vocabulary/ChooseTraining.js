import '../../styles/chooseTraining.css'
import NewDictionary from './NewDictionary'
import { makeRequest, fillArray, fillProgressBar, modifyStudyLevel, checkAvailableStudyWords } from '../../utils/utils'
import { domain, spinner, feedbackArea, system_colors } from '../../utils/constants'

const content = document.querySelector('.content')

let speechPart = null
let initDictionary = null
let currentDictionary = null
let fullDictionary = null

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
      <div class="myProgressBar shadow"></div>
      <div class="trainArea shadow">
        <div id="wordItem"></div>
        <div class="itemArea"></div>
      </div>
    </div>
    `

    const trainArea = content.querySelector('.trainArea')
    trainArea.addEventListener('click', validateChosenWord)
  
    renderPage()
  }
}

async function renderPage() {
  const translateArray = await getRandomTranslateArray(currentDictionary.data[0])
  
  const wordItem = content.querySelector('#wordItem')
  wordItem.innerHTML = `<p>${currentDictionary.data[0].word}</p>`
  
  let itemArea = content.querySelector('.itemArea')

  if (!itemArea) {
    const feedbackBtnArea = content.querySelector('.feedbackBtnArea')
    feedbackBtnArea.remove()
    const trainArea = content.querySelector('.trainArea')
    trainArea.insertAdjacentHTML('beforeend', `<div class="itemArea"></div>`)
    itemArea = content.querySelector('.itemArea')
  }

  itemArea.innerHTML = `
    <div id="item"><p>${translateArray[0]}</p></div>
    <div id="item"><p>${translateArray[1]}</p></div>
    <div id="item"><p>${translateArray[2]}</p></div>
    <div id="item"><p>${translateArray[3]}</p></div>
  `
  
  fillProgressBar(initDictionary, currentDictionary)
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

  const chooseWord = event.target.closest('div')

  if (chooseWord.id !== 'item') return

  if (chooseWord.textContent === currentDictionary.data[0].translate) {
    chooseWord.style.backgroundColor = system_colors.success

    await new Promise(r => setTimeout(r, 300));

    await askForRepetitionFeedback()
  } else {
    chooseWord.style.backgroundColor = system_colors.failed

    await new Promise(r => setTimeout(r, 300));

    await modifyStudyLevel({ studyWord: currentDictionary.data[0].word, resolution: 'FAIL' })

    await renderPage()
  }
}

// TODO: refactor and replace as a pure fn a bit later.
async function askForRepetitionFeedback() {
  const wordItem = document.querySelector('#wordItem')
  wordItem.textContent = 'How easy it was?'

  const itemArea = document.querySelector('.itemArea')
  itemArea.remove()

  const trainArea = content.querySelector('.trainArea')
  trainArea.insertAdjacentHTML('beforeend', feedbackArea)

  const feedbackBtnArea = trainArea.querySelector('.feedbackBtnArea')

  feedbackBtnArea.addEventListener('click', async (event) => {
    event.preventDefault()

    if (!event.target.dataset.action) return

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
      repeatBtn.addEventListener('click', () => new ChooseTraining().initPage(speechPart))
    }
  })
}

export default new ChooseTraining()