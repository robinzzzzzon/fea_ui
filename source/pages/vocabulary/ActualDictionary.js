import NewDictionary from './NewDictionary'
import { domain, spinner, mascotThinking } from '../../utils/constants'
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
  content.innerHTML = `<ul class="word-list"></ul>`

  const wordList = document.querySelector('.word-list')

  if (!studyList.data.length) {
    content.innerHTML = `
      <div class="empty-state-hero">
        ${mascotThinking}
        <p class="mascot-state__title">Your study list is empty :)</p>
        <button class="btn btn--primary" id="chooseWordsBtn">Choose words</button>
      </div>
    `
    document.querySelector('#chooseWordsBtn').addEventListener('click', () => NewDictionary.renderPage())
    return
  }

  for (let index = 0; index < studyList.data.length; index++) {
    const item = document.createElement('li')
    item.classList.add('word-item')
    item.innerHTML = `
      <div class="word-item__word">${studyList.data[index].word}</div>
      <div class="word-item__translate">${studyList.data[index].translate}</div>
      <div class="word-item__actions">
        <button class="btn btn--secondary" id="clearProgress" data-tooltip="Reset study progress">Reset</button>
        <button class="btn btn--destructive" id="removeWord">Delete</button>
      </div>
    `

    wordList.append(item)
  }

  let windowInnerHeight = window.innerHeight - 250
  let wordListHeight = getComputedStyle(wordList).height.substring(0, 4)

  if (windowInnerHeight < +wordListHeight) {
    wordList.style.height = `${windowInnerHeight}px`
    wordList.style.overflow = 'scroll'

    if (itemIndex) {
      document.querySelector(`.word-list > li:nth-child(${itemIndex - 1})`).scrollIntoView()
    }
  }

  wordList.addEventListener('click', async (event) => {
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

  const itemWordText = itemRoot.querySelector('.word-item__word').textContent

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

  const itemWordText = itemRoot.querySelector('.word-item__word').textContent

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
