/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(__webpack_require__(1));
const path = __importStar(__webpack_require__(2));
const fs = __importStar(__webpack_require__(3));
function activate(context) {
    console.log('AI Context Extractor is now active');
    const disposable = vscode.commands.registerCommand('aicontext.extractFolder', async (uri) => {
        if (!uri) {
            vscode.window.showErrorMessage('Please select a folder to extract context from');
            return;
        }
        try {
            const folderPath = uri.fsPath;
            const folderName = path.basename(folderPath);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const outputFileName = `${folderName}_${timestamp}.txt`;
            const outputPath = path.join(folderPath, outputFileName);
            // Show progress indicator
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Extracting folder context...",
                cancellable: true
            }, async (progress) => {
                // Project metadata
                let output = 'PROJECT METADATA\n===============\n';
                output += `Project Root: ${folderPath}\n`;
                output += `Scan Date: ${new Date().toISOString()}\n`;
                // Get all files recursively
                const files = await getAllFiles(folderPath);
                output += `Total Files: ${files.length}\n\n`;
                progress.report({ message: "Building directory structure..." });
                // Directory structure
                output += 'DIRECTORY STRUCTURE\n==================\n';
                const structure = new Map();
                files.forEach(file => {
                    const relPath = path.relative(folderPath, path.dirname(file));
                    const fileName = path.basename(file);
                    if (!structure.has(relPath)) {
                        structure.set(relPath, []);
                    }
                    structure.get(relPath)?.push(fileName);
                });
                for (const [dir, fileList] of structure) {
                    output += dir ? `/${dir}/\n` : '/\n';
                    fileList.forEach(file => {
                        output += `  └── ${file}\n`;
                    });
                }
                output += '\n';
                progress.report({ message: "Reading file contents..." });
                // File contents
                output += 'FILE CONTENTS\n=============\n\n';
                let processedFiles = 0;
                for (const file of files) {
                    try {
                        const content = await fs.readFile(file, 'utf8');
                        const separator = '='.repeat(80);
                        output += `${separator}\n`;
                        output += `Absolute Path: ${file}\n`;
                        output += `Relative Path: ${path.relative(folderPath, file)}\n`;
                        output += `${separator}\n\n`;
                        output += content;
                        output += '\n\n';
                        processedFiles++;
                        progress.report({
                            message: `Processing files... (${processedFiles}/${files.length})`,
                            increment: (100 / files.length)
                        });
                    }
                    catch (error) {
                        output += `Error reading file ${file}: ${error}\n\n`;
                    }
                }
                // Write the output file
                await fs.writeFile(outputPath, output, 'utf8');
            });
            // Show success message with option to open the file
            const action = await vscode.window.showInformationMessage(`Successfully extracted context to ${outputFileName}`, 'Open File');
            if (action === 'Open File') {
                const doc = await vscode.workspace.openTextDocument(outputPath);
                await vscode.window.showTextDocument(doc);
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error extracting folder context: ${error}`);
        }
    });
    context.subscriptions.push(disposable);
}
async function getAllFiles(dirPath) {
    const files = [];
    async function traverse(currentPath) {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);
            // Skip node_modules and .git directories
            if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                await traverse(fullPath);
            }
            else if (entry.isFile()) {
                // You can add file extension filtering here if needed
                files.push(fullPath);
            }
        }
    }
    await traverse(dirPath);
    return files;
}
function deactivate() { }


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("fs/promises");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map