// Enter replay through the album, as a player does in the sequential 1.15+ UX.
export async function startReview(page,group='chapter-1',navigate=true){
 if(navigate)await page.goto('http://localhost:5173');
 await page.getByRole('button',{name:'ÁLBUM',exact:true}).click();
 if(group==='epilogue'){await page.locator('[data-album-category=documents]').click();await page.getByRole('button',{name:'Rever epílogo · A próxima página',exact:true}).click();}
 else await page.getByRole('button',{name:'REVISITAR CAPÍTULO',exact:true}).nth(Number(group.split('-')[1])-1).click();
 await page.evaluate(async()=>window.readGame=(await import('/src/systems/diagnostics.js')).getGameState);
 await page.waitForFunction(()=>!window.readGame().school.loading);
}
