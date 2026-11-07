import {test,expect} from '@playwright/test';
test('explore courtyard and talk to Maria without runtime errors',async({page})=>{
 test.setTimeout(90000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:5173');await page.getByRole('button',{name:'Começar a explorar'}).click();
 await expect(page.locator('#welcome')).toBeHidden();
 await page.evaluate(async()=>{window.readGame=(await import('/src/main.js')).getGameState;});
 const move=async(key,axis,value)=>{await page.keyboard.down(key);await page.waitForFunction(({axis,value})=>{const n=window.readGame()[axis];return axis==='x'?n>=value:n<=value;},{axis,value},{timeout:30000});await page.keyboard.up(key);};
 await move('d','x',5);await move('w','z',6);
 await expect(page.locator('#prompt')).toContainText('Maria');await page.keyboard.press('e');
 await expect(page.locator('#dialog')).toBeVisible();await page.getByRole('button',{name:'Continuar'}).click();
 await expect(page.locator('#objective')).toContainText('três lembranças');
 await page.setViewportSize({width:390,height:844});await expect(page.locator('#touch')).toBeVisible();
 await page.screenshot({path:'test-results/prototipo.png'});expect(errors).toEqual([]);
});
