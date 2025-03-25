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
    const disposable = vscode.commands.registerCommand('aicontext.extractFolder', async (uri, selectedUris) => {
        try {
            if (!uri) {
                vscode.window.showErrorMessage('Please select a file or folder to extract context from');
                return;
            }
            // Read user setting for whether or not to create a .txt file
            const config = vscode.workspace.getConfiguration('aicontext');
            const createTxtByDefault = config.get('createTxtFileByDefault') === true;
            const ignoreFolderPaths = config.get('ignoreFolderPaths') || [];
            // If we're explicitly selecting a folder, check if it should be ignored
            const stats = await fs.stat(uri.fsPath);
            if (stats.isDirectory() && !selectedUris) {
                const folderName = path.basename(uri.fsPath);
                // Check if the folder name or path contains any of the ignore patterns
                if (ignoreFolderPaths.some(pattern => folderName === pattern ||
                    folderName.includes(pattern) ||
                    uri.fsPath.includes(pattern))) {
                    vscode.window.showInformationMessage(`Folder "${folderName}" matches an ignore pattern and was skipped.`);
                    return;
                }
            }
            // Determine if we have multiple items selected
            const allItems = selectedUris || [uri];
            // Filter out any items that match ignore patterns
            const filteredItems = await Promise.all(allItems.map(async (item) => {
                const itemStats = await fs.stat(item.fsPath);
                const itemName = path.basename(item.fsPath);
                if (itemStats.isDirectory() &&
                    ignoreFolderPaths.some(pattern => itemName === pattern ||
                        itemName.includes(pattern) ||
                        item.fsPath.includes(pattern))) {
                    return null; // This item should be ignored
                }
                return item;
            }));
            // Remove null entries (ignored items)
            const validItems = filteredItems.filter(item => item !== null);
            if (validItems.length === 0) {
                vscode.window.showInformationMessage('All selected items match ignore patterns and were skipped.');
                return;
            }
            // Check if we have multiple items (files and/or folders)
            if (validItems.length > 1) {
                // Separate folders and files
                const folders = [];
                const files = [];
                for (const item of validItems) {
                    const itemStats = await fs.stat(item.fsPath);
                    if (itemStats.isDirectory()) {
                        folders.push(item);
                    }
                    else {
                        files.push(item);
                    }
                }
                // If we have multiple folders OR a mix of folders and files
                if (folders.length > 0) {
                    const rootPath = path.dirname(uri.fsPath);
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const outputFileName = `multiple_items_${timestamp}.txt`;
                    const outputPath = path.join(rootPath, outputFileName);
                    await processMultipleItems(folders, files, outputPath, rootPath, createTxtByDefault);
                    if (createTxtByDefault) {
                        await showFileCreationMessage(outputFileName, outputPath);
                    }
                    else {
                        await showClipboardOnlyMessage();
                    }
                    return;
                }
                else {
                    // Only multiple files, no folders
                    const folderPath = path.dirname(files[0].fsPath);
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const outputFileName = `selected_files_${timestamp}.txt`;
                    const outputPath = path.join(folderPath, outputFileName);
                    await processFiles(files, outputPath, folderPath, createTxtByDefault);
                    if (createTxtByDefault) {
                        await showFileCreationMessage(outputFileName, outputPath);
                    }
                    else {
                        await showClipboardOnlyMessage();
                    }
                    return;
                }
            }
            // Handle single item (file or folder)
            if (stats.isDirectory()) {
                const folderPath = uri.fsPath;
                const folderName = path.basename(folderPath);
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const outputFileName = `${folderName}_${timestamp}.txt`;
                const outputPath = path.join(folderPath, outputFileName);
                await processFolderContent(folderPath, outputPath, createTxtByDefault);
                if (createTxtByDefault) {
                    await showFileCreationMessage(outputFileName, outputPath);
                }
                else {
                    await showClipboardOnlyMessage();
                }
                return;
            }
            // Handle single file case
            const filesToProcess = getSelectedFiles(uri);
            const folderPath = path.dirname(uri.fsPath);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const outputFileName = filesToProcess.length > 1
                ? `selected_files_${timestamp}.txt`
                : `single_file_${timestamp}.txt`;
            const outputPath = path.join(folderPath, outputFileName);
            await processFiles(filesToProcess, outputPath, folderPath, createTxtByDefault);
            if (createTxtByDefault) {
                await showFileCreationMessage(outputFileName, outputPath);
            }
            else {
                await showClipboardOnlyMessage();
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error extracting context: ${error}`);
        }
    });
    context.subscriptions.push(disposable);
}
// Improved function to check if a path should be ignored based on ignoreFolderPaths
function shouldIgnorePath(pathToCheck, ignoreFolderPaths) {
    const normalizedPath = pathToCheck.toLowerCase(); // Case-insensitive check
    return ignoreFolderPaths.some(pattern => {
        const normalizedPattern = pattern.toLowerCase();
        return normalizedPath.includes(normalizedPattern);
    });
}
// Check if a path is a child of another path
function isChildPath(childPath, parentPath) {
    const relativePath = path.relative(parentPath, childPath);
    return relativePath !== '' && !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
}
// Helper function to get folder display name
function getFolderDisplayName(folderPath, rootPath) {
    const relativePath = path.relative(rootPath, folderPath);
    // If the relative path is empty, use the folder name instead
    return relativePath || path.basename(folderPath);
}
// New function to process multiple items (folders and files)
async function processMultipleItems(folders, files, outputPath, rootPath, createTxtByDefault) {
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Extracting multiple items...",
        cancellable: true
    }, async (progress) => {
        // Get configuration settings
        const config = vscode.workspace.getConfiguration('aicontext');
        const ignoreFileExtensions = config.get('ignoreFileExtensions') || [];
        const ignoreFolderPaths = config.get('ignoreFolderPaths') || [];
        const ignoreFiles = config.get('ignoreFiles') || [];
        let output = 'MULTIPLE ITEMS EXTRACTION\n=======================\n';
        output += `Root Path: ${rootPath}\n`;
        output += `Scan Date: ${new Date().toISOString()}\n`;
        // Keep track of all processed files to avoid duplicates
        const processedFilePaths = new Set();
        const allFiles = [];
        const directoryStructure = new Map();
        // First, list all selected folders
        output += 'SELECTED ITEMS\n==============\n';
        folders.forEach(folder => {
            // Use the new helper function to get a proper display name
            const displayName = getFolderDisplayName(folder.fsPath, rootPath);
            output += `${displayName} (folder)\n`;
        });
        // Process folders
        let processedFolders = 0;
        for (const folder of folders) {
            const folderPath = folder.fsPath;
            const folderName = path.basename(folderPath);
            progress.report({
                message: `Processing folder ${folderName}... (${processedFolders + 1}/${folders.length})`,
                increment: folders.length > 0 ? (40 / folders.length) : 0
            });
            // Get all files from this folder that aren't in ignored paths
            const folderFiles = await getAllFiles(folderPath, ignoreFolderPaths, ignoreFileExtensions, ignoreFiles);
            // Add these files to our combined collection, avoiding duplicates
            for (const file of folderFiles) {
                if (!processedFilePaths.has(file)) {
                    processedFilePaths.add(file);
                    const relDir = path.relative(folderPath, path.dirname(file));
                    const fileName = path.basename(file);
                    // Get display name for the structure
                    let structureKey = getFolderDisplayName(folderPath, rootPath);
                    if (relDir) {
                        structureKey = path.join(structureKey, relDir);
                    }
                    if (!directoryStructure.has(structureKey)) {
                        directoryStructure.set(structureKey, []);
                    }
                    directoryStructure.get(structureKey)?.push(fileName);
                    allFiles.push({
                        path: file,
                        relativePath: path.join(folderName, path.relative(folderPath, file))
                    });
                }
            }
            processedFolders++;
        }
        // Process individual files
        const filteredFiles = files.filter(file => {
            const filePath = file.fsPath;
            const fileName = path.basename(filePath);
            const fileExt = path.extname(fileName);
            // Skip files with extensions in ignoreFileExtensions
            if (ignoreFileExtensions.includes(fileExt)) {
                return false;
            }
            // Skip files that match any of the ignoreFiles
            if (ignoreFiles.some(ignoreFile => fileName === ignoreFile)) {
                return false;
            }
            // Skip files in folders that match any of the ignoreFolderPaths
            if (shouldIgnorePath(filePath, ignoreFolderPaths)) {
                return false;
            }
            return true;
        });
        // Add filtered files to selected items
        filteredFiles.forEach(file => {
            output += `${path.relative(rootPath, file.fsPath)}\n`;
        });
        output += '\n';
        // Add individual files to structure
        for (const file of filteredFiles) {
            if (!processedFilePaths.has(file.fsPath)) {
                processedFilePaths.add(file.fsPath);
                const dirName = path.relative(rootPath, path.dirname(file.fsPath));
                const fileName = path.basename(file.fsPath);
                if (!directoryStructure.has(dirName)) {
                    directoryStructure.set(dirName, []);
                }
                directoryStructure.get(dirName)?.push(fileName);
                allFiles.push({
                    path: file.fsPath,
                    relativePath: path.relative(rootPath, file.fsPath)
                });
            }
        }
        output += `Total Files: ${allFiles.length}\n\n`;
        // Add directory structure section (at the top as requested)
        output += 'DIRECTORY STRUCTURE\n==================\n';
        for (const [dir, fileList] of directoryStructure) {
            output += dir ? `/${dir}/\n` : '/\n';
            fileList.forEach(file => {
                output += `  └── ${file}\n`;
            });
        }
        output += '\n';
        // Add file contents section
        output += 'FILE CONTENTS\n=============\n\n';
        let processedFiles = 0;
        const totalFiles = allFiles.length;
        for (const file of allFiles) {
            try {
                const content = await fs.readFile(file.path, 'utf8');
                const separator = '='.repeat(80);
                output += `${separator}\n`;
                output += `Absolute Path: ${file.path}\n`;
                output += `Relative Path: ${file.relativePath}\n`;
                output += `${separator}\n\n`;
                output += content;
                output += '\n\n';
                processedFiles++;
                progress.report({
                    message: `Processing files... (${processedFiles}/${totalFiles})`,
                    increment: (60 / totalFiles)
                });
            }
            catch (error) {
                output += `Error reading file ${file.path}: ${error}\n\n`;
            }
        }
        // Write to file only if user setting is enabled
        if (createTxtByDefault) {
            await fs.writeFile(outputPath, output, 'utf8');
        }
        // Always copy to clipboard
        await vscode.env.clipboard.writeText(output);
    });
}
function getSelectedFiles(clickedUri) {
    // Get all selected files from the VS Code explorer
    const selectedUris = vscode.window.activeTextEditor?.document
        ? [vscode.window.activeTextEditor.document.uri]
        : [];
    // Get the current selection from the explorer
    const explorerSelection = vscode.window.visibleTextEditors
        .map(editor => editor.document.uri);
    // Combine all selections
    const allUris = [...selectedUris, ...explorerSelection];
    // Add the clicked file if it's not already included
    if (!allUris.some(uri => uri.fsPath === clickedUri.fsPath)) {
        allUris.push(clickedUri);
    }
    // Remove duplicates and filter out non-file URIs
    return Array.from(new Set(allUris))
        .filter(uri => uri.scheme === 'file')
        .map(uri => vscode.Uri.file(uri.fsPath));
}
async function processFiles(files, outputPath, rootPath, createTxtByDefault) {
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Extracting file context...",
        cancellable: true
    }, async (progress) => {
        // Get configuration settings
        const config = vscode.workspace.getConfiguration('aicontext');
        const ignoreFileExtensions = config.get('ignoreFileExtensions') || [];
        const ignoreFolderPaths = config.get('ignoreFolderPaths') || [];
        const ignoreFiles = config.get('ignoreFiles') || [];
        // Filter files based on ignore settings
        const filteredFiles = files.filter(file => {
            const filePath = file.fsPath;
            const fileName = path.basename(filePath);
            const fileExt = path.extname(fileName);
            // Skip files with extensions in ignoreFileExtensions
            if (ignoreFileExtensions.includes(fileExt)) {
                return false;
            }
            // Skip files that match any of the ignoreFiles
            if (ignoreFiles.some(ignoreFile => fileName === ignoreFile)) {
                return false;
            }
            // Skip files in folders that match any of the ignoreFolderPaths
            if (shouldIgnorePath(filePath, ignoreFolderPaths)) {
                return false;
            }
            return true;
        });
        let output = 'FILE EXTRACTION\n===============\n';
        output += `Root Path: ${rootPath}\n`;
        output += `Scan Date: ${new Date().toISOString()}\n`;
        output += `Total Files: ${filteredFiles.length}\n\n`;
        output += 'SELECTED FILES\n==============\n';
        filteredFiles.forEach(file => {
            output += `${path.relative(rootPath, file.fsPath)}\n`;
        });
        output += '\n';
        // Directory structure section now at the top (before file contents)
        output += 'DIRECTORY STRUCTURE\n==================\n';
        const structure = new Map();
        filteredFiles.forEach(file => {
            const dirName = path.relative(rootPath, path.dirname(file.fsPath));
            const fileName = path.basename(file.fsPath);
            if (!structure.has(dirName)) {
                structure.set(dirName, []);
            }
            structure.get(dirName)?.push(fileName);
        });
        for (const [dir, fileList] of structure) {
            output += dir ? `/${dir}/\n` : '/\n';
            fileList.forEach(file => {
                output += `  └── ${file}\n`;
            });
        }
        output += '\n';
        output += 'FILE CONTENTS\n=============\n\n';
        let processedFiles = 0;
        for (const file of filteredFiles) {
            try {
                const content = await fs.readFile(file.fsPath, 'utf8');
                const separator = '='.repeat(80);
                output += `${separator}\n`;
                output += `Absolute Path: ${file.fsPath}\n`;
                output += `Relative Path: ${path.relative(rootPath, file.fsPath)}\n`;
                output += `${separator}\n\n`;
                output += content;
                output += '\n\n';
                processedFiles++;
                progress.report({
                    message: `Processing files... (${processedFiles}/${filteredFiles.length})`,
                    increment: (100 / filteredFiles.length)
                });
            }
            catch (error) {
                output += `Error reading file ${file.fsPath}: ${error}\n\n`;
            }
        }
        // Write to file only if user setting is enabled
        if (createTxtByDefault) {
            await fs.writeFile(outputPath, output, 'utf8');
        }
        // Always copy to clipboard
        await vscode.env.clipboard.writeText(output);
    });
}
async function processFolderContent(folderPath, outputPath, createTxtByDefault) {
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Extracting folder context...",
        cancellable: true
    }, async (progress) => {
        // Get configuration settings
        const config = vscode.workspace.getConfiguration('aicontext');
        const ignoreFileExtensions = config.get('ignoreFileExtensions') || [];
        const ignoreFolderPaths = config.get('ignoreFolderPaths') || [];
        const ignoreFiles = config.get('ignoreFiles') || [];
        let output = 'PROJECT METADATA\n===============\n';
        output += `Project Root: ${folderPath}\n`;
        output += `Scan Date: ${new Date().toISOString()}\n`;
        const files = await getAllFiles(folderPath, ignoreFolderPaths, ignoreFileExtensions, ignoreFiles);
        output += `Total Files: ${files.length}\n\n`;
        progress.report({ message: "Building directory structure..." });
        // Directory structure section at the top as requested
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
        // Write to file only if user setting is enabled
        if (createTxtByDefault) {
            await fs.writeFile(outputPath, output, 'utf8');
        }
        // Always copy to clipboard
        await vscode.env.clipboard.writeText(output);
    });
}
async function showFileCreationMessage(outputFileName, outputPath) {
    const action = await vscode.window.showInformationMessage(`Successfully extracted context to ${outputFileName} (and copied to clipboard)`, 'Open File');
    if (action === 'Open File') {
        const doc = await vscode.workspace.openTextDocument(outputPath);
        await vscode.window.showTextDocument(doc);
    }
}
async function showClipboardOnlyMessage() {
    await vscode.window.showInformationMessage('Context copied to clipboard');
}
async function getAllFiles(dirPath, ignoreFolderPaths, ignoreFileExtensions, ignoreFiles) {
    const files = [];
    async function traverse(currentPath) {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);
            if (entry.isDirectory()) {
                // Skip hidden directories by default
                if (entry.name.startsWith('.')) {
                    continue;
                }
                // Check if this folder should be ignored based on name or path
                if (shouldIgnorePath(entry.name, ignoreFolderPaths) ||
                    shouldIgnorePath(fullPath, ignoreFolderPaths)) {
                    continue;
                }
                await traverse(fullPath);
            }
            else if (entry.isFile()) {
                // Skip files that match any of the ignoreFiles
                if (ignoreFiles.some(file => entry.name === file)) {
                    continue;
                }
                // Skip files with extensions in ignoreFileExtensions
                const fileExt = path.extname(entry.name);
                if (ignoreFileExtensions.includes(fileExt)) {
                    continue;
                }
                // Skip files in folders that should be ignored
                if (shouldIgnorePath(fullPath, ignoreFolderPaths)) {
                    continue;
                }
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