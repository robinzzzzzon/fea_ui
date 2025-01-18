module.exports = {
  domain: 'http://127.0.0.1:3001/api',

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

  modalHtml: `
  <div class="c-modal">
      <div class="c-overlay">
        <div class="c-window">
          <div class="c-modal-header">
            <span class="c-modal-title">Do you really want to delete this word?</span>
            <span class="c-modal-close" id="modalBtn">&times;</span>
          </div>
          <div class="c-modal-body">
            <p>After confirmation this word will be permanently deleted from this dictionary!</p>
          </div>
          <div class="c-modal-footer">
            <button class="c-modal-delete" id="modalBtn">Delete</button>
            <button class="c-modal-cancel" id="modalBtn">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `,

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
}
