import base from './playwright.config.js';
// Same CSS layout, reduced software-rendering buffer. Not physical-device FPS.
export default {...base,use:{...base.use,deviceScaleFactor:.5},workers:1};
