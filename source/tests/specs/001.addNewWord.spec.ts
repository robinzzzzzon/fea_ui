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

test.only('Check adding a new word to both dictionaries', async ({page}) => {
    await page.goto('http://localhost:3000/')

    const snippets = new VocabularySnippets()
    const mainPage = new MainPage(page)

    await snippets.checkMainPageStaticContent(page)

    // navigate to vocabularyOptionsPage:
    await mainPage.clickVocabularySectionBtn()

    const vocabularyOptionsPage = new VocabularyOptionsPage(page)

    // check vocabulary option list:
    await snippets.checkVocabularyPageStaticContent(page)

    // navigate to addNewWordPage:
    await vocabularyOptionsPage.clickAnySection(4);

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

    await mainPage.backToMainPage()

    await expect(mainPage.vocabularySectionBtn).toBeEnabled()
    await mainPage.clickVocabularySectionBtn()

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
    expect(await initCardsPage.wordDiv.textContent()).toContain(addedWord.word)
    expect(await initCardsPage.translationDiv.textContent()).toContain(addedWord.translation)

    // then delete the word from initial dictionary:
    await initCardsPage.clickCrossBtn()

    const modalWindow = new CardWordModalWindow(page)

    await expect(modalWindow.title).toHaveText('Do you really want to delete this word?')
    await expect(modalWindow.deleteBtn).toBeEnabled()
    await modalWindow.clickDeleteBtn()

    // check that current word card doesn't contain word or translation our test item:
    await modalWindow.body.waitFor({state: "hidden"})
    await expect(modalWindow.body).toBeHidden()
    expect(await initCardsPage.wordDiv.textContent()).not.toContain(addedWord.word)
    expect(await initCardsPage.translationDiv.textContent()).not.toContain(addedWord.translation)
})

test(`Check that new word has been added only to initDictionary`, async ({page, request}) => {
    await page.goto('http://localhost:3000/')

    const mainPage = new MainPage(page)

    await mainPage.clickVocabularySectionBtn()

    const vocabularyOptionsPage = new VocabularyOptionsPage(page)

    await vocabularyOptionsPage.clickAnySection(4)

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

    await mainPage.backToMainPage()

    await expect(mainPage.vocabularySectionBtn).toBeEnabled()
    await mainPage.clickVocabularySectionBtn()

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
    const startInitResponse = await request.get(`${domain}/words/init`)
    const startInitList = await startInitResponse.json()
    const startStudyResponse = await request.get(`${domain}/words/study`)
    const startStudyList = await startStudyResponse.json()

    await page.goto('http://localhost:3000/')

    const mainPage = new MainPage(page)

    await mainPage.clickVocabularySectionBtn()

    const vocabularyOptionsPage = new VocabularyOptionsPage(page)

    await vocabularyOptionsPage.clickAnySection(4)

    const newWordPage = new AddNewWordPage(page)

    await newWordPage.fillNewWordForm({
        word: startInitList[0].word,
        translation: startInitList[0].translate,
        wordType: startInitList[0].wordType,
        needToStudyList: true,
    })

    // check whether form's inputs become clear:
    await expect(newWordPage.wordInput).toHaveValue('')
    await expect(newWordPage.translationInput).toHaveValue('')

    await mainPage.backToMainPage()

    await expect(mainPage.vocabularySectionBtn).toBeEnabled()
    await mainPage.clickVocabularySectionBtn()

    const optionsList = vocabularyOptionsPage.optionsList

    await expect(optionsList.nth(2)).not.toBeEnabled()

    // verify that init dictionary doesn't have that test word:
    const finalInitResponse = await request.get(`${domain}/words/init`)
    let finalInitList = await finalInitResponse.json()

    expect(finalInitList.length).toEqual(startInitList.length)

    // verify that study dictionary doesn't have that test word:
    const finalStudyResponse = await request.get(`${domain}/words/study`)
    let finalStudyList = await finalStudyResponse.json()

    expect(finalStudyList.length).toEqual(startStudyList.length)
})