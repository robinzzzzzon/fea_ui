import {test, expect} from '@playwright/test'

test('Check adding a new word to dictionary', async ({page}) => {
    await page.goto('http://localhost:3000/')

    const initBtnList = page.getByRole('button')

    // check starting conditions of init buttonList:
    expect((initBtnList)).toHaveCount(2)
    expect(await initBtnList.first().textContent()).toEqual('VOCABULARY')
    expect(await initBtnList.last().textContent()).toEqual('SPEAKING')
    expect(initBtnList.first()).toHaveClass(/(^|\s)dictionary(\s|$)/)
    expect(initBtnList.last()).toHaveClass(/(^|\s)initItem(\s|$)/)
    expect(initBtnList.first()).toHaveAttribute('data-name', 'vocabulary')
    expect(initBtnList.last()).toHaveAttribute('data-name', 'speaking')
    expect(initBtnList.first()).toBeEnabled()
    expect(initBtnList.last()).toBeEnabled()

    await initBtnList.first().click()

    // check vocabulary option list:
    const vocabularyOptionList = page.locator('.initItem')
    
    expect(vocabularyOptionList.first()).toBeEnabled()
    expect(vocabularyOptionList.nth(1)).toBeDisabled()
    expect(vocabularyOptionList.nth(2)).toBeDisabled()
    expect(vocabularyOptionList.last()).toBeEnabled()

    const vocabularyValueList = [
        { text: 'CHOOSE WORDS', dataName: 'seekNew'}, 
        { text: 'STUDY WORDS', dataName: 'getTraining'}, 
        { text: 'ACTUAL DICTIONARY', dataName: 'seeActual'}, 
        { text: 'ADD NEW WORD', dataName: 'addNew'}, 
    ]

    for (let i = 0; i < vocabularyValueList.length; i++) {
        expect(vocabularyOptionList.nth(i)).toBeInViewport()
        expect(vocabularyOptionList.nth(i)).toHaveClass('dictionary initItem shadow-lg')
        expect(vocabularyOptionList.nth(i)).toHaveText(vocabularyValueList[i].text)
        expect(vocabularyOptionList.nth(i)).toHaveAttribute('data-name', vocabularyValueList[i].dataName)
    }
    
    await vocabularyOptionList.last().click()

    // check form of adding words:
    const formRoot = page.locator('.wordFormRoot')

    const alert = formRoot.getByRole('alert')

    await expect(alert).toHaveText('Here you can add a new word to initial dictionary!')

    const wordInput = page.locator('#word')
    const translationInput = page.locator('#translation')
    const wordTypeSelect = page.locator('#type')
    const studyListCb = page.locator('#studyCb input')
    const confirmBtn = page.getByRole('button', { name: 'Confirm'})

    // try to fill word form and add a new word to study list:
    await wordInput.fill(`testWord${new Date().getTime()}`)
    await translationInput.fill('test translation')
    await wordTypeSelect.click()
    await wordTypeSelect.selectOption({value: 'adverbs'})
    await studyListCb.check()
    await confirmBtn.click()
    
    // check whether form's inputs become clear:
    await expect(wordInput).toHaveValue('')
    await expect(translationInput).toHaveValue('')

    await page.reload()

    await expect(initBtnList.first()).toBeEnabled()
    await initBtnList.first().click()

    await expect(vocabularyOptionList.nth(2)).toBeEnabled()
    await vocabularyOptionList.nth(2).click()

    // go to study list page and verify that our word has beed added to active study list:
    const studyWordsList = page.locator('.actualDictionaryRoot .actualItem')

    await expect(studyWordsList).toHaveCount(1)

    const resetBtn = page.getByRole('button', {name: 'Reset'})
    const deleteBtn = page.getByRole('button', {name: 'Delete'})

    // remove that word from list and ensure that this list is clear now:
    await resetBtn.click()
    await deleteBtn.click()

    await expect(studyWordsList).toHaveCount(0)

    // go to the new dictionary page and check that routing has been done successfully:
    await page.getByText('Got it').click()

    const dictionaryDeckList = page.locator('.dictionaryRoot > button.dictionary')

    await expect(dictionaryDeckList).toHaveCount(11)
})