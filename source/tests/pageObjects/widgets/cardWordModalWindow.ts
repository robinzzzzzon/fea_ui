import { Locator, Page } from "@playwright/test";

export class CardWordModalWindow {
    
    readonly page: Page
    readonly title: Locator
    readonly closeBtn: Locator
    readonly body: Locator
    readonly deleteBtn: Locator
    readonly cancelBtn: Locator

    constructor (page: Page) {
        this.page = page
        this.title = page.locator('.c-modal-header span:first-child')
        this.closeBtn = page.locator('.c-modal-header span:last-child')
        this.body = page.locator('.c-modal-body > p')
        this.deleteBtn = page.getByRole('button', { name: 'Delete'})
        this.cancelBtn = page.getByRole('button', { name: 'Cancel'})
    }

    async closeModalWindow() {
        await this.closeBtn.click()
    }

    async clickDeleteBtn() {
        await this.deleteBtn.click()
    }

    async clickCancelBtn() {
        await this.cancelBtn.click()
    }
}