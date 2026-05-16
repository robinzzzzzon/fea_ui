import PageController from '../../core/PageController'
import NewDictionaryPage from './NewDictionaryPage'
import { domain, spinner, mascotThinking } from '../../utils/constants'
import { makeRequest, escapeHtml } from '../../utils/utils'

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
      item.dataset.id = this.studyList.data[index]._id
      item.innerHTML = `
        <div class="word-item__word">${escapeHtml(this.studyList.data[index].word)}</div>
        <div class="word-item__translate">${escapeHtml(this.studyList.data[index].translate)}</div>
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

    const itemId = event.target.parentNode.parentNode.dataset.id
    const word = this.studyList.data.find(w => w._id === itemId)

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
    const itemId = itemRoot.dataset.id
    const itemIndex = this.studyList.data.findIndex(w => w._id === itemId)

    const content = document.querySelector('.content')

    content.innerHTML = spinner

    await makeRequest({
      methodType: 'DELETE',
      getUrl: `${domain}/words/study/${itemId}`,
    })

    this.studyList.data = this.studyList.data.filter(w => w._id !== itemId)

    this.renderPage(itemIndex)
  }
}
