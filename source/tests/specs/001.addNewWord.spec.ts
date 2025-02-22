import { test, expect } from '@playwright/test'
import { VocabularySnippets } from '../snippets/vocabularySnippets'
import { MainPage } from '../pageObjects/pages/mainPage'
import { VocabularyOptionsPage } from '../pageObjects/pages/vocabularyOptionsPage'
import { AddNewWordPage } from '../pageObjects/pages/addNewWordPage'
import { StudyWordsPage } from '../pageObjects/pages/studyWordsPage'
import { DictionaryDecksPage } from '../pageObjects/pages/dictionaryDecksPage'

test('Check adding a new word to dictionary', async ({page}) => {
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

    // try to fill word form and add a new word to study list:
    await addNewWordPage.fillNewWordForm({ 
        word: `testWord${new Date().getTime()}`, 
        translation: 'Test translation', 
        wordType: 'adverbs' 
    });
    
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
})