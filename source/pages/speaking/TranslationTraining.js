import '../../styles/translationTraining.css'
import { spinner } from '../../utils/constants'
import { setTimer } from '../../utils/utils'
const apiGpt = require('../../utils/chatGptApi') // отдельно доработать

let trainingConfig = null;
let paragraphList = [];

const contentRoot = document.querySelector('.content')

class TranslationTraining {
    async initPage(event, config) {
        if (!trainingConfig) {
            trainingConfig = config
        }
    
        if (!paragraphList.length) {
            contentRoot.innerHTML = spinner
            paragraphList = await apiGpt.getRandomTextExamples(trainingConfig)
            paragraphList = paragraphList.choices[0].message.content.split('[SECTION]').filter(el => el)
        }
    
        renderPage(event, config)
    }
}

function renderPage(event, config) {
    event.preventDefault()

    contentRoot.innerHTML = `
        <div class='trainingRoot'>
            <div class='paragraphArea'>
                <p>${paragraphList.shift()}</p>
            </div>
            <div class='timerArea'>
                <div id='timer'></div>
                <div>
                    <button class='myBtn nextBtn'>Show next</button>
                </div>
            </div>
        </div>
        `
    
        if (config[2]) {
            const timerDiv = document.querySelector('#timer')
            setTimer(timerDiv, 3)
        }
    
        const nextBtn = document.querySelector('.nextBtn')
        nextBtn.addEventListener('click', showNextText)
}

function showNextText(event) {
    event.preventDefault()

    if(!paragraphList.length) {
        contentRoot.innerHTML = `
            <div class='trainingRoot'>
            <div class='paragraphArea'>
                <p>Ты отлично позанимался!</p>
            </div>
            <div class='timerArea'>
                <div id='timer'></div>
                <div>
                    <button class='myBtn nextBtn'>Want more</button>
                </div>
            </div>
        </div>
        `

        const nextBtn = document.querySelector('.nextBtn')
        nextBtn.addEventListener('click', () => renderPage(event, trainingConfig))
    } else {
        renderPage(event, trainingConfig)
    }
}

export default new TranslationTraining()