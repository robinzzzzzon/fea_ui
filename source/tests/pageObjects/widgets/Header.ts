import { Locator, Page } from "@playwright/test";

export class Header {
    
    readonly page: Page
    readonly homeLink: Locator

    constructor (page: Page) {
        this.page = page
        this.homeLink = page.getByRole('link', { name: 'Home'})
    }

    async backToMainPage() {
        await this.homeLink.click()
    }
}