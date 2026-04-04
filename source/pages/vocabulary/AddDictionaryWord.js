import { domain } from '../../utils/constants'
import { makeRequest } from '../../utils/utils'

class AddDictionaryWord {
  content = document.querySelector('.content')

  renderPage() {
    this.content.innerHTML = `
        <div class="word-form">
          <p class="word-form__info">Here you can add a new word to initial dictionary!</p>
          <div class="word-form__fields">
            <div class="word-form__field">
              <label for="word" class="word-form__label">New Word</label>
              <input type="text" class="word-form__input wordInput" id="word">
            </div>
            <div class="word-form__field">
              <label for="translation" class="word-form__label">Translation</label>
              <input type="text" class="word-form__input translateInput" id="translation">
            </div>
            <div class="word-form__field">
              <label for="type" class="word-form__label">Word type</label>
              <select class="word-form__select typeSelect" id="type">
                <option selected disabled value="">choose type...</option>
                <option>nouns</option>
                <option>verbs</option>
                <option>phrasal verbs</option>
                <option>adjectives</option>
                <option>adverbs</option>
                <option>pronouns</option>
                <option>numerals</option>
                <option>other parts</option>
                <option>idioms</option>
                <option>useful phrases</option>
                <option>it phrases</option>
              </select>
            </div>
            <div class="word-form__field">
              <label class="word-form__label">&nbsp;</label>
              <div class="word-form__check">
                <input type="checkbox" value="" id="flexCheckDefault">
                <label for="flexCheckDefault">Add to study list</label>
              </div>
            </div>
            <div class="word-form__actions">
              <button class="btn btn--primary" id="addBtn">Confirm</button>
            </div>
          </div>
        </div>
      `

    const addBtn = document.querySelector('#addBtn')

    addBtn.addEventListener('click', this.sendNewWord)
  }

  async sendNewWord() {
    const word = document.querySelector('.wordInput')
    const translate = document.querySelector('.translateInput')
    const select = document.querySelector('.typeSelect')
    const studyCb = document.querySelector('#flexCheckDefault')

    if (!word.value || !translate.value || select.options[0].selected) return

    const newWord = {
      word: word.value.toLowerCase(),
      translate: translate.value.toLowerCase(),
      wordType: select.options[select.selectedIndex].text,
    }

    const duplicate = await makeRequest({ methodType: 'GET', getUrl: `${domain}/words/init/`, getParams: { word: newWord.word }})

    if (!duplicate.data.length) {
      await makeRequest({ methodType: 'POST', getUrl: `${domain}/words/init/`, getBody: newWord })

      if (studyCb.checked) {
        await makeRequest({
          methodType: 'POST',
          getUrl: `${domain}/words/study/`,
          getBody: newWord,
        })
      }
    }

    new AddDictionaryWord().renderPage()
  }
}

export default new AddDictionaryWord()
