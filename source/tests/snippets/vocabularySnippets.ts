import { Page, expect } from '@playwright/test'
import { MainPage } from "../pageObjects/pages/mainPage";
import { InitWordCardsPage } from "../pageObjects/pages/initWordCardsPage";
import { VocabularyOptionsPage } from "../pageObjects/pages/vocabularyOptionsPage";

export class VocabularySnippets {

    // TODO: add a constructor here.

    async checkMainPageStaticContent(page: Page) {
        const mainPage = new MainPage(page)
        const vocabularyBtn = mainPage.vocabularySectionBtn
        const speakingBtn = mainPage.speakingSectionBtn

        expect(await vocabularyBtn.textContent()).toEqual('VOCABULARY')
        expect(vocabularyBtn).toHaveClass(/(^|\s)dictionary(\s|$)/)
        expect(vocabularyBtn).toHaveAttribute('data-name', 'vocabulary')
        expect(vocabularyBtn).toBeEnabled()
        expect(await speakingBtn.textContent()).toEqual('SPEAKING')
        expect(speakingBtn).toHaveClass(/(^|\s)initItem(\s|$)/)
        expect(speakingBtn).toHaveAttribute('data-name', 'speaking')
        expect(speakingBtn).toBeEnabled()
    }

    async checkVocabularyPageStaticContent(page: Page) {
        const vocabularyOptionsPage = new VocabularyOptionsPage(page)
        const optionsList = vocabularyOptionsPage.optionsList

        expect(optionsList.first()).toBeEnabled()
        expect(optionsList.nth(1)).toBeDisabled()
        expect(optionsList.nth(2)).toBeDisabled()
        expect(optionsList.last()).toBeEnabled()

        const referenceValueList = [
            { text: 'CHOOSE WORDS', dataName: 'seekNew'}, 
            { text: 'STUDY WORDS', dataName: 'getTraining'}, 
            { text: 'ACTUAL DICTIONARY', dataName: 'seeActual'}, 
            { text: 'ADD NEW WORD', dataName: 'addNew'}, 
        ]

        for (let i = 0; i < referenceValueList.length; i++) {
            expect(optionsList.nth(i)).toBeInViewport()
            expect(optionsList.nth(i)).toHaveClass('dictionary initItem shadow-lg')
            expect(optionsList.nth(i)).toHaveText(referenceValueList[i].text)
            expect(optionsList.nth(i)).toHaveAttribute('data-name', referenceValueList[i].dataName)
        }
    }

    async checkWordCardContent(page: Page) {
        const initCardsPage = new InitWordCardsPage(page)

        await expect(initCardsPage.cardRoot).toBeInViewport()
        await expect(initCardsPage.alreadyKnowBtn).toBeAttached()
        await expect(initCardsPage.alreadyKnowBtn).toBeEnabled()
        await expect(initCardsPage.addToListBtn).toBeEnabled()
    }
}