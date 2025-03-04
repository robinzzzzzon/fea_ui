import { test, expect } from '@playwright/test'
import { VocabularySnippets } from '../snippets/vocabularySnippets'
import { MainPage } from '../pageObjects/pages/mainPage'
import { VocabularyOptionsPage } from '../pageObjects/pages/vocabularyOptionsPage'
import { DictionaryDecksPage } from '../pageObjects/pages/dictionaryDecksPage'
import { InitWordCardsPage } from '../pageObjects/pages/initWordCardsPage'
import { TrainingListPage} from '../pageObjects/pages/trainingListPage'
import { ChooseTrainingPage } from '../pageObjects/pages/chooseTrainingPage'
import { domain } from '../../utils/constants'

let testWordList = [
    // TODO: change implementation by using faker:
    { word: 'definition', translate: 'определение', wordType: 'nouns' },
    { word: 'climate', translate: 'климат', wordType: 'nouns' },
    { word: 'agency', translate: 'агенство', wordType: 'nouns' },
    { word: 'choice', translate: 'выбор', wordType: 'nouns' },
]

test.beforeAll(async ({ request }) => {
    testWordList = testWordList.sort((a, b) => a.word.localeCompare(b.word))

    for (let index = 0; index < testWordList.length; index++) {
        await request.post(`${domain}/words/init`, { data: testWordList[index]})
    }
})

test.beforeEach(async ({ page }) => {
    await page.goto('/')
})

test('Check positive way of "choose" training', async ({page}) => {
    const mainPage = new MainPage(page)
    const snippets = new VocabularySnippets()

    await snippets.checkMainPageStaticContent(page)

    await mainPage.clickVocabularySectionBtn()

    await snippets.checkVocabularyPageStaticContent(page)

    const vocabularyOptionsPage = new VocabularyOptionsPage(page)

    await expect(vocabularyOptionsPage.optionsList.first()).toBeInViewport()
    await expect(vocabularyOptionsPage.optionsList.first()).toBeEnabled()

    await vocabularyOptionsPage.clickAnySection(1)

    const decksPage = new DictionaryDecksPage(page)

    await expect(decksPage.deckList).toHaveCount(11)
    await expect(decksPage.deckList.nth(2)).toBeEnabled()

    await decksPage.chooseDeck(3)

    const initCardsPage = new InitWordCardsPage(page)

    await expect(initCardsPage.cardRoot).toBeInViewport()
    await expect(initCardsPage.wordDiv).toHaveText('agency')
    await expect(initCardsPage.alreadyKnowBtn).toBeAttached()
    await expect(initCardsPage.alreadyKnowBtn).toBeEnabled()
    await expect(initCardsPage.addToListBtn).toBeAttached()
    await expect(initCardsPage.addToListBtn).toBeEnabled()

    // Add 1st word for practicing:
    await initCardsPage.addWordToStudyList()

    await expect(initCardsPage.wordDiv).toHaveText('choice')

    // Add 2nd word:
    await initCardsPage.addWordToStudyList()

    await expect(initCardsPage.wordDiv).toHaveText('climate')

    // Add 3rd word:
    await initCardsPage.addWordToStudyList()

    await expect(initCardsPage.wordDiv).toHaveText('definition')

    // Add the last word:
    await initCardsPage.addWordToStudyList()

    await initCardsPage.addToListBtn.waitFor({ state: 'hidden'})
    await expect(initCardsPage.studyWordsBtn).toBeInViewport()

    await initCardsPage.clickStudyWordsBtn()

    const trainingListPage = new TrainingListPage(page)

    await expect(trainingListPage.trainingListRoot).toBeInViewport()
    await expect(trainingListPage.chooseTrainingIcon).toBeEnabled()

    await trainingListPage.clickChooseTraining()

    const chooseTrainingPage = new ChooseTrainingPage(page)

    await expect(chooseTrainingPage.trainArea).toBeInViewport()
    await expect(chooseTrainingPage.wordItem).toHaveText('agency')

    for (let i = 0; i < testWordList.length; i++) {
        for (const option of await chooseTrainingPage.translationList.all()) {
            if ((await option.textContent() === testWordList[i].translate) && (await chooseTrainingPage.wordItem.textContent() === testWordList[i].word)) {
                const currentWord = await chooseTrainingPage.wordItem.textContent()

                await option.click()

                await expect(chooseTrainingPage.wordItem).not.toHaveText(`${currentWord}`)

                if (await chooseTrainingPage.wordItem.textContent() === 'It was great!') return;
            }
        }
    }

    await expect(chooseTrainingPage.newWordsBtn).toBeEnabled()
    await expect(chooseTrainingPage.repeatBtn).toBeEnabled()
})

test.afterAll('Delete generated words after run', async ({ request }) => {
    const initResponse = await request.get(`${domain}/words/init`)
    const studyResponse = await request.get(`${domain}/words/study`)

    const initList = await initResponse.json()
    const studyList = await studyResponse.json()

    for (let index = 0; index < initList.length; index++) {
        await request.delete(`${domain}/words/init/${initList[index]._id}`)
    }

    for (let index = 0; index < studyList.length; index++) {
        await request.delete(`${domain}/words/study/${studyList[index]._id}`)
    }
})