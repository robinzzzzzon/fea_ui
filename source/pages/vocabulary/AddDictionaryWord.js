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
              <label for="word" class="word-form__label">New Word <span class="required">*</span></label>
              <input type="text" class="word-form__input wordInput" id="word" placeholder="e.g., red tape">
            </div>
            <div class="word-form__field">
              <label for="translation" class="word-form__label">Translation <span class="required">*</span></label>
              <input type="text" class="word-form__input translateInput" id="translation" placeholder="e.g., excessive bureaucracy">
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
              <p class="word-form__message" id="formMessage"></p>
              <button class="btn btn--primary" id="addBtn" disabled>Confirm</button>
            </div>
          </div>
        </div>
      `

    const wordInput = document.querySelector('.wordInput')
    const translateInput = document.querySelector('.translateInput')
    const addBtn = document.querySelector('#addBtn')

    const toggleBtn = () => {
      addBtn.disabled = !wordInput.value.trim() || !translateInput.value.trim()
    }

    wordInput.addEventListener('input', toggleBtn)
    translateInput.addEventListener('input', toggleBtn)
    addBtn.addEventListener('click', this.sendNewWord)
  }

  async sendNewWord() {
    const word = document.querySelector('.wordInput')
    const translate = document.querySelector('.translateInput')
    const select = document.querySelector('.typeSelect')
    const studyCb = document.querySelector('#flexCheckDefault')
    const msg = document.querySelector('#formMessage')

    word.classList.remove('word-form__input--error')
    translate.classList.remove('word-form__input--error')
    msg.className = 'word-form__message'
    msg.textContent = ''

    if (select.options[0].selected) {
      msg.textContent = 'Please select a word type.'
      msg.classList.add('word-form__message--error')
      return
    }

    const newWord = {
      word: word.value.trim().toLowerCase(),
      translate: translate.value.trim().toLowerCase(),
      wordType: select.options[select.selectedIndex].text,
    }

    const duplicate = await makeRequest({ methodType: 'GET', getUrl: `${domain}/words/init/`, getParams: { word: newWord.word } })

    if (duplicate.data.length) {
      word.classList.add('word-form__input--error')
      msg.textContent = 'This word already exists in the dictionary.'
      msg.classList.add('word-form__message--error')
      return
    }

    await makeRequest({ methodType: 'POST', getUrl: `${domain}/words/init/`, getBody: newWord })

    if (studyCb.checked) {
      await makeRequest({ methodType: 'POST', getUrl: `${domain}/words/study/`, getBody: newWord })
    }

    msg.textContent = `"${newWord.word}" added!`
    msg.classList.add('word-form__message--success')

    setTimeout(() => new AddDictionaryWord().renderPage(), 1500)
  }
}

export default new AddDictionaryWord()
