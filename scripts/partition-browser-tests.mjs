import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';

// Native --shard groups adjacent cases; long school missions then land together.
// Round-robin the official list, using Playwright's own --test-list syntax.
const output=execFileSync(process.execPath,['node_modules/playwright/cli.js','test','--list'],{encoding:'utf8',env:{...process.env,FORCE_COLOR:'0'}});
const tests=output.split('\n').map(s=>s.trim()).filter(s=>/\.spec\.js:\d+:\d+ › /.test(s));
const expected=Number(/Total: (\d+) tests? in/.exec(output)?.[1]);
if(!tests.length||tests.length!==expected||new Set(tests).size!==expected)throw Error('Incomplete or duplicate Playwright test list');
const groups=Array.from({length:8},()=>[]);tests.forEach((test,i)=>groups[i%groups.length].push(test));
mkdirSync('work/ci',{recursive:true});groups.forEach((group,i)=>writeFileSync(`work/ci/browser-${i+1}.txt`,group.join('\n')+'\n'));
console.log(`${expected} distinct tests; disjoint groups: ${groups.map(g=>g.length).join(', ')}`);
