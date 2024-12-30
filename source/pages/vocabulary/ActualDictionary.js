import '../../styles/actualDictionary.css'
import NewDictionary from'./NewDictionary'
import { domain, spinner } from '../../utils/constants'
import { makeRequest } from '../../utils/utils'

const content = document.querySelector('.content')

let studyList = null

class ActualDictionary {
  async initPage() {
    content.innerHTML = spinner
  
    studyList = await makeRequest({ methodType: 'GET', getUrl: `${domain}/words/study` })
  
    renderPage()
  }
}

function renderPage(itemIndex) {
  content.innerHTML = `<div class="actualDictionaryRoot"></div>`

  const actualDictionaryRoot = document.querySelector('.actualDictionaryRoot')

  if (!studyList.data.length) {
    actualDictionaryRoot.innerHTML = `
    <div>
      <p>Список изучаемых слов пуст. Вы можете добавить новые</p>
      <button class="myBtn" id="understandBtn">Понятно</button>
    </div>
    `

    const understandBtn = document.querySelector('#understandBtn')
    
    understandBtn.addEventListener('click', NewDictionary.renderPage)
  }

  for (let index = 0; index < studyList.data.length; index++) {
    const item = document.createElement('div')
    item.classList.add('actualItem')
    item.classList.add('shadow-sm')
    item.innerHTML = `
      <div id="word">${studyList.data[index].word}</div>
      <div id="translate">${studyList.data[index].translate}</div>
      <div class="wordBtnRoot">
        <button class="btn btn-outline-secondary btn-sm" id="clearProgress">Reset</button>
        <button class="btn btn-outline-warning btn-sm" id="removeWord">Delete</button>
      </div>
    `

    actualDictionaryRoot.append(item)
    item.addEventListener('click', clearWordProgress)
    item.addEventListener('click', removeWord)
  }

  let windowInnerHeight = window.innerHeight - 250
  let actualDictionaryRootHeight = getComputedStyle(actualDictionaryRoot).height.substring(0, 4)

  if (windowInnerHeight < +actualDictionaryRootHeight) {
    actualDictionaryRoot.style.height = `${windowInnerHeight}px`
    actualDictionaryRoot.style.overflow = 'scroll'

    if (itemIndex) {
      document.querySelector(`.actualDictionaryRoot > div:nth-child(${itemIndex - 1})`).scrollIntoView()
    }
  }
}

async function clearWordProgress(event) {
  event.preventDefault()

  const clearBtn = event.target

  if (clearBtn.id !== 'clearProgress') return

  const itemWordText = this.querySelector('div').textContent

  studyList.data.forEach((item) => {
    if (item.word === itemWordText) {
      item.studyLevel = 0
      
      makeRequest({
        methodType: 'UPDATE',
        getUrl: `${domain}/words/study/${item._id}`,
        getBody: item,
      })
    }
  })
}

async function removeWord(event) {
  event.preventDefault()

  const removeBtn = event.target

  if (removeBtn.id !== 'removeWord') return

  const thisWordText = this.querySelector('div').textContent

  let itemIndex

  studyList.data.forEach((item, index) => {
    if (item.word === thisWordText) {
      itemIndex = index

      content.innerHTML = spinner

      makeRequest({
        methodType: 'DELETE',
        getUrl: `${domain}/words/study/${item._id}`,
      })
    }
  })

  studyList.data = Array.from(studyList.data).filter((item) => item.word !== thisWordText)

  renderPage(itemIndex)
}

export default new ActualDictionary()