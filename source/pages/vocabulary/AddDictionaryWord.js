import '../../styles/addDictionaryWord.css'
import { domain } from '../../utils/constants'
import { makeRequest } from '../../utils/utils'

class AddDictionaryWord {
  content = document.querySelector('.content')

  renderPage() {
    this.content.innerHTML = `
        <div class="wordFormRoot">
          <div class="newWordInfo alert alert-primary" role="alert">
            Here you can add a new word to initial dictionary!
          </div>
          <div class="newWordContent">
            <div>
              <label for="word" class="form-label">New Word</label>
              <input type="text" class="wordInput form-control" id="word"></input>
            </div>
            <div>
              <label for="translation" class="form-label">Translation</label>
              <input type="text" class="translateInput form-control" id="translation"></input>
            </div>
            <div>
              <label for="type" class="form-label">Word type</label>
              <select class="typeSelect form-select" id="type">
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
            <div id="studyCb">
              <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault">
              <label class="form-check-label" for="flexCheckDefault">Add to study list</label>
            </div>
            <div>
              <button class="myBtn" id="addBtn">CONFIRM</button>
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
        newWord.studyLevel = 0
    
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