import { Locator, Page } from '@playwright/test'

export class StudyWordsPage {

    readonly page: Page
    readonly wordsList: Locator
    readonly resetBtnList: Locator
    readonly deleteBtnList: Locator
    readonly gotItBtn: Locator

    constructor (page: Page) {
        this.page = page
        this.wordsList = page.locator('.actualDictionaryRoot .actualItem')
        this.resetBtnList = page.getByRole('button', {name: 'Reset'})
        this.deleteBtnList = page.getByRole('button', {name: 'Delete'})
        this.gotItBtn = page.getByRole('button', { name: 'Got it'})
    }

    async resetProgressForWord(index: number) {
        await this.resetBtnList.nth(index - 1).click()
    }

    async deleteWordFromStudyList(index: number) {
        await this.deleteBtnList.nth(index - 1).click()
    }

    async clickGotItBtn() {
        await this.gotItBtn.click()
    }
}