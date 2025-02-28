import { test, expect } from '@playwright/test'
import { VocabularySnippets } from '../snippets/vocabularySnippets'
import { MainPage } from '../pageObjects/pages/mainPage'
import { VocabularyOptionsPage } from '../pageObjects/pages/vocabularyOptionsPage'
import { AddNewWordPage } from '../pageObjects/pages/addNewWordPage'
import { StudyWordsPage } from '../pageObjects/pages/studyWordsPage'
import { DictionaryDecksPage } from '../pageObjects/pages/dictionaryDecksPage'
import { InitWordCardsPage } from '../pageObjects/pages/initWordCardsPage'
import { CardWordModalWindow} from '../pageObjects/widgets/cardWordModalWindow' 
import { domain } from '../../utils/constants'

test.describe('Working with init dictionary', () => {

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
    
    test('Check adding a new word to both dictionaries', async ({page}) => {
    
        // check form of adding words:
        const addNewWordPage = new AddNewWordPage(page)
    
        await expect(addNewWordPage.alertMsg).toHaveText('Here you can add a new word to initial dictionary!')
    
        const addedWord = {
            word: `a test-word${new Date().getTime()}`, 
            translation: 'test translation', 
            wordType: 'nouns' ,
            needToStudyList: true,
        }
    
        // try to fill word form and add a new word to study list:
        await addNewWordPage.fillNewWordForm(addedWord);
        
        // check whether form's inputs become clear:
        await expect(addNewWordPage.wordInput).toHaveValue('')
        await expect(addNewWordPage.translationInput).toHaveValue('')

        const mainPage = new MainPage(page)
    
        await mainPage.backToMainPage()
    
        await expect(mainPage.vocabularySectionBtn).toBeEnabled()
        await mainPage.clickVocabularySectionBtn()

        const vocabularyOptionsPage = new VocabularyOptionsPage(page)
    
        const optionsList = vocabularyOptionsPage.optionsList
    
        await expect(optionsList.nth(2)).toBeEnabled()
        await optionsList.nth(2).click()
    
        // go to study list page and verify that our word has beed added to active study list:
        const studyWordsPage = new StudyWordsPage(page)
    
        await expect(studyWordsPage.wordsList).toHaveCount(1)
    
        // remove that word from list and ensure that this list is clear now:
        await studyWordsPage.resetProgressForWord(1)
        await studyWordsPage.deleteWordFromStudyList(1)
    
        await expect(studyWordsPage.wordsList).toHaveCount(0)
    
        // go to the new dictionary page and check that routing has been done successfully:
        await studyWordsPage.clickGotItBtn()
    
        const decksPage = new DictionaryDecksPage(page)
    
        await expect(decksPage.deckList).toHaveCount(11)
    
        // go to needed deck to ensure that word has been added:
        await decksPage.deckList.nth(2).click()
    
        const initCardsPage = new InitWordCardsPage(page)
    
        await expect(initCardsPage.cardRoot).toBeInViewport()
        expect(await initCardsPage.wordDiv.textContent()).toContain('a test-word')
        expect(await initCardsPage.translationDiv.textContent()).toContain(addedWord.translation)
    
        // then delete the word from initial dictionary:
        await initCardsPage.clickCrossBtn()
    
        const modalWindow = new CardWordModalWindow(page)
    
        await expect(modalWindow.title).toHaveText('Do you really want to delete this word?')
        await expect(modalWindow.deleteBtn).toBeEnabled()
        await modalWindow.clickCancelBtn()
    
        // check that current word card doesn't contain word or translation our test item:
        await modalWindow.body.waitFor({state: 'hidden'})
        await expect(initCardsPage.wordArea).toBeEnabled()
        await expect(initCardsPage.alreadyKnowBtn).toBeAttached()
        await expect(initCardsPage.addToListBtn).toBeAttached()
    })
    
    test('Check removing a new word from init dictionary', async ({page}) => {

        // check form of adding words:
        const addNewWordPage = new AddNewWordPage(page)
    
        await expect(addNewWordPage.alertMsg).toHaveText('Here you can add a new word to initial dictionary!')
    
        const addedWord = {
            word: `a test-word${new Date().getTime()}`, 
            translation: 'test translation', 
            wordType: 'nouns' ,
            needToStudyList: false,
        }
    
        // try to fill word form and add a new word to study list:
        await addNewWordPage.fillNewWordForm(addedWord);
        
        // check whether form's inputs become clear:
        await expect(addNewWordPage.wordInput).toHaveValue('')
        await expect(addNewWordPage.translationInput).toHaveValue('')

        const mainPage = new MainPage(page)
    
        await mainPage.backToMainPage()
    
        await expect(mainPage.vocabularySectionBtn).toBeEnabled()
        await mainPage.clickVocabularySectionBtn()
    
        const vocabularyOptionsPage = new VocabularyOptionsPage(page)

        // navigate to addNewWordPage:
        await vocabularyOptionsPage.clickAnySection(1);
    
        const decksPage = new DictionaryDecksPage(page)
    
        await expect(decksPage.deckList).toHaveCount(11)
    
        // go to needed deck to ensure that word has been added:
        await decksPage.deckList.nth(2).click()
    
        const initCardsPage = new InitWordCardsPage(page)
    
        await expect(initCardsPage.cardRoot).toBeInViewport()
        expect(await initCardsPage.wordDiv.textContent()).toContain('a test-word')
        expect(await initCardsPage.translationDiv.textContent()).toContain(addedWord.translation)
    
        // then delete the word from initial dictionary:
        await initCardsPage.clickCrossBtn()
    
        const modalWindow = new CardWordModalWindow(page)
    
        await expect(modalWindow.title).toHaveText('Do you really want to delete this word?')
        await expect(modalWindow.deleteBtn).toBeEnabled()
        await modalWindow.clickDeleteBtn()
    
        // check that current word card doesn't contain word or translation our test item:
        await modalWindow.deleteBtn.waitFor({state: 'hidden'})
        await expect(initCardsPage.wordArea).toBeEnabled()
    
        const finalWord = await initCardsPage.wordDiv.textContent()
    
        expect(finalWord?.trim).not.toEqual(addedWord.word)
    })
})

test.describe('Verifying duplicate\'s flow and separeting addition', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/')

        const mainPage = new MainPage(page)

        await mainPage.clickVocabularySectionBtn()

        const vocabularyOptionsPage = new VocabularyOptionsPage(page)

        await vocabularyOptionsPage.clickAnySection(4)
    })

    test(`Check that new word has been added only to initDictionary`, async ({page, request}) => {

        const newWordPage = new AddNewWordPage(page)
    
        const addedItem = { 
            word: `test_${new Date().getTime()}`,
            translation: 'some translation', 
            wordType: 'nouns' ,
            needToStudyList: false,
        }
    
        // fill the form and add a new word into initial dictionary:
        await newWordPage.fillNewWordForm(addedItem);
    
        // check whether form's inputs became clear:
        await expect(newWordPage.wordInput).toHaveValue('')
        await expect(newWordPage.translationInput).toHaveValue('')
    
        const mainPage = new MainPage(page)
    
        await mainPage.backToMainPage()
    
        await expect(mainPage.vocabularySectionBtn).toBeEnabled()
        await mainPage.clickVocabularySectionBtn()
    
        const vocabularyOptionsPage = new VocabularyOptionsPage(page)
    
        const optionsList = vocabularyOptionsPage.optionsList
    
        await expect(optionsList.nth(2)).not.toBeEnabled()
    
        // verify that init dictionary has added test word:
        const initResponse = await request.get(`${domain}/words/init`, { params: { word: addedItem.word }})
        let initList = await initResponse.json()
    
        expect(initList.length).toEqual(1)
    
        // verify that study dictionary doesn't have added test word:
        const studyResponse = await request.get(`${domain}/words/study`, { params: { word: addedItem.word }})
        let studyList = await studyResponse.json()
    
        expect(studyList.length).toEqual(0)
    
        // remove added word after testing:
        await request.delete(`${domain}/words/init/${initList[0]._id}`)
    })
    
    test(`Check that new word hasn't been added to DB if it's a duplicate`, async ({page, request}) => {
    
        // add an item:
        await request.post(`${domain}/words/init`, { data: {
            word: 'climate',
            translate: 'климат',
            wordType: 'nouns',
        }})
    
        const newWordPage = new AddNewWordPage(page)
    
        // fill form with the same data:
        await newWordPage.fillNewWordForm({
            word: 'climate',
            translation: 'климат',
            wordType: 'nouns',
            needToStudyList: true,
        })
    
        // check whether form's inputs become clear:
        await expect(newWordPage.wordInput).toHaveValue('')
        await expect(newWordPage.translationInput).toHaveValue('')
    
        const mainPage = new MainPage(page)
    
        await mainPage.backToMainPage()
    
        // verify that init dictionary doesn't have that test word:
        const finalInitResponse = await request.get(`${domain}/words/init`, { params: { word: 'climate' }})
        let finalInitList = await finalInitResponse.json()
    
        expect(finalInitList.length).toEqual(1)
    
        // verify that study dictionary doesn't have that test word:
        const finalStudyResponse = await request.get(`${domain}/words/study`, { params: { word: 'climate' }})
        let finalStudyList = await finalStudyResponse.json()
    
        expect(finalStudyList.length).toEqual(0)
    })
})

test.afterAll('Delete generated words after run', async ({ request }) => {
    const initResponse = await request.get(`${domain}/words/init`)

    const initList = await initResponse.json()

    for (let index = 0; index < initList.length; index++) {
        await request.delete(`${domain}/words/init/${initList[index]._id}`)
    }
})