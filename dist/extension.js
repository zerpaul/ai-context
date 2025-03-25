(()=>{"use strict";var t={265:function(t,e,n){var a,o=this&&this.__createBinding||(Object.create?function(t,e,n,a){void 0===a&&(a=n);var o=Object.getOwnPropertyDescriptor(e,n);o&&!("get"in o?!e.__esModule:o.writable||o.configurable)||(o={enumerable:!0,get:function(){return e[n]}}),Object.defineProperty(t,a,o)}:function(t,e,n,a){void 0===a&&(a=n),t[a]=e[n]}),i=this&&this.__setModuleDefault||(Object.create?function(t,e){Object.defineProperty(t,"default",{enumerable:!0,value:e})}:function(t,e){t.default=e}),r=this&&this.__importStar||(a=function(t){return a=Object.getOwnPropertyNames||function(t){var e=[];for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[e.length]=n);return e},a(t)},function(t){if(t&&t.__esModule)return t;var e={};if(null!=t)for(var n=a(t),r=0;r<n.length;r++)"default"!==n[r]&&o(e,t,n[r]);return i(e,t),e});Object.defineProperty(e,"__esModule",{value:!0}),e.activate=function(t){console.log("AI Context Extractor is now active");const e=s.commands.registerCommand("aicontext.extractFolder",(async(t,e)=>{try{if(!t)return void s.window.showErrorMessage("Please select a file or folder to extract context from");const n=s.workspace.getConfiguration("aicontext"),a=!0===n.get("createTxtFileByDefault"),o=n.get("ignoreFolderPaths")||[],i=await l.stat(t.fsPath);if(i.isDirectory()&&!e){const e=c.basename(t.fsPath);if(o.some((n=>e===n||e.includes(n)||t.fsPath.includes(n))))return void s.window.showInformationMessage(`Folder "${e}" matches an ignore pattern and was skipped.`)}const r=e||[t],p=(await Promise.all(r.map((async t=>{const e=await l.stat(t.fsPath),n=c.basename(t.fsPath);return e.isDirectory()&&o.some((e=>n===e||n.includes(e)||t.fsPath.includes(e)))?null:t})))).filter((t=>null!==t));if(0===p.length)return void s.window.showInformationMessage("All selected items match ignore patterns and were skipped.");if(p.length>1){const e=[],n=[];for(const t of p)(await l.stat(t.fsPath)).isDirectory()?e.push(t):n.push(t);if(e.length>0){const o=c.dirname(t.fsPath),i=`multiple_items_${(new Date).toISOString().replace(/[:.]/g,"-")}.txt`,r=c.join(o,i);return await async function(t,e,n,a,o){await s.window.withProgress({location:s.ProgressLocation.Notification,title:"Extracting multiple items...",cancellable:!0},(async i=>{const r=s.workspace.getConfiguration("aicontext"),u=r.get("ignoreFileExtensions")||[],w=r.get("ignoreFolderPaths")||[],g=r.get("ignoreFiles")||[];let p="MULTIPLE ITEMS EXTRACTION\n=======================\n";p+=`Root Path: ${a}\n`,p+=`Scan Date: ${(new Date).toISOString()}\n`;const m=new Set,P=[],$=new Map;p+="SELECTED ITEMS\n==============\n",t.forEach((t=>{const e=h(t.fsPath,a);p+=`${e} (folder)\n`}));let E=0;for(const e of t){const n=e.fsPath,o=c.basename(n);i.report({message:`Processing folder ${o}... (${E+1}/${t.length})`,increment:t.length>0?40/t.length:0});const r=await d(n,w,u,g);for(const t of r)if(!m.has(t)){m.add(t);const e=c.relative(n,c.dirname(t)),i=c.basename(t);let r=h(n,a);e&&(r=c.join(r,e)),$.has(r)||$.set(r,[]),$.get(r)?.push(i),P.push({path:t,relativePath:c.join(o,c.relative(n,t))})}E++}const x=e.filter((t=>{const e=t.fsPath,n=c.basename(e),a=c.extname(n);return!u.includes(a)&&!g.some((t=>n===t))&&!f(e,w)}));x.forEach((t=>{p+=`${c.relative(a,t.fsPath)}\n`})),p+="\n";for(const t of x)if(!m.has(t.fsPath)){m.add(t.fsPath);const e=c.relative(a,c.dirname(t.fsPath)),n=c.basename(t.fsPath);$.has(e)||$.set(e,[]),$.get(e)?.push(n),P.push({path:t.fsPath,relativePath:c.relative(a,t.fsPath)})}p+=`Total Files: ${P.length}\n\n`,p+="DIRECTORY STRUCTURE\n==================\n";for(const[t,e]of $)p+=t?`/${t}/\n`:"/\n",e.forEach((t=>{p+=`  └── ${t}\n`}));p+="\n",p+="FILE CONTENTS\n=============\n\n";let v=0;const T=P.length;for(const t of P)try{const e=await l.readFile(t.path,"utf8"),n="=".repeat(80);p+=`${n}\n`,p+=`Absolute Path: ${t.path}\n`,p+=`Relative Path: ${t.relativePath}\n`,p+=`${n}\n\n`,p+=e,p+="\n\n",v++,i.report({message:`Processing files... (${v}/${T})`,increment:60/T})}catch(e){p+=`Error reading file ${t.path}: ${e}\n\n`}o&&await l.writeFile(n,p,"utf8"),await s.env.clipboard.writeText(p)}))}(e,n,r,o,a),void(a?await w(i,r):await g())}{const t=c.dirname(n[0].fsPath),e=`selected_files_${(new Date).toISOString().replace(/[:.]/g,"-")}.txt`,o=c.join(t,e);return await u(n,o,t,a),void(a?await w(e,o):await g())}}if(i.isDirectory()){const e=t.fsPath,n=`${c.basename(e)}_${(new Date).toISOString().replace(/[:.]/g,"-")}.txt`,o=c.join(e,n);return await async function(t,e,n){await s.window.withProgress({location:s.ProgressLocation.Notification,title:"Extracting folder context...",cancellable:!0},(async a=>{const o=s.workspace.getConfiguration("aicontext"),i=o.get("ignoreFileExtensions")||[],r=o.get("ignoreFolderPaths")||[],f=o.get("ignoreFiles")||[];let h="PROJECT METADATA\n===============\n";h+=`Project Root: ${t}\n`,h+=`Scan Date: ${(new Date).toISOString()}\n`;const u=await d(t,r,i,f);h+=`Total Files: ${u.length}\n\n`,a.report({message:"Building directory structure..."}),h+="DIRECTORY STRUCTURE\n==================\n";const w=new Map;u.forEach((e=>{const n=c.relative(t,c.dirname(e)),a=c.basename(e);w.has(n)||w.set(n,[]),w.get(n)?.push(a)}));for(const[t,e]of w)h+=t?`/${t}/\n`:"/\n",e.forEach((t=>{h+=`  └── ${t}\n`}));h+="\n",a.report({message:"Reading file contents..."}),h+="FILE CONTENTS\n=============\n\n";let g=0;for(const e of u)try{const n=await l.readFile(e,"utf8"),o="=".repeat(80);h+=`${o}\n`,h+=`Absolute Path: ${e}\n`,h+=`Relative Path: ${c.relative(t,e)}\n`,h+=`${o}\n\n`,h+=n,h+="\n\n",g++,a.report({message:`Processing files... (${g}/${u.length})`,increment:100/u.length})}catch(t){h+=`Error reading file ${e}: ${t}\n\n`}n&&await l.writeFile(e,h,"utf8"),await s.env.clipboard.writeText(h)}))}(e,o,a),void(a?await w(n,o):await g())}const m=function(t){const e=[...s.window.activeTextEditor?.document?[s.window.activeTextEditor.document.uri]:[],...s.window.visibleTextEditors.map((t=>t.document.uri))];return e.some((e=>e.fsPath===t.fsPath))||e.push(t),Array.from(new Set(e)).filter((t=>"file"===t.scheme)).map((t=>s.Uri.file(t.fsPath)))}(t),P=c.dirname(t.fsPath),$=(new Date).toISOString().replace(/[:.]/g,"-"),E=m.length>1?`selected_files_${$}.txt`:`single_file_${$}.txt`,x=c.join(P,E);await u(m,x,P,a),a?await w(E,x):await g()}catch(t){s.window.showErrorMessage(`Error extracting context: ${t}`)}}));t.subscriptions.push(e)},e.deactivate=function(){};const s=r(n(398)),c=r(n(928)),l=r(n(943));function f(t,e){const n=t.toLowerCase();return e.some((t=>{const e=t.toLowerCase();return n.includes(e)}))}function h(t,e){return c.relative(e,t)||c.basename(t)}async function u(t,e,n,a){await s.window.withProgress({location:s.ProgressLocation.Notification,title:"Extracting file context...",cancellable:!0},(async o=>{const i=s.workspace.getConfiguration("aicontext"),r=i.get("ignoreFileExtensions")||[],h=i.get("ignoreFolderPaths")||[],u=i.get("ignoreFiles")||[],w=t.filter((t=>{const e=t.fsPath,n=c.basename(e),a=c.extname(n);return!r.includes(a)&&!u.some((t=>n===t))&&!f(e,h)}));let g="FILE EXTRACTION\n===============\n";g+=`Root Path: ${n}\n`,g+=`Scan Date: ${(new Date).toISOString()}\n`,g+=`Total Files: ${w.length}\n\n`,g+="SELECTED FILES\n==============\n",w.forEach((t=>{g+=`${c.relative(n,t.fsPath)}\n`})),g+="\n",g+="DIRECTORY STRUCTURE\n==================\n";const d=new Map;w.forEach((t=>{const e=c.relative(n,c.dirname(t.fsPath)),a=c.basename(t.fsPath);d.has(e)||d.set(e,[]),d.get(e)?.push(a)}));for(const[t,e]of d)g+=t?`/${t}/\n`:"/\n",e.forEach((t=>{g+=`  └── ${t}\n`}));g+="\n",g+="FILE CONTENTS\n=============\n\n";let p=0;for(const t of w)try{const e=await l.readFile(t.fsPath,"utf8"),a="=".repeat(80);g+=`${a}\n`,g+=`Absolute Path: ${t.fsPath}\n`,g+=`Relative Path: ${c.relative(n,t.fsPath)}\n`,g+=`${a}\n\n`,g+=e,g+="\n\n",p++,o.report({message:`Processing files... (${p}/${w.length})`,increment:100/w.length})}catch(e){g+=`Error reading file ${t.fsPath}: ${e}\n\n`}a&&await l.writeFile(e,g,"utf8"),await s.env.clipboard.writeText(g)}))}async function w(t,e){if("Open File"===await s.window.showInformationMessage(`Successfully extracted context to ${t} (and copied to clipboard)`,"Open File")){const t=await s.workspace.openTextDocument(e);await s.window.showTextDocument(t)}}async function g(){await s.window.showInformationMessage("Context copied to clipboard")}async function d(t,e,n,a){const o=[];return await async function t(i){const r=await l.readdir(i,{withFileTypes:!0});for(const s of r){const r=c.join(i,s.name);if(s.isDirectory()){if(s.name.startsWith("."))continue;if(f(s.name,e)||f(r,e))continue;await t(r)}else if(s.isFile()){if(a.some((t=>s.name===t)))continue;const t=c.extname(s.name);if(n.includes(t))continue;if(f(r,e))continue;o.push(r)}}}(t),o}},398:t=>{t.exports=require("vscode")},943:t=>{t.exports=require("fs/promises")},928:t=>{t.exports=require("path")}},e={},n=function n(a){var o=e[a];if(void 0!==o)return o.exports;var i=e[a]={exports:{}};return t[a].call(i.exports,i,i.exports,n),i.exports}(265);module.exports=n})();