import { test, expect } from '@playwright/test'
import { VocabularySnippets } from '../snippets/vocabularySnippets'
import { MainPage } from '../pageObjects/pages/mainPage'
import { VocabularyOptionsPage } from '../pageObjects/pages/vocabularyOptionsPage'
import { DictionaryDecksPage } from '../pageObjects/pages/dictionaryDecksPage'
import { InitWordCardsPage } from '../pageObjects/pages/initWordCardsPage'
import { TrainingListPage} from '../pageObjects/pages/trainingListPage'
import { ChooseTrainingPage } from '../pageObjects/pages/chooseTrainingPage'
import { StudyDecksPage } from '../pageObjects/pages/studyDecksPage'
import { domain } from '../../utils/constants'
import { faker } from '@faker-js/faker'

let testWordList : any[] = []

// TODO: refactor hooks' logic as now I use fullfilling database only at the beginning of the spec. 
// But for more idependency I should fullfill db before every single AT.
test.beforeAll(async ({ request }) => {
    for (let index = 0; index < 4; index++) {
        const item = { word: faker.word.sample(), translate: faker.word.words(), wordType: 'nouns' }
        await request.post(`${domain}/words/init`, { data: item })
        testWordList.push(item)
    }

    testWordList = testWordList.sort((a, b) => a.word.localeCompare(b.word))
})

test.beforeEach(async ({ page }) => {
    await page.goto('/')

    const mainPage = new MainPage(page)
    const snippets = new VocabularySnippets()

    await snippets.checkMainPageStaticContent(page)

    await mainPage.clickVocabularySectionBtn()

    const vocabularyOptionsPage = new VocabularyOptionsPage(page)

    await expect(vocabularyOptionsPage.optionsList.first()).toBeInViewport()
    await expect(vocabularyOptionsPage.optionsList.first()).toBeEnabled()
})

test('Check positive way of "choose" training', async ({page, request}) => {
    const vocabularyOptionsPage = new VocabularyOptionsPage(page)
    const snippets = new VocabularySnippets()

    await vocabularyOptionsPage.clickAnySection(1)

    const decksPage = new DictionaryDecksPage(page)

    await expect(decksPage.deckList).toHaveCount(11)
    await expect(decksPage.deckList.nth(2)).toBeEnabled()

    await decksPage.chooseDeck(3)

    const initCardsPage = new InitWordCardsPage(page)

    // Add a few words for practicing:
    for (let i = 0; i < testWordList.length; i++) {
        await snippets.checkWordCardContent(page)
        await expect(initCardsPage.wordDiv).toHaveText(testWordList[i].word)
        await initCardsPage.addWordToStudyList()
    }

    await initCardsPage.addToListBtn.waitFor({ state: 'hidden'})
    await expect(initCardsPage.studyWordsBtn).toBeInViewport()

    await initCardsPage.clickStudyWordsBtn()

    const trainingListPage = new TrainingListPage(page)

    await expect(trainingListPage.trainingListRoot).toBeInViewport()
    await expect(trainingListPage.chooseTrainingIcon).toBeEnabled()

    await trainingListPage.clickChooseTraining()

    const chooseTrainingPage = new ChooseTrainingPage(page)

    await expect(chooseTrainingPage.trainArea).toBeInViewport()
    await expect(chooseTrainingPage.wordItem).toHaveText(testWordList[0].word)

    // Verify that initial studyLevel is 0:
    const initResponse = await request.get(`${domain}/words/study`, { params: { word: testWordList[0].word }})
    const initWord = await initResponse.json()

    expect(initWord[0].studyLevel).toEqual(0)

    // Go through each word by choosing only correct option:
    for (let i = 0; i < testWordList.length; i++) {
        for (const option of await chooseTrainingPage.translationList.all()) {
            if ((await option.textContent() === testWordList[i].translate) && (await chooseTrainingPage.wordItem.textContent() === testWordList[i].word)) {
                const currentWord = await chooseTrainingPage.wordItem.textContent()

                await option.click()

                await expect(chooseTrainingPage.wordItem).not.toHaveText(`${currentWord}`)

                if (await chooseTrainingPage.wordItem.textContent() === 'It was great!') break
            }
        }
    }

    await expect(chooseTrainingPage.newWordsBtn).toBeEnabled()
    await expect(chooseTrainingPage.repeatBtn).toBeEnabled()

    // Make sure that studyLevel is 1 after getting success:
    const finalResponse = await request.get(`${domain}/words/study`, { params: { word: testWordList[0].word }})
    const finalList = await finalResponse.json()

    expect(finalList[0].studyLevel).toEqual(1)
})

test('Check negative way of "choose" training', async ({page, request}) => {
    const vocabularyOptionsPage = new VocabularyOptionsPage(page)

    await vocabularyOptionsPage.clickAnySection(2)

    const studyDecksPage = new StudyDecksPage(page)

    await expect(studyDecksPage.allWordsBtn).toBeInViewport()
    await expect(studyDecksPage.allWordsBtn).toBeEnabled()

    await studyDecksPage.clickAllWordsBtn()

    const trainingListPage = new TrainingListPage(page)

    await expect(trainingListPage.trainingListRoot).toBeInViewport()
    await expect(trainingListPage.chooseTrainingIcon).toBeEnabled()

    await trainingListPage.clickChooseTraining()

    const chooseTrainingPage = new ChooseTrainingPage(page)

    await expect(chooseTrainingPage.trainArea).toBeInViewport()
    const neededWordText = await chooseTrainingPage.wordItem.textContent()

    const initResponse = await request.get(`${domain}/words/study`, {params: { word: `${neededWordText}` }})
    const neededWord = await initResponse.json()
    
    expect(neededWord[0].studyLevel).toEqual(1)

    for (const translationBtn of await chooseTrainingPage.translationList.all()) {
        if (await translationBtn.textContent() !== neededWord[0].translate) {
            await translationBtn.click()
            await expect(translationBtn).toHaveCSS('background-color', 'rgb(255, 140, 140)')
            await expect(translationBtn).toHaveCSS('background-color', 'rgb(242, 242, 253)')
            break
        }
    }

    const finalResponse = await request.get(`${domain}/words/study`, { params: { word: `${neededWordText}`} })

    const testWord = await finalResponse.json()

    expect(testWord[0].studyLevel).toEqual(0)
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