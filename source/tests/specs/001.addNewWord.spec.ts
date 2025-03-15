import { test, expect } from '@playwright/test'
import { VocabularySnippets } from '../snippets/vocabularySnippets'
import { MainPage } from '../pageObjects/pages/mainPage'
import { VocabularyOptionsPage } from '../pageObjects/pages/vocabularyOptionsPage'
import { AddNewWordPage } from '../pageObjects/pages/addNewWordPage'
import { StudyWordsPage } from '../pageObjects/pages/studyWordsPage'
import { DictionaryDecksPage } from '../pageObjects/pages/dictionaryDecksPage'
import { InitWordCardsPage } from '../pageObjects/pages/initWordCardsPage'
import { CardWordModalWindow } from '../pageObjects/widgets/cardWordModalWindow'
import { Header } from '../pageObjects/widgets/Header'
import { domain } from '../../utils/constants'
import { faker } from '@faker-js/faker'

let testWordsList : any[] = []

test.beforeEach(async ({ page }) => {
    await page.goto('/')

    const snippets = new VocabularySnippets()
    const mainPage = new MainPage(page)

    await snippets.checkMainPageStaticContent(page)

    // navigate to vocabularyOptionsPage:
    await mainPage.clickVocabularySectionBtn()

    // check vocabulary option list:
    await snippets.checkVocabularyPageStaticContent(page)

    const vocabularyOptionsPage = new VocabularyOptionsPage(page)

    // navigate to addNewWordPage:
    await vocabularyOptionsPage.clickAnySection(4);
})

test.describe('Working with init dictionary', () => {
    
    test('Check adding a new word to both dictionaries', async ({page, request}) => {
    
        // check form of adding words:
        const addNewWordPage = new AddNewWordPage(page)
    
        await expect(addNewWordPage.alertMsg).toHaveText('Here you can add a new word to initial dictionary!')
    
        const addedWord = {
            word: faker.word.noun(), 
            translation: faker.word.words(), 
            wordType: 'nouns' ,
            needToStudyList: true,
        }

        testWordsList.push(addedWord)
    
        // try to fill word form and add a new word to study list:
        await addNewWordPage.fillNewWordForm(addedWord);
        
        // check whether form's inputs become clear:
        await expect(addNewWordPage.wordInput).toHaveValue('')
        await expect(addNewWordPage.translationInput).toHaveValue('')

        const header = new Header(page)
        
        await header.backToMainPage()

        const mainPage = new MainPage(page)
    
        await expect(mainPage.vocabularySectionBtn).toBeEnabled()
        await mainPage.clickVocabularySectionBtn()

        const vocabularyOptionsPage = new VocabularyOptionsPage(page)
    
        const optionsList = vocabularyOptionsPage.optionsList
    
        await expect(optionsList.nth(2)).toBeEnabled()
        await optionsList.nth(2).click()
    
        // go to study list page and verify that our word has beed added to active study list:
        const studyWordsPage = new StudyWordsPage(page)
        
        await expect(studyWordsPage.wordsList).not.toHaveCount(0)

        const currentStudyWordsList = await studyWordsPage.wordsList.all()

        for (let i = 0; i < currentStudyWordsList.length; i++) {
            if (await currentStudyWordsList[i].textContent() === addedWord.word) {
                await studyWordsPage.resetProgressForWord(i)
                await studyWordsPage.deleteWordFromStudyList(i)
            }
        }
    
        // verify whether addedWord has been deleted successfully from studyList
        await expect(studyWordsPage.wordsList).toHaveCount(currentStudyWordsList.length - 1)

        const initListResponse = await request.get(`${domain}/words/init`, { params: { word: addedWord.word }})
        const studyListResponse = await request.get(`${domain}/words/study`, { params: { word: addedWord.word }})

        expect((await initListResponse.json()).length).toEqual(1)
        expect((await studyListResponse.json()).length).toEqual(0)
    })
    
    test('Check removing a new word from init dictionary', async ({page, request}) => {

        // check form of adding words:
        const addNewWordPage = new AddNewWordPage(page)
    
        await expect(addNewWordPage.alertMsg).toHaveText('Here you can add a new word to initial dictionary!')

        testWordsList.push({
            word: faker.word.words(), 
            translation: faker.word.words(), 
            wordType: 'idioms' ,
            needToStudyList: false,
        })

        testWordsList.push({
            word: faker.word.words(), 
            translation: faker.word.words(), 
            wordType: 'idioms' ,
            needToStudyList: false,
        })

        testWordsList = testWordsList.sort((a, b) => a.word.localeCompare(b.word))
    
        for (let i = 0; i < testWordsList.length; i++) {
            // try to fill word form and add a new word to study list:
            await addNewWordPage.fillNewWordForm(testWordsList[i]);
            
            // check whether form's inputs become clear:
            await expect(addNewWordPage.wordInput).toHaveValue('')
            await expect(addNewWordPage.translationInput).toHaveValue('')
        }

        const header = new Header(page)

        await header.backToMainPage()

        const mainPage = new MainPage(page)
    
        await expect(mainPage.vocabularySectionBtn).toBeEnabled()
        await mainPage.clickVocabularySectionBtn()
    
        const vocabularyOptionsPage = new VocabularyOptionsPage(page)

        // navigate to addNewWordPage:
        await vocabularyOptionsPage.clickAnySection(1);
    
        const decksPage = new DictionaryDecksPage(page)
    
        await expect(decksPage.deckList).toHaveCount(11)
    
        // go to needed deck to ensure that word has been added:
        await decksPage.deckList.nth(8).click()
    
        const initCardsPage = new InitWordCardsPage(page)
    
        await expect(initCardsPage.cardRoot).toBeInViewport()
        expect(await initCardsPage.wordDiv.textContent()).toContain(testWordsList[0].word)
        expect(await initCardsPage.translationDiv.textContent()).toContain(testWordsList[0].translation)
    
        // then delete the word from initial dictionary:
        await initCardsPage.clickCrossBtn()
    
        const modalWindow = new CardWordModalWindow(page)
    
        await expect(modalWindow.title).toHaveText('Do you really want to delete this word?')
        await expect(modalWindow.deleteBtn).toBeEnabled()
        await modalWindow.clickDeleteBtn()
    
        // check that current word card doesn't contain word or translation our test item:
        await modalWindow.deleteBtn.waitFor({state: 'hidden'})
        await expect(initCardsPage.wordArea).toBeEnabled()
        await expect(initCardsPage.wordDiv).toContainText(testWordsList[1].word)

        // verify whether first added word has been deleted successfully from initList:
        const initListResponse = await request.get(`${domain}/words/init`, { params: { word: testWordsList[0].word }})

        expect((await initListResponse.json()).length).toEqual(0)
    })
})

test.describe('Verifying duplicate\'s flow and separeting addition', () => {

    test(`Check that new word has been added only to initDictionary`, async ({page, request}) => {

        const newWordPage = new AddNewWordPage(page)
    
        const addedItem = { 
            word: faker.word.noun(),
            translation: faker.word.words(), 
            wordType: 'nouns' ,
            needToStudyList: false,
        }

        testWordsList.push(addedItem)
    
        // fill the form and add a new word into initial dictionary:
        await newWordPage.fillNewWordForm(addedItem);
    
        // check whether form's inputs became clear:
        await expect(newWordPage.wordInput).toHaveValue('')
        await expect(newWordPage.translationInput).toHaveValue('')
    
        // verify that init dictionary has added test word:
        const initResponse = await request.get(`${domain}/words/init`, { params: { word: addedItem.word }})
        let initList = await initResponse.json()
    
        expect(initList.length).toEqual(1)
    
        // verify that study dictionary doesn't have added test word:
        const studyResponse = await request.get(`${domain}/words/study`, { params: { word: addedItem.word }})
        let studyList = await studyResponse.json()
    
        expect(studyList.length).toEqual(0)
    })
    
    test(`Check that new word hasn't been added to DB if it's a duplicate`, async ({page, request}) => {

        const addedWord = { 
            word: faker.word.noun(),
            translation: faker.word.words(), 
            wordType: 'nouns' ,
            needToStudyList: false,
        }
    
        const newWordPage = new AddNewWordPage(page)
    
        for (let i = 0; i < 2; i++) {
            // fill form with the same data:
            testWordsList.push(addedWord)

            await newWordPage.fillNewWordForm(addedWord)
        
            // check whether form's inputs become clear:
            await expect(newWordPage.wordInput).toHaveValue('')
            await expect(newWordPage.translationInput).toHaveValue('')
        }
    
        // verify that init dictionary doesn't have that test word:
        const finalInitResponse = await request.get(`${domain}/words/init`, { params: { word: addedWord.word }})
        let finalInitList = await finalInitResponse.json()
    
        expect(finalInitList.length).toEqual(1)
    
        // verify that study dictionary doesn't have that test word:
        const finalStudyResponse = await request.get(`${domain}/words/study`, { params: { word: addedWord.word }})
        let finalStudyList = await finalStudyResponse.json()
    
        expect(finalStudyList.length).toEqual(0)
    })
})

test.afterEach('Delete generated words after run', async ({ request }) => {

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