import { Locator, Page } from '@playwright/test'

export class StudyDecksPage {

    readonly page: Page
    readonly deckList: Locator
    readonly allWordsBtn: Locator

    constructor (page: Page) {
        this.page = page
        this.deckList = page.locator('.dictionaryRoot > button.dictionary')
        this.allWordsBtn = page.getByRole('button', {name: 'ALL WORDS'})
    }

    async chooseStudyDeck(index: number) {
        await this.deckList.nth(index - 1).click()
    }

    async clickAllWordsBtn() {
        await this.allWordsBtn.click()
    }
}