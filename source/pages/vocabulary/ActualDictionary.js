import '../../styles/actualDictionary.css'
import NewDictionary from './NewDictionary'
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
      <p>Your study list is empty. You might add new words for studying via decks.</p>
      <button class="myBtn" id="understandBtn">Got it</button>
    </div>
    `

    const understandBtn = document.querySelector('#understandBtn')
    
    understandBtn.addEventListener('click', async () => NewDictionary.renderPage())
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

  actualDictionaryRoot.addEventListener('click', async (event) => {
    event.preventDefault()

    if (event.target.tagName !== 'BUTTON') return

    const targetBtn = event.target.closest('button')

    if (targetBtn.id === 'clearProgress') {
      await clearWordProgress(event)
    } else if (targetBtn.id === 'removeWord') {
      await removeWord(event)
    }
  })
}

async function clearWordProgress(event) {
  event.preventDefault()

  const itemRoot = event.target.parentNode.parentNode

  const itemWordText = itemRoot.querySelector('#word').textContent

  const getWordList = await makeRequest({
    methodType: 'GET',
    getUrl: `${domain}/words/study`,
    getParams: { word: itemWordText }
  })

  const word = getWordList.data[0]

  word.studyInterval = 1
  word.coefficient = 2.5

  await makeRequest({
    methodType: 'UPDATE',
    getUrl: `${domain}/words/study/${word._id}`,
    getBody: word,
  })
}

async function removeWord(event) {
  event.preventDefault()

  const itemRoot = event.target.parentNode.parentNode

  const itemWordText = itemRoot.querySelector('#word').textContent

  let itemIndex

  studyList.data.forEach((item, index) => {
    if (item.word === itemWordText) {
      itemIndex = index
    }
  })

  content.innerHTML = spinner

  const getWordList = await makeRequest({
    methodType: 'GET',
    getUrl: `${domain}/words/study`,
    getParams: { word: itemWordText }
  })

  const word = getWordList.data[0]

  await makeRequest({
    methodType: 'DELETE',
    getUrl: `${domain}/words/study/${word._id}`,
  })

  studyList.data = Array.from(studyList.data).filter((item) => item.word !== itemWordText)

  renderPage(itemIndex)
}

export default new ActualDictionary()