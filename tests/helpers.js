export async function seed(page, progress = {}, settings = {}) {
  await page.addInitScript(({ progress, settings }) => {
    if (!sessionStorage.getItem('test-seeded')) {
      localStorage.setItem('lorenzo-maria-v02', JSON.stringify({ version: 2, progress: { stage: 0, collected: [], position: { x: 0, z: 19 }, ...progress }, settings: { quality: 'low', shadows: false, adaptive: false, ...settings } }));
      sessionStorage.setItem('test-seeded', 'true');
    }
  }, { progress, settings });
}
export async function start(page) {
  await page.goto('http://localhost:5173'); await page.locator('#start').click();
  await page.evaluate(async () => { window.readGame = (await import('/src/systems/diagnostics.js')).getGameState; });
}
export const state = page => page.evaluate(() => window.readGame());
export async function move(page, key, axis, value, compare = 'less') {
  await page.keyboard.down(key);
  await page.waitForFunction(({ axis, value, compare }) => compare === 'less' ? window.readGame()[axis] <= value : window.readGame()[axis] >= value, { axis, value, compare }, { timeout: 45000 });
  await page.keyboard.up(key);
}
export async function pointer(page, selector, type, x, y, id = 1, pointerType = 'touch') {
  await page.locator(selector).dispatchEvent(type, { pointerId: id, pointerType, clientX: x, clientY: y, button: 0, buttons: type === 'pointerup' ? 0 : 1, bubbles: true });
}
