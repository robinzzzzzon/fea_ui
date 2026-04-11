module.exports = {
  domain: 'http://127.0.0.1:3001/api',

  alphabetList: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',

  speechList: [
    { dataName: 'verbs' },
    { dataName: 'phrasal verbs' },
    { dataName: 'nouns' },
    { dataName: 'adjectives' },
    { dataName: 'adverbs' },
    { dataName: 'pronouns' },
    { dataName: 'numerals' },
    { dataName: 'other parts' },
    { dataName: 'idioms' },
    { dataName: 'useful phrases' },
    { dataName: 'it phrases' },
  ],

  getModalWindow({ title, description, actionBtnText }) {
    return `
    <div class="c-modal">
        <div class="c-overlay">
          <div class="c-window" role="dialog" aria-modal="true" aria-labelledby="c-modal-title">
            <div class="c-modal-header">
              <span class="c-modal-title" id="c-modal-title">${title}</span>
              <button class="c-modal-close" data-action="closeWindow" aria-label="Close">&times;</button>
            </div>
            <div class="c-modal-body">
              <p>${description}</p>
            </div>
            <div class="c-modal-footer">
              <button class="c-modal-delete" data-action="doAction">${actionBtnText}</button>
              <button class="c-modal-cancel" data-action="cancelAction">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    `
  },

  spinner: `
    <div class="spinner">
      <div class="spinner__dot"></div>
      <div class="spinner__dot"></div>
      <div class="spinner__dot"></div>
    </div>
    `,

  system_colors: {
    success: '#A8D8BA',
    failed: '#F5B0A0',
    muted: '#E6E6E6',
  },

  clear_icon: `
    <button class="dictionary-icon" aria-label="Clear chosen word list">
      <svg viewBox="0 0 24 24" class="icon-trash">
        <path d="M3 6h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2"/>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" stroke-width="2" fill="none"/>
        <path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
  `,

  add_icon: `
    <button class="dictionary-icon" data-action="addAllDeck" aria-label="Add all deck" data-tooltip="Add all words to study list">
      <svg viewBox="0 0 24 24" class="icon-plus">
        <path d="M12 5v14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
   </button>
  `,

  feedbackArea: `
    <div class="srs-panel">
      <button type="button" data-action="sendResolution" class="btn btn--srs-hard">HARD</button>
      <button type="button" data-action="sendResolution" class="btn btn--srs-good">GOOD</button>
      <button type="button" data-action="sendResolution" class="btn btn--srs-easy">EASY</button>
    </div>
  `,
}
