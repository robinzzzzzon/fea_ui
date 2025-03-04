import { Locator, Page } from "@playwright/test";

export class TrainingListPage {
    
    readonly page: Page
    readonly trainingListRoot: Locator
    readonly writeTrainingIcon: Locator
    readonly puzzleTrainingIcon: Locator
    readonly chooseTrainingIcon: Locator

    constructor (page: Page) {
        this.page = page
        this.trainingListRoot = page.locator('.trainList')
        this.writeTrainingIcon = page.locator('#writeTraining')
        this.puzzleTrainingIcon = page.locator('#puzzleTraining')
        this.chooseTrainingIcon = page.locator('#chooseTraining')
    }

    async clickWriteTraining() {
        await this.writeTrainingIcon.click()
    }

    async clickPuzzleTraining() {
        await this.puzzleTrainingIcon.click()
    }

    async clickChooseTraining() {
        await this.chooseTrainingIcon.click()
    }
}