import '../../styles/essayConfiguration.css'
import EssayTraining from './EssayTraining'

class EssayConfiguration {
  renderPage(event) {
    event.preventDefault()
  
    const contentRoot = document.querySelector('.content')
  
    contentRoot.innerHTML = `
    <div class="essayConfRoot">
      <label for="themes">Choose relevant topic:</label>
      <select class="form-select form-select-lg" id="themes" aria-label="essay_themes">
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

      <label for="count">Choose count of topics:</label>
      <select class="form-select form-select-lg" id="count" aria-label="topics_count">
        <option selected value="1">5</option>
        <option value="2">10</option>
        <option value="3">20</option>
      </select>
  
      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" role="switch" id="idioms">
        <label class="form-check-label" for="idioms">Should you use the idioms only?</label>
      </div>
      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" role="switch" id="validation">
        <label class="form-check-label" for="validation">Should it validate only severe mistakes?</label>
      </div>
      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" role="switch" id="behavior">
        <label class="form-check-label" for="behavior">Should it normilize an informal way of your essay?</label>
      </div>
  
      <button class="myBtn" id="confirmBtn">Confirm</button>
    </div>
    `
  
    const confirmBtn = document.querySelector('#confirmBtn')
    
    confirmBtn.addEventListener('click', this.startTraining)
  }

  async startTraining(event) {
    event.preventDefault()

    let config = document.querySelectorAll('.essayConfRoot select')

    config = Array.from(config).map((select) => select.options[select.selectedIndex].text)

    const validationToggle = document.querySelector('#validation')
    config.push(validationToggle.checked)
    const behaviorToggle = document.querySelector('#behavior')
    config.push(behaviorToggle.checked)
    const idiomsToggle = document.querySelector('#idioms')
    config.push(idiomsToggle.checked)

    await EssayTraining.renderPage(event, config)
  }
}

export default new EssayConfiguration()