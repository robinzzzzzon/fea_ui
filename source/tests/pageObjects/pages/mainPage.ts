import { Locator, Page } from '@playwright/test'

export class MainPage {

    readonly page: Page
    readonly vocabularySectionBtn: Locator
    readonly speakingSectionBtn: Locator
    readonly homeLink: Locator

    constructor (page: Page) {
        this.page = page
        this.vocabularySectionBtn = page.getByRole('button', {name: 'VOCABULARY'})
        this.speakingSectionBtn = page.getByRole('button', {name: 'SPEAKING'})
        this.homeLink = page.getByRole('link', { name: 'Home'})
    }

    async clickVocabularySectionBtn() {
        await this.vocabularySectionBtn.click()
    }

    async clickSpeakingSectionBtn() {
        await this.speakingSectionBtn.click()
    }

    async backToMainPage() {
        await this.homeLink.click()
    }
}