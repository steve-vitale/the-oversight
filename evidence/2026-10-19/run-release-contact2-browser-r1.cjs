'use strict';
// Repeat an existing native-touch recipe when the interactive transport is
// unavailable. NODE_PATH supplies the host's bundled Playwright; no install.
const fs=require('fs'),path=require('path'),cp=require('child_process'),{chromium}=require('playwright');
(async()=>{
 const [recipeFile,base,heightArg,outFile,scratchArg]=process.argv.slice(2),height=Number(heightArg);
 if(!recipeFile||!outFile||![736,844].includes(height)||!/^http:\/\/(127\.0\.0\.1|localhost):\d+\/?$/.test(base))throw Error('Pass recipe, disposable loopback origin, phone height, fresh receipt and scratch directory');
 const root=process.cwd(),recipePath=path.resolve(recipeFile),out=path.resolve(outFile),scratch=path.resolve(scratchArg),common=path.resolve(cp.execFileSync('git',['rev-parse','--git-common-dir'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim());
 if(!scratch.startsWith(common+path.sep))throw Error('Browser scratch must stay inside the common Git directory');
 if(fs.existsSync(out))throw Error('Receipt already exists');fs.mkdirSync(path.join(scratch,'.playwright-mcp'),{recursive:true});process.chdir(scratch);
 const run=Function('return ('+fs.readFileSync(recipePath,'utf8')+')')(),browser=await chromium.launch({channel:'msedge',headless:true});
 try{const context=await browser.newContext({viewport:{width:390,height},hasTouch:true,isMobile:true,deviceScaleFactor:1,serviceWorkers:'block'}),page=await context.newPage();await page.goto(base);const result=await run(page);result.driver='Bundled Playwright with headless Microsoft Edge; native CDP touch; no interactive transport';fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({root,height,trace:result.trace.length,networkFailures:result.networkFailures,scratch}));await context.close();}
 finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
