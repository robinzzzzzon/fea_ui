module.exports = {
  domain: 'http://127.0.0.1:3001/api',

  alphabetList: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',

  speechList: [
    { dataName: 'verbs', color: '#DDA0DD' },
    { dataName: 'phrasal verbs', color: '#D1FFFF' },
    { dataName: 'nouns', color: '#6A90FF' },
    { dataName: 'adjectives', color: '#FFB6C1' },
    { dataName: 'adverbs', color: '#CE6A5C' },
    { dataName: 'pronouns', color: '#CDFF2F' },
    { dataName: 'numerals', color: '#FFA500' },
    { dataName: 'other parts', color: '#AFEEEE' },
    { dataName: 'idioms', color: '#FFDAB9' },
    { dataName: 'useful phrases', color: '#9ACD32' },
    { dataName: 'it phrases', color: '#FFFF4D' },
  ],

  getModalWindow({ title, description, actionBtnText }) {
    return `
    <div class="c-modal">
        <div class="c-overlay">
          <div class="c-window">
            <div class="c-modal-header">
              <span class="c-modal-title">${title}</span>
              <button class="c-modal-close" data-action="closeWindow">&times;</button>
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
    <div class="d-flex justify-content-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    `,

  system_colors: {
    success: '#94FF94',
    failed: '#FF8C8C',
  },

  clear_icon: `
    <button class="dictionary-clear" aria-label="Clear chosen word list">
      <svg viewBox="0 0 24 24" class="icon-trash">
        <path d="M3 6h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2"/>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" stroke-width="2" fill="none"/>
        <path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
  `
}
