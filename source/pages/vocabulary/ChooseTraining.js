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
          <div id="wordItem">${currentDictionary.data[0].word}</div>
          <div class="itemArea">
              <div id="item">${translateArray[0]}</div>
              <div id="item">${translateArray[1]}</div>
              <div id="item">${translateArray[2]}</div>
              <div id="item">${translateArray[3]}</div>
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

  const chooseWord = event.target

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
            <div class="finishArea">
                <div id="finishWordArea">Вы хорошо позанимались!</div>
                <div class="finishBtnArea">
                    <button type="button" class="myBtn btn-lg" id="findNewBtn">Новые слова</button>
                    <button type="button" class="myBtn btn-lg" id="retryBtn">Еще раз</button>
                </div>
            </div>
            `

    const findNewBtn = document.querySelector('#findNewBtn')
    const retryBtn = document.querySelector('#retryBtn')

    await checkAvailableStudyWords(speechPart)

    findNewBtn.addEventListener('click', NewDictionary.renderPage)
    retryBtn.addEventListener('click', () => new ChooseTraining().initPage(speechPart))
  } else {
    renderPage()
  }
}

export default new ChooseTraining()