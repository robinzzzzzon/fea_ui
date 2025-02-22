import { Locator, Page } from "@playwright/test";

export class VocabularyOptionsPage {

    readonly page: Page
    readonly optionsList: Locator

    constructor (page: Page) {
        this.page = page
        this.optionsList = page.locator('.initItem')
    }

    async clickAnySection(index: number) {
        await this.optionsList.nth(index - 1).click()
    }
}