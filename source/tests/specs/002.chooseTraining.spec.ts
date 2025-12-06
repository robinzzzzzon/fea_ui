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

let testWordsList : any[] = []

test.beforeEach(async ({ page, request }) => {
    // generate testing items:
    for (let index = 0; index < 4; index++) {
        const item = await request.post(`${domain}/words/init`, { data: { 
            word: faker.word.sample(), 
            translate: faker.word.words(), 
            wordType: 'nouns',
        }})

        testWordsList.push(await item.json())
    }

    testWordsList = testWordsList.sort((a, b) => a.word.localeCompare(b.word))

    await page.goto('/')

    const snippets = new VocabularySnippets()
    
    await snippets.checkMainPageStaticContent(page)
})

test.skip('Check full positive way of "choose" training', async ({page, request}) => {
    const mainPage = new MainPage(page)

    await mainPage.clickVocabularySectionBtn()

    const vocabularyOptionsPage = new VocabularyOptionsPage(page)

    await expect(vocabularyOptionsPage.optionsList.first()).toBeInViewport()
    await expect(vocabularyOptionsPage.optionsList.first()).toBeEnabled()

    await vocabularyOptionsPage.clickAnySection(1)
    
    const decksPage = new DictionaryDecksPage(page)
    
    await expect(decksPage.deckList).toHaveCount(11)
    await expect(decksPage.deckList.nth(2)).toBeEnabled()
    
    await decksPage.chooseDeck(3)
    
    const snippets = new VocabularySnippets()
    const initCardsPage = new InitWordCardsPage(page)

    // Add a few words for practicing:
    for (let i = 0; i < testWordsList.length; i++) {
        await snippets.checkWordCardContent(page)
        await expect(initCardsPage.wordDiv).toHaveText(testWordsList[i].word)
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
    await expect(chooseTrainingPage.wordItem).toHaveText(testWordsList[0].word)

    // Verify that initial studyLevel of word is 0:
    const initialStudyWord = await request.get(`${domain}/words/study`, { params: { word: testWordsList[0].word }})
    const studyWord = await initialStudyWord.json()
        
    expect(studyWord[0].studyLevel).toEqual(0)

    // Go through each word by choosing only correct option:
    for (let i = 0; i < testWordsList.length; i++) {
        for (const option of await chooseTrainingPage.translationList.all()) {
            if ((await option.textContent() === testWordsList[i].translate) && (await chooseTrainingPage.wordItem.textContent() === testWordsList[i].word)) {
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
    const finalStudyWord = await request.get(`${domain}/words/study`, { params: { word: testWordsList[0].word }})
    const finalWord = await finalStudyWord.json()

    expect(finalWord[0].studyLevel).toEqual(1)
})

test.skip('Check negative way of "choose" training', async ({page, request}) => {
    // setup study words list with needed condition of studyLevel:
    for (let i = 0; i < testWordsList.length; i++) {
        await request.post(`${domain}/words/study`, { data: { 
            word: testWordsList[i].word, 
            translate: testWordsList[i].translate, 
            wordType: testWordsList[i].wordType,
            studyLevel: 1,
        }})
    }

    const mainPage = new MainPage(page)

    await mainPage.clickVocabularySectionBtn()

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

test.afterEach('Delete generated words after running', async ({ request }) => {

    let studyIdList : any[] = []

    for (let i = 0; i < testWordsList.length; i++) {
        const studyWord = await request.get(`${domain}/words/study`, { params: { word: testWordsList[i].word }})

        studyIdList.push((await studyWord.json())[0])
    }

    for (let i = 0; i < testWordsList.length; i++) {
        await request.delete(`${domain}/words/init/${testWordsList[i]._id}`)
        await request.delete(`${domain}/words/study/${studyIdList[i]._id}`)
    }
})