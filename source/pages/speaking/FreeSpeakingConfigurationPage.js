import PageController from '../../core/PageController'
import FreeSpeakingTrainingPage from './FreeSpeakingTrainingPage'

export default class FreeSpeakingConfigurationPage extends PageController {

  async onMount() {
    const contentRoot = document.querySelector('.content')

    contentRoot.innerHTML = `
      <div class="speak-form">
        <div class="gpt-inputs">
          <input type="text" class="word-form__input" id="gptKey" placeholder="sk-...">
          <input type="text" class="word-form__input" id="gptModel" placeholder="model name">
        </div>

        <div class="speak-form__selects">
          <div class="speak-form__field">
            <label class="word-form__label" for="themes">Choose relevant topic:</label>
            <select class="word-form__select" id="themes" aria-label="topic_themes">
              <option selected value="1">Sport</option>
              <option value="2">Education</option>
              <option value="3">Relationship</option>
              <option value="4">Travellings</option>
              <option value="5">Politics</option>
              <option value="6">Psychology</option>
              <option value="7">IT</option>
              <option value="8">Universe</option>
              <option value="9">Economy</option>
              <option value="10">Music</option>
              <option value="11">Philosophy</option>
              <option value="12">Cinema</option>
              <option value="13">Family</option>
              <option value="14">Random topic</option>
            </select>
          </div>
          <div class="speak-form__field">
            <label class="word-form__label" for="count">Choose count of topics:</label>
            <select class="word-form__select" id="count" aria-label="topics_count">
              <option selected value="1">5</option>
              <option value="2">10</option>
              <option value="3">20</option>
            </select>
          </div>
        </div>

        <div class="speak-form__toggles">
          <label class="speak-form__toggle">
            <input type="checkbox" id="idioms">
            <span class="speak-form__toggle-label">Should you use the idioms only?</span>
          </label>
          <label class="speak-form__toggle">
            <input type="checkbox" id="needTimer">
            <span class="speak-form__toggle-label">Do you need a timer?</span>
          </label>
        </div>

        <div class="speak-form__actions">
          <button class="btn btn--primary" id="confirmBtn">Confirm</button>
        </div>
      </div>
    `

    const confirmBtn = document.querySelector('#confirmBtn')

    confirmBtn.disabled = true

    this.addListener(confirmBtn, 'click', () => this.startTraining())

    const keyInput = document.querySelector('#gptKey')

    this.addListener(keyInput, 'input', () => {
      confirmBtn.disabled = !keyInput.value
    })

    const inputs = contentRoot.querySelectorAll('input, select')

    inputs.forEach((input) => {
      this.addListener(input, 'keydown', (event) => {
        if (event.key === 'Enter' && !confirmBtn.disabled) confirmBtn.click()
      })
    })
  }

  async startTraining() {
    const config = {}

    config.gptKey = document.querySelector('#gptKey').value
    config.gptModel = document.querySelector('#gptModel').value

    let selectList = document.querySelectorAll('.speak-form select')

    selectList = Array.from(selectList).map(
      (select) => select.options[select.selectedIndex].text
    )

    config.topicTheme = selectList[0]
    config.topicCount = selectList[1]
    config.onlyIdioms = document.querySelector('#idioms').checked
    config.needTimer = document.querySelector('#needTimer').checked

    await this.unmount()

    const next = new FreeSpeakingTrainingPage()

    await next.mount({ config })
  }
}
