import {test, expect} from '@playwright/test'

test('check whether works a positive way', async ({page}) => {
    await page.goto('http://localhost:3000/')

    const vocabularyButton = page.getByRole('button', {name: 'VOCABULARY'})

    expect(await vocabularyButton.textContent()).toEqual('VOCABULARY')

    await vocabularyButton.click()

    const buttonsList = page.locator('.initItem')
    
    expect(await buttonsList.nth(2).textContent()).toEqual('ACTUAL DICTIONARY')
    
    await buttonsList.nth(3).click()
})