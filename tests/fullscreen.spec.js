import{test,expect}from'@playwright/test';import{start}from'./helpers.js';
test('settings enter and leave real browser fullscreen without closing pause',async({page})=>{
 await start(page);await page.locator('#pause-button').click();const button=page.getByRole('button',{name:'Entrar em tela inteira',exact:true});await expect(button).toBeVisible();await button.click();await expect.poll(()=>page.evaluate(()=>!!document.fullscreenElement)).toBe(true);await expect(page.locator('#pause')).toBeVisible();await page.getByRole('button',{name:'Sair da tela inteira',exact:true}).click();await expect.poll(()=>page.evaluate(()=>!!document.fullscreenElement)).toBe(false);await expect(button).toBeVisible();
});
