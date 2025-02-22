import { Locator, Page } from '@playwright/test'

export class DictionaryDecksPage {

    readonly page: Page
    readonly deckList: Locator

    constructor (page: Page) {
        this.page = page
        this.deckList = page.locator('.dictionaryRoot > button.dictionary')
    }

    async chooseDeck(index: number) {
        await this.deckList.nth(index - 1).click()
    }
}