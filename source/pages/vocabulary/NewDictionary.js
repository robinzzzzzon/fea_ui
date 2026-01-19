import SeekNewWord from './SeekNewWord'
import { speechList, domain, spinner, add_icon, getModalWindow } from '../../utils/constants'
import { colorizeDeck, makeRequest } from '../../utils/utils'

const content = document.querySelector('.content')

class NewDictionary {
  async renderPage() {
    content.innerHTML = spinner

    let dictionaryRoot = document.createElement('div')
    dictionaryRoot.classList.add('actionRoot')

    let dbInitDeckList = await makeRequest({
      methodType: 'GET',
      getUrl: `${domain}/decks/init/`,
    })

    const deckList = dbInitDeckList.data.length ? dbInitDeckList.data : speechList
  
    for (let index = 0; index < deckList.length; index++) {
      const deck = document.createElement('button')
      deck.classList.add('dictionary')
      deck.classList.add('shadow-lg')

      if (deckList[index].color) {
        deck.style.backgroundColor = deckList[index].color
      } else {
        deckList[index].color = deck.style.backgroundColor = colorizeDeck()
      }
      
      deck.setAttribute('data-name', deckList[index].dataName)
      deck.textContent = deckList[index].dataName.toUpperCase()
  
      const initList = await makeRequest({
        methodType: 'GET',
        getUrl: `${domain}/words/init/`,
        getParams: { wordType: deckList[index].dataName },
      })
  
      const studyList = await makeRequest({
        methodType: 'GET',
        getUrl: `${domain}/words/study/`,
        getParams: { wordType: deckList[index].dataName },
      })

      const dictionaryWrapper = document.createElement('div')
      dictionaryWrapper.classList.add('dictionary-wrap')
      dictionaryWrapper.append(deck)
  
      if (initList.data.length === studyList.data.length) {
        deck.disabled = 'true'
      } else {
        dictionaryWrapper.insertAdjacentHTML('beforeend', add_icon)
        const addDeckBtn = dictionaryWrapper.querySelectorAll('button')[1]
        addDeckBtn.addEventListener('click', this.addDeckToStudyList)
      }

      dictionaryRoot.append(dictionaryWrapper)
    }

    if (!dbInitDeckList.data.length) {
      await makeRequest({
        methodType: 'POST',
        getUrl: `${domain}/decks/init/all`,
        getBody: { deckList }
      })
    }
  
    content.innerHTML = ''
    content.append(dictionaryRoot)
  
    dictionaryRoot.addEventListener('click', async (event) => {
      event.preventDefault()
  
      if (!event.target.dataset.name) return
  
      const name = event.target.dataset.name
  
      await SeekNewWord.initPage(name)
    })
  }

  addDeckToStudyList(event) {
    const addDeckBtn = event.target.closest('button[data-action]');

    if (!addDeckBtn) return;

    const wrapper = addDeckBtn.closest('.dictionary-wrap');

    const deckBtn = wrapper.querySelector('button[data-name]');

    const actionRoot = document.querySelector('.actionRoot')
    
    actionRoot.insertAdjacentHTML('afterbegin', getModalWindow({ 
      title: 'Do you really want to start studying all words of this dictionary?',
      description: 'After confirmation this deck will be added to your current study list!',
      actionBtnText: 'Add'
    }))
  
    const modalRoot = document.querySelector('.c-modal')
  
    modalRoot.addEventListener('click', async (event) => {
      event.preventDefault()
  
      if (!event.target.dataset.action) return
  
      const modalTarget = event.target.closest('[data-action]')
  
      if (modalTarget.dataset.action === 'closeWindow' || modalTarget.dataset.action === 'cancelAction') {
        modalRoot.remove()
      } else if (modalTarget.dataset.action === 'doAction') {
        let deckWordList = await makeRequest({
          methodType: 'GET',
          getUrl: `${domain}/words/init/`,
          getParams: { wordType: deckBtn.dataset.name },
        })

        await makeRequest({
          methodType: 'POST',
          getUrl: `${domain}/words/study/deck`,
          getBody: { wordList: deckWordList }
        })
    
        await new NewDictionary().renderPage()
      }
    })
  }
}

export default new NewDictionary()