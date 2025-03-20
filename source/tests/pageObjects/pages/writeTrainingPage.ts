import { Locator, Page } from "@playwright/test";

export class WriteTrainingPage {
    
    readonly page: Page
    readonly progressBar: Locator
    readonly translateSection: Locator
    readonly writingInput: Locator
    readonly btnList: Locator

    constructor (page: Page) {
        this.page = page
        this.progressBar = page.locator('.myProgressBar')
        this.translateSection = page.locator('.translateDiv')
        this.writingInput = page.locator('.writeInput')
        this.btnList = page.locator('.btnDiv button')
    }

    async clickAnyBtn(innerText: string) {
        await this.btnList.filter({hasText: `${innerText}`}).click()
    }

    async setWord(word: string) {
        await this.writingInput.fill(word)
    }
}