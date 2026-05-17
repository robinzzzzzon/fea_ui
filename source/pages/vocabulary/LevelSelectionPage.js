import PageController from '../../core/PageController'
import NewDictionaryPage from './NewDictionaryPage'
import StudyDictionaryPage from './StudyDictionaryPage'
import { domain, spinner } from '../../utils/constants'
import { makeRequest, checkAvailableStudyWords } from '../../utils/utils'

const LEVELS = [
  { wordCategory: 1, label: 'Beginner', sub: 'A1–A2', tone: 'beginner' },
  { wordCategory: 2, label: 'Intermediate', sub: 'B1–B2', tone: 'intermediate' },
  { wordCategory: 3, label: 'Advanced', sub: 'C1–C2', tone: 'advanced' },
]

export default class LevelSelectionPage extends PageController {

  async onMount({ target } = {}) {
    this.target = target === 'study' ? 'study' : 'new'

    const content = document.querySelector('.content')

    content.innerHTML = spinner

    const counts = await Promise.all(LEVELS.map((level) => this.getAvailableCount(level.wordCategory)))

    content.innerHTML = `
      <div class="level-list">
        ${LEVELS.map((level, index) => `
          <button class="level-card level-card--${level.tone}" data-word-category="${level.wordCategory}" ${counts[index] === 0 ? 'disabled' : ''}>
            <span class="level-card__label">${level.label}</span>
            <span class="level-card__sub">${level.sub}</span>
            <span class="card-count-badge">${counts[index]}</span>
          </button>
        `).join('')}
      </div>
    `

    this.addListener(content.querySelector('.level-list'), 'click', (event) => this.handleLevelClick(event))
  }

  async getAvailableCount(wordCategory) {
    if (this.target === 'new') {
      const initList = await makeRequest({
        methodType: 'GET',
        getUrl: `${domain}/words/init/`,
        getParams: { wordCategory },
      })

      const studyList = await makeRequest({
        methodType: 'GET',
        getUrl: `${domain}/words/study/`,
        getParams: { wordCategory },
      })

      return initList.data.length - studyList.data.length
    }

    let studyList = await makeRequest({
      methodType: 'GET',
      getUrl: `${domain}/words/study/`,
      getParams: { wordCategory },
    })

    studyList = await checkAvailableStudyWords({ studyList })

    return studyList.data.length
  }

  async handleLevelClick(event) {
    const card = event.target.closest('.level-card')

    if (!card || card.disabled) return

    const wordCategory = Number(card.dataset.wordCategory)

    await this.unmount()

    const next = this.target === 'new' ? new NewDictionaryPage() : new StudyDictionaryPage()
    
    await next.mount({ wordCategory })
  }
}
