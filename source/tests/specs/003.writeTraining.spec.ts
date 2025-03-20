import { test, expect } from '@playwright/test'
import { VocabularySnippets } from '../snippets/vocabularySnippets'
import { MainPage } from '../pageObjects/pages/mainPage'
import { VocabularyOptionsPage } from '../pageObjects/pages/vocabularyOptionsPage'
import { WriteTrainingPage } from '../pageObjects/pages/writeTrainingPage'
import { TrainingListPage} from '../pageObjects/pages/trainingListPage'
import { StudyDecksPage } from '../pageObjects/pages/studyDecksPage'
import { domain } from '../../utils/constants'
import { faker } from '@faker-js/faker'

let testWordsList : any[] = []

test.beforeEach(async ({ page, request }) => {
    // generate testing items:
    for (let index = 0; index < 3; index++) {
        const testWord: any = {
            word: faker.word.adverb(), 
            translate: faker.word.words(), 
            wordType: 'adverbs',
        }

        // prepare study items for our test:
        await request.post(`${domain}/words/init`, { data: testWord })

        testWord.studyLevel = 0;

        await request.post(`${domain}/words/study`, { data: testWord })

        testWordsList.push(testWord)
    }

    await page.goto('/')

    const snippets = new VocabularySnippets()
    
    await snippets.checkMainPageStaticContent(page)
})

test('Check full positive way of "write" training', async ({ page }) => {
    const mainPage = new MainPage(page)

    await mainPage.clickVocabularySectionBtn()

    const vocabularyOptionsPage = new VocabularyOptionsPage(page)

    await expect(vocabularyOptionsPage.optionsList.nth(2)).toBeInViewport()
    await expect(vocabularyOptionsPage.optionsList.nth(2)).toBeEnabled()

    // go to study words section:
    await vocabularyOptionsPage.clickAnySection(2)

    const studyDecksPage = new StudyDecksPage(page)

    // choose deck in terms of words' type:
    await expect(studyDecksPage.deckList.filter({ hasText: 'ADVERBS' })).toBeEnabled()

    await studyDecksPage.chooseStudyDeck(2)

    const trainingListPage = new TrainingListPage(page)

    await expect(trainingListPage.trainingListRoot).toBeInViewport()
    await expect(trainingListPage.writeTrainingIcon).toBeEnabled()

    // navigate to needed training by clicking appropriate button:
    await trainingListPage.clickWriteTraining()

    const writeTrainingPage = new WriteTrainingPage(page)

    // make sure that we are at the starting position of our training:
    await expect(writeTrainingPage.btnList.filter({hasText: 'Get a cue'})).toBeInViewport()

    // try to go through all test items by setting only correct options into word's input:
    for (let i = 0; i < testWordsList.length; i++) {
        await expect(writeTrainingPage.btnList.filter({hasText: 'Get a cue'})).toBeEnabled()
        await expect(writeTrainingPage.btnList.filter({hasText: 'Check'})).toBeDisabled()
        await expect(writeTrainingPage.translateSection).toHaveText(testWordsList[i].translate)

        await writeTrainingPage.setWord(testWordsList[i].word)

        await expect(writeTrainingPage.btnList.last()).toBeEnabled()

        await writeTrainingPage.clickAnyBtn('Check')

        if (testWordsList[i].word === testWordsList[testWordsList.length - 1].word) {
            // verify that after getting success we see the final banner:
            await expect(writeTrainingPage.translateSection).toHaveText('Great job! Try again?')
            await expect(writeTrainingPage.btnList.first()).toHaveText('New words')
            await expect(writeTrainingPage.btnList.last()).toHaveText('Repeat')
        } else {
            await expect(writeTrainingPage.writingInput).toHaveCSS('background-color', 'rgb(240, 255, 255)')
            await expect(writeTrainingPage.translateSection).not.toHaveText(testWordsList[i].translate)
        }
    }
})

test.afterEach('Delete generated words after running', async ({ request }) => {

    for (let i = 0; i < testWordsList.length; i++) {
        const initResponse = await request.get(`${domain}/words/init`, { params: { word: testWordsList[i].word }})
        const studyResponse = await request.get(`${domain}/words/study`, { params: { word: testWordsList[i].word }})

        const initList = await initResponse.json()
        const studyList = await studyResponse.json()

        if (initList.length) {
            await request.delete(`${domain}/words/init/${initList[0]._id}`)
        }

        if (studyList.length) {
            await request.delete(`${domain}/words/study/${studyList[0]._id}`)
        }
    }

    testWordsList = []
})