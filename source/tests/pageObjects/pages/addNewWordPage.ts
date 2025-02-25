import { Locator, Page } from '@playwright/test'

export class AddNewWordPage {

    readonly page: Page
    readonly formRoot: Locator
    readonly alertMsg: Locator
    readonly wordInput: Locator
    readonly translationInput: Locator
    readonly wordTypeSelect: Locator
    readonly studyListCb: Locator
    readonly confirmBtn: Locator

    constructor (page: Page) {
        this.page = page
        this.formRoot = page.locator('.wordFormRoot')
        this.alertMsg = this.formRoot.getByRole('alert')
        this.wordInput = page.locator('#word')
        this.translationInput = page.locator('#translation')
        this.wordTypeSelect = page.locator('#type')
        this.studyListCb = page.locator('#studyCb input')
        this.confirmBtn = page.getByRole('button', { name: 'Confirm'})
    }

    async setWord(word: string) {
        await this.wordInput.fill(word)
    }

    async setTranslation(translation: string) {
        await this.translationInput.fill(translation)
    }
    
    async setWordType(wordType: string) {
        await this.wordTypeSelect.click()
        await this.wordTypeSelect.selectOption({value: wordType})
    }

    async checkStudyListCb() {
        await this.studyListCb.check()
    }

    async clickConfirmBtn() {
        await this.confirmBtn.click()
    }

    async fillNewWordForm({ word, translation, wordType, needToStudyList }) {
        await this.setWord(word)
        await this.setTranslation(translation)
        await this.setWordType(wordType)

        if (needToStudyList) {
            await this.checkStudyListCb()
        }
        
        await this.clickConfirmBtn()
    }
}