import axios from 'axios'
import { domain } from './constants'

export async function filterCurrentDictionary(dictionary, speechPart) {
  let studyArray = await makeRequest({
    methodType: 'GET',
    getUrl: `${domain}/words/study/`,
    getParams: { wordType: speechPart },
  })

  if (studyArray.data.length) {
    studyArray = studyArray.data.map((item) => item.word)

    dictionary.data = dictionary.data.filter((item) => !studyArray.includes(item.word))
  }

  return dictionary
}

export async function fillArray(speechPart) {
  let array = []

  speechPart === 'all-study-words'
    ? (array = await makeRequest({
        methodType: 'GET',
        getUrl: `${domain}/words/study`,
      }))
    : (array = await makeRequest({
        methodType: 'GET',
        getUrl: `${domain}/words/study`,
        getParams: { wordType: speechPart },
      }))

  return array
}

export async function modifyStudyLevel(getWord, isRight) {
  let currentWord = await makeRequest({
    methodType: 'GET',
    getUrl: `${domain}/words/study/`,
    getParams: { word: getWord },
  })

  currentWord = currentWord.data[0]

  if (isRight) {
    if (currentWord.studyLevel === 4) {
      await makeRequest({
        methodType: 'DELETE',
        getUrl: `${domain}/words/study/${currentWord._id}`,
      })

      return
    }

    currentWord.studyLevel++

    await makeRequest({
      methodType: 'UPDATE',
      getUrl: `${domain}/words/study/${currentWord._id}`,
      getBody: currentWord,
    })
  } else {
    if (currentWord.studyLevel === 0) return

    currentWord.studyLevel--

    await makeRequest({
      methodType: 'UPDATE',
      getUrl: `${domain}/words/study/${currentWord._id}`,
      getBody: currentWord,
    })
  }
}

export function fillProgressBar(initDictionary, currentDictionary, selector = '.myProgressBar') {
  const progressBar = document.querySelector(selector)
  progressBar.style.gridTemplateColumns = `repeat(${initDictionary.data.length}, 1fr)`

  for (let index = 0; index < initDictionary.data.length; index++) {
    const item = document.createElement('div')
    progressBar.append(item)
  }

  const colorizeLength = initDictionary.data.length - currentDictionary.data.length

  let itemList = document.querySelector(selector).childNodes
  itemList = Array.from(itemList)

  for (let index = 0; index < colorizeLength; index++) {
    itemList[index].style.backgroundColor = '#98FB98'
  }
}

export async function checkAvailableStudyWords(speechPart) {
  let studyList = await fillArray(speechPart)

  if (!studyList.data.length) retryBtn.disabled = 'true'
}

export function getRandomListBySpeechPart(dictionary, speechPart, size) {
  const speechDictionary = dictionary.filter((item) => item.wordType === speechPart)
  let randomList = []

  while (randomList.length !== size) {
    const phrase = speechDictionary[Math.floor(Math.random() * speechDictionary.length)]

    if (!randomList.includes(phrase)) randomList.push(phrase)
  }

  return randomList
}

export function optimizeCharacters(chars) {
  let finalChars = []

    finalChars = chars.reduce((total, el) => {

      el === ' ' ? el = '_' : el

      if (!finalChars.includes(el)) {
        finalChars.push(el)
        total.push({ element: el, count: 1 })
      } else {
        total.forEach(obj => {
           if (obj.element === el) {
            obj.count++
           }
        });
      }
  
      return total
    }, [])
  
    return finalChars
}

export function getRandomTopic(topicList) {
  return topicList[Math.floor(Math.random() * topicList.length)]
}

export function setTimer(element, interval = 20) {
  interval--
  let seconds = 59
  setTimeout(function counter() {
    if (!interval && seconds < 0) {
      element.textContent = ''
      return
    } else if (seconds < 10) {
      if (seconds < 0) {
        interval--
        seconds = 59
      } else {
        seconds = `0${seconds}`
      }
    } else if (interval < 10 && !interval.toString().startsWith('0')) {
      interval = `0${interval}`
    }

    element.textContent = `${interval}:${seconds}`

    seconds--
    setTimeout(counter, 1000)
  }, 1000)
}

export async function makeRequest({ methodType, getUrl, getBody, getParams }) {
  let res = null

  switch (methodType) {
    case 'GET':
      res = await axios.get(getUrl, { params: getParams })
      break

    case 'POST': {
      res = await axios.post(getUrl, getBody)
      break
    }

    case 'UPDATE': {
      res = await axios.put(getUrl, getBody)
      break
    }

    case 'DELETE': {
      res = await axios.delete(getUrl)
      break
    }
  }

  return res
}
