import '../../styles/chooseTraining.css'
import NewDictionary from './NewDictionary'
import { makeRequest, fillArray, fillProgressBar, modifyStudyLevel, checkAvailableStudyWords } from '../../utils/utils'
import { domain, spinner, system_colors } from '../../utils/constants'

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
      currentDictionary = await fillArray(speechPart)
    }
  
    renderPage()
  }
}

async function renderPage() {
  const translateArray = await getRandomTranslateArray(currentDictionary.data[0])
  
    content.innerHTML = `
      <div class="wrapper">
        <div class="myProgressBar shadow"></div>
        <div class="trainArea shadow">
          <div id="wordItem"><p>${currentDictionary.data[0].word}</p></div>
          <div class="itemArea">
              <div id="item"><p>${translateArray[0]}</p></div>
              <div id="item"><p>${translateArray[1]}</p></div>
              <div id="item"><p>${translateArray[2]}</p></div>
              <div id="item"><p>${translateArray[3]}</p></div>
          </div>
        </div>
      </div>
      `
  
    fillProgressBar(initDictionary, currentDictionary)
  
    const itemArea = document.querySelector('.itemArea')
    itemArea.addEventListener('click', checkChooseWord)
}

async function getRandomTranslateArray(studyWord) {
  if (!fullDictionary) {
    fullDictionary = await makeRequest({
      methodType: 'GET',
      getUrl: `${domain}/words/init/`,
    })
  }

  let translateArray = []
  const getTranslate = studyWord.translate

  for (let index = 0; translateArray.length < 3; index++) {
    const translate =
      fullDictionary.data[Math.floor(Math.random() * fullDictionary.data.length)].translate
    if (!translateArray.includes(translate) && translate !== getTranslate) {
      translateArray.push(translate)
    }
  }

  translateArray.push(getTranslate)

  return translateArray.sort(() => Math.random() - 0.5)
}

async function checkChooseWord(event) {
  event.preventDefault()

  const chooseWord = event.target.closest('div')

  if (chooseWord.id !== 'item') return

  if (chooseWord.textContent === currentDictionary.data[0].translate) {
    chooseWord.style.backgroundColor = system_colors.success
    await modifyStudyLevel(currentDictionary.data[0].word, true)
    currentDictionary.data.shift()
  } else {
    chooseWord.style.backgroundColor = system_colors.failed
    await modifyStudyLevel(currentDictionary.data[0].word)
  }

  if (!currentDictionary.data.length) {
    currentDictionary = null
    initDictionary = null

    content.innerHTML = `
            <div class="wrapper">
              <div class="myProgressBar shadow"></div>
              <div class="trainArea shadow">
                <div id="wordItem"><p>It was great!</p></div>
                <div class="finishBtnArea">
                    <button type="button" class="myBtn btn-lg" id="findNewBtn">New words</button>
                    <button type="button" class="myBtn btn-lg" id="repeatBtn">Repeat</button>
                </div>
              </div>
            </div>
            `

    const findNewBtn = document.querySelector('#findNewBtn')
    const repeatBtn = document.querySelector('#repeatBtn')

    await checkAvailableStudyWords(speechPart)

    findNewBtn.addEventListener('click', NewDictionary.renderPage)
    repeatBtn.addEventListener('click', () => new ChooseTraining().initPage(speechPart))
  } else {
    setTimeout(() => {
      renderPage()
    }, 200)
  }
}

export default new ChooseTraining()