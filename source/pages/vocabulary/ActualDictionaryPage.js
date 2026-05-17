import PageController from '../../core/PageController'
import LevelSelectionPage from './LevelSelectionPage'
import { domain, spinner, mascotThinking } from '../../utils/constants'
import { makeRequest, escapeHtml } from '../../utils/utils'

export default class ActualDictionaryPage extends PageController {

  async onMount() {
    this.studyList = null
    this.activeCategory = null

    const content = document.querySelector('.content')

    content.innerHTML = spinner

    this.studyList = await makeRequest({ methodType: 'GET', getUrl: `${domain}/words/study` })

    this.renderPage()
  }

  getFilteredWords() {
    if (this.activeCategory === null) return this.studyList.data
    return this.studyList.data.filter(w => w.wordCategory === this.activeCategory)
  }

  renderPage(itemIndex) {
    const content = document.querySelector('.content')

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

        const next = new LevelSelectionPage()

        await next.mount({ target: 'new' })
      })

      return
    }

    const tabs = [
      { label: 'All', value: null },
      { label: 'Beginner', value: 1 },
      { label: 'Intermediate', value: 2 },
      { label: 'Advanced', value: 3 },
    ]

    content.innerHTML = `
      <div class="word-list-wrap">
        <div class="category-tabs">
          ${tabs.map((tab) => `
            <button type="button" class="category-tab ${tab.value === this.activeCategory ? 'category-tab--active' : ''}" data-category="${tab.value === null ? 'all' : tab.value}">${tab.label}</button>
          `).join('')}
        </div>
        <ul class="word-list"></ul>
      </div>
    `

    const tabsRoot = document.querySelector('.category-tabs')
    this.addListener(tabsRoot, 'click', (event) => {
      const tab = event.target.closest('.category-tab')
      if (!tab) return
      const raw = tab.dataset.category
      this.activeCategory = raw === 'all' ? null : Number(raw)
      this.renderPage()
    })

    const wordList = document.querySelector('.word-list')
    const filtered = this.getFilteredWords()

    if (!filtered.length) {
      wordList.innerHTML = `
        <li class="word-list__empty">No words at this level.</li>
      `
      return
    }

    for (let index = 0; index < filtered.length; index++) {
      const item = document.createElement('li')

      item.classList.add('word-item')
      item.dataset.id = filtered[index]._id
      item.innerHTML = `
        <div class="word-item__word">${escapeHtml(filtered[index].word)}</div>
        <div class="word-item__translate">${escapeHtml(filtered[index].translate)}</div>
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
