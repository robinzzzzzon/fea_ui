import { Locator, Page } from "@playwright/test";

export class InitWordCardsPage {
    
    readonly page: Page
    readonly cardRoot: Locator
    readonly wordArea: Locator
    readonly wordDiv: Locator
    readonly translationDiv: Locator
    readonly deleteBtn: Locator
    readonly alreadyKnowBtn: Locator
    readonly addToListBtn: Locator
    readonly changeBtn: Locator
    readonly cancelBtn: Locator
    readonly newWordsBtn: Locator
    readonly studyWordsBtn: Locator

    constructor (page: Page) {
        this.page = page
        this.cardRoot = page.locator('.cardRoot')
        this.wordArea = page.locator('#wordArea')
        this.wordDiv = page.locator('#wordArea > div:first-child')
        this.translationDiv = page.locator('#wordArea > div:last-child')
        this.deleteBtn = page.locator('#deleteBtn')
        this.alreadyKnowBtn = page.getByRole('button', { name: 'Already know'})
        this.addToListBtn = page.getByRole('button', { name: 'Add to list'})
        this.changeBtn = page.getByRole('button', { name: 'Change'})
        this.cancelBtn = page.getByRole('button', { name: 'Cancel'})
        this.newWordsBtn = page.getByRole('button', { name: 'New words'})
        this.studyWordsBtn = page.getByRole('button', { name: 'Study words'})
    }

    async goToTheNextWord() {
        await this.alreadyKnowBtn.click()
    }

    async addWordToStudyList() {
        await this.addToListBtn.click()
    }

    async clickChangeBtn() {
        await this.changeBtn.click()
    }

    async clickCancelBtn() {
        await this.cancelBtn.click()
    }

    async clickNewWordsBtn() {
        await this.newWordsBtn.click()
    }

    async clickStudyWordsBtn() {
        await this.studyWordsBtn.click()
    }

    async clickCrossBtn() {
        await this.deleteBtn.click()
    }
}