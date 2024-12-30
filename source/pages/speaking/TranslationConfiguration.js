import '../../styles/speakingConfiguration.css'
import TranslationTraining from'./TranslationTraining'

class TranslationConfiguration {
  renderPage(event) {
    event.preventDefault()
  
    const contentRoot = document.querySelector('.content')
  
    contentRoot.innerHTML = `
    <div class="speakingConfRoot">
      <label for="themes">Choose any interesting theme:</label>
      <select class="form-select form-select-lg" id="themes" aria-label="Translating Themes">
        <option selected value="1">Спорт</option>
        <option value="2">Образование</option>
        <option value="3">Отношения</option>
        <option value="4">Путешествия</option>
        <option value="5">Политика</option>
        <option value="6">Психология</option>
        <option value="8">IT</option>
        <option value="9">Экономика</option>
        <option value=10">Музыка и шоу-бизнес</option>
        <option value="11">Любая тема</option>
      </select>
  
      <label for="size">Choose words count for paragraph:</label>
      <select class="form-select form-select-lg" id="size" aria-label="Size of paragraph">
        <option selected value="1">110 - 150</option>
        <option value="2">160 - 200</option>
        <option value="3">210 - 250</option>
        <option value="4">260 - 300</option>
      </select>
  
      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" role="switch" id="needTimer">
        <label class="form-check-label" for="needTimer">Do you need a timer?</label>
      </div>
  
      <button class="myBtn" id="confirmBtn">Confirm</button>
    </div>
    `
  
    const confirmBtn = document.querySelector('#confirmBtn')
    
    confirmBtn.addEventListener('click', async (event) => {
      event.preventDefault()
  
      let config = document.querySelectorAll('.speakingConfRoot select')
  
      config = Array.from(config).map((select) => select.options[select.selectedIndex].text)
  
      const needTimer = document.querySelector('#needTimer')
      config.push(needTimer.checked)
  
      await TranslationTraining.initPage(event, config)
    })
  }
}

export default new TranslationConfiguration()