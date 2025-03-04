import { Locator, Page } from "@playwright/test";

export class ChooseTrainingPage {
    
    readonly page: Page
    readonly progressBar: Locator
    readonly trainArea: Locator
    readonly wordItem: Locator
    readonly translationList: Locator
    readonly newWordsBtn: Locator
    readonly repeatBtn: Locator

    constructor (page: Page) {
        this.page = page
        this.progressBar = page.locator('.myProgressBar')
        this.trainArea = page.locator('.trainArea')
        this.wordItem = page.locator('#wordItem')
        this.translationList = page.locator('#item')
        this.newWordsBtn = page.getByRole('button', { name: 'New words'})
        this.repeatBtn = page.getByRole('button', { name: 'Repeat'})
    }

    async chooseTranslationItem(index: number) {
        await this.translationList.nth(index - 1).click()
    }

    async clickNewWordsBtn() {
        await this.newWordsBtn.click()
    }

    async clickRepeatBtn() {
        await this.repeatBtn.click()
    }
}