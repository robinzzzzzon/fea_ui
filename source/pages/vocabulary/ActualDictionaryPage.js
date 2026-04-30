import PageController from '../../core/PageController'
import NewDictionaryPage from './NewDictionaryPage'
import { domain, spinner, mascotThinking } from '../../utils/constants'
import { makeRequest } from '../../utils/utils'

export default class ActualDictionaryPage extends PageController {

  async onMount() {
    this.studyList = null

    const content = document.querySelector('.content')

    content.innerHTML = spinner

    this.studyList = await makeRequest({ methodType: 'GET', getUrl: `${domain}/words/study` })

    this.renderPage()
  }

  renderPage(itemIndex) {
    const content = document.querySelector('.content')

    content.innerHTML = '<ul class="word-list"></ul>'

    const wordList = document.querySelector('.word-list')

    if (!this.studyList.data.length) {
      content.innerHTML = `
        <div class="empty-state-hero">
          ${mascotThinking}
          <p class="mascot-state__title">Your study list is empty ^-^</p>
          <button class="btn btn--primary" id="chooseWordsBtn">Choose words</button>
        </div>
      `

      this.addListener(document.querySelector('#chooseWordsBtn'), 'click', async () => {
        await this.unmount()

        const next = new NewDictionaryPage()

        await next.mount()
      })

      return
    }

    for (let index = 0; index < this.studyList.data.length; index++) {
      const item = document.createElement('li')

      item.classList.add('word-item')
      item.innerHTML = `
        <div class="word-item__word">${this.studyList.data[index].word}</div>
        <div class="word-item__translate">${this.studyList.data[index].translate}</div>
        <div class="word-item__actions">
          <button class="btn btn--secondary" id="clearProgress" data-tooltip="Reset study progress">Reset</button>
          <button class="btn btn--destructive" id="removeWord">Delete</button>
        </div>
      `

      wordList.append(item)
    }

    const windowInnerHeight = window.innerHeight - 250
    const wordListHeight = getComputedStyle(wordList).height.substring(0, 4)

    if (windowInnerHeight < +wordListHeight) {
      wordList.style.height = `${windowInnerHeight}px`
      wordList.style.overflow = 'scroll'

      if (itemIndex) {
        document.querySelector(`.word-list > li:nth-child(${itemIndex - 1})`).scrollIntoView()
      }
    }

    this.addListener(wordList, 'click', async (event) => {
      event.preventDefault()

      if (event.target.tagName !== 'BUTTON') return

      const targetBtn = event.target.closest('button')

      if (targetBtn.id === 'clearProgress') {
        await this.clearWordProgress(event)
      } else if (targetBtn.id === 'removeWord') {
        await this.removeWord(event)
      }
    })
  }

  async clearWordProgress(event) {
    event.preventDefault()

    const itemRoot = event.target.parentNode.parentNode
    const itemWordText = itemRoot.querySelector('.word-item__word').textContent

    const getWordList = await makeRequest({
      methodType: 'GET',
      getUrl: `${domain}/words/study`,
      getParams: { word: itemWordText },
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

  async removeWord(event) {
    event.preventDefault()

    const itemRoot = event.target.parentNode.parentNode
    const itemWordText = itemRoot.querySelector('.word-item__word').textContent

    let itemIndex

    this.studyList.data.forEach((item, index) => {
      if (item.word === itemWordText) {
        itemIndex = index
      }
    })

    const content = document.querySelector('.content')

    content.innerHTML = spinner

    const getWordList = await makeRequest({
      methodType: 'GET',
      getUrl: `${domain}/words/study`,
      getParams: { word: itemWordText },
    })

    const word = getWordList.data[0]

    await makeRequest({
      methodType: 'DELETE',
      getUrl: `${domain}/words/study/${word._id}`,
    })

    this.studyList.data = Array.from(this.studyList.data).filter((item) => item.word !== itemWordText)

    this.renderPage(itemIndex)
  }
}
