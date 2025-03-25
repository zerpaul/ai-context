import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';

export function activate(context: vscode.ExtensionContext) {
    console.log('AI Context Extractor is now active');

    const disposable = vscode.commands.registerCommand('aicontext.extractFolder', async (uri: vscode.Uri, selectedUris?: vscode.Uri[]) => {
        try {
            if (!uri) {
                vscode.window.showErrorMessage('Please select a file or folder to extract context from');
                return;
            }

            // Read user setting for whether or not to create a .txt file
            const config = vscode.workspace.getConfiguration('aicontext');
            const createTxtByDefault = config.get<boolean>('createTxtFileByDefault') === true;

            // Determine if we have multiple items selected
            const allItems = selectedUris || [uri];
            
            // Check if we have multiple items (files and/or folders)
            if (allItems.length > 1) {
                // Separate folders and files
                const folders: vscode.Uri[] = [];
                const files: vscode.Uri[] = [];
                
                for (const item of allItems) {
                    const stats = await fs.stat(item.fsPath);
                    if (stats.isDirectory()) {
                        folders.push(item);
                    } else {
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
                    } else {
                        await showClipboardOnlyMessage();
                    }
                    return;
                } else {
                    // Only multiple files, no folders
                    const folderPath = path.dirname(files[0].fsPath);
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const outputFileName = `selected_files_${timestamp}.txt`;
                    const outputPath = path.join(folderPath, outputFileName);
                    
                    await processFiles(files, outputPath, folderPath, createTxtByDefault);
                    
                    if (createTxtByDefault) {
                        await showFileCreationMessage(outputFileName, outputPath);
                    } else {
                        await showClipboardOnlyMessage();
                    }
                    return;
                }
            }
            
            // Handle single item (file or folder)
            const stats = await fs.stat(uri.fsPath);

            // Handle folder case
            if (stats.isDirectory()) {
                const folderPath = uri.fsPath;
                const folderName = path.basename(folderPath);
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const outputFileName = `${folderName}_${timestamp}.txt`;
                const outputPath = path.join(folderPath, outputFileName);

                await processFolderContent(folderPath, outputPath, createTxtByDefault);
                if (createTxtByDefault) {
                    await showFileCreationMessage(outputFileName, outputPath);
                } else {
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
            } else {
                await showClipboardOnlyMessage();
            }

        } catch (error) {
            vscode.window.showErrorMessage(`Error extracting context: ${error}`);
        }
    });

    context.subscriptions.push(disposable);
}

// New function to process multiple items (folders and files)
async function processMultipleItems(
    folders: vscode.Uri[],
    files: vscode.Uri[],
    outputPath: string,
    rootPath: string,
    createTxtByDefault: boolean
): Promise<void> {
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Extracting multiple items...",
        cancellable: true
    }, async (progress) => {
        // Get configuration settings
        const config = vscode.workspace.getConfiguration('aicontext');
        const ignoreFileExtensions = config.get<string[]>('ignoreFileExtensions') || [];
        const ignoreFolderPaths = config.get<string[]>('ignoreFolderPaths') || [];
        const ignoreFiles = config.get<string[]>('ignoreFiles') || [];
        
        let output = 'MULTIPLE ITEMS EXTRACTION\n=======================\n';
        output += `Root Path: ${rootPath}\n`;
        output += `Scan Date: ${new Date().toISOString()}\n`;
        
        // Collect all files from all folders and individual files
        const allFiles: { path: string, relativePath: string }[] = [];
        const directoryStructure = new Map<string, string[]>();
        
        // Process folders
        let processedFolders = 0;
        for (const folder of folders) {
            const folderPath = folder.fsPath;
            const folderName = path.basename(folderPath);
            
            // Skip folders that match any of the ignoreFolderPaths
            const relativeFolderPath = path.relative(rootPath, folderPath);
            const shouldSkipEntireFolder = ignoreFolderPaths.some(ignorePath => 
                relativeFolderPath.includes(ignorePath)
            );
            
            if (shouldSkipEntireFolder) {
                processedFolders++;
                continue;
            }
            
            progress.report({ 
                message: `Processing folder ${folderName}... (${processedFolders + 1}/${folders.length})`,
                increment: folders.length > 0 ? (40 / folders.length) : 0
            });
            
            const folderFiles = await getAllFiles(folderPath);
            
            // Build directory structure
            for (const file of folderFiles) {
                const relDir = path.relative(folderPath, path.dirname(file));
                const fileName = path.basename(file);
                const structureKey = path.join(folderName, relDir);
                
                if (!directoryStructure.has(structureKey)) {
                    directoryStructure.set(structureKey, []);
                }
                directoryStructure.get(structureKey)?.push(fileName);
                
                allFiles.push({
                    path: file,
                    relativePath: path.join(folderName, path.relative(folderPath, file))
                });
            }
            
            processedFolders++;
        }
        
        // Process individual files
        const filteredFiles = files.filter(file => {
            const filePath = file.fsPath;
            const relativePath = path.relative(rootPath, filePath);
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
            // More comprehensive check for folder paths
            if (ignoreFolderPaths.some(folderPath => {
                const pathParts = relativePath.split(path.sep);
                
                // Check if any folder in the path matches the ignore pattern
                return pathParts.some(part => part === folderPath) || 
                       relativePath.includes(folderPath);
            })) {
                return false;
            }
            
            return true;
        });
        
        // Add individual files to structure
        for (const file of filteredFiles) {
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
        
        output += `Total Files: ${allFiles.length}\n\n`;
        
        // Add selected items section
        output += 'SELECTED ITEMS\n==============\n';
        folders.forEach(folder => {
            output += `${path.relative(rootPath, folder.fsPath)} (folder)\n`;
        });
        filteredFiles.forEach(file => {
            output += `${path.relative(rootPath, file.fsPath)}\n`;
        });
        output += '\n';
        
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
            } catch (error) {
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

function getSelectedFiles(clickedUri: vscode.Uri): vscode.Uri[] {
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

async function processFiles(
    files: vscode.Uri[],
    outputPath: string,
    rootPath: string,
    createTxtByDefault: boolean
): Promise<void> {
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Extracting file context...",
        cancellable: true
    }, async (progress) => {
        // Get configuration settings
        const config = vscode.workspace.getConfiguration('aicontext');
        const ignoreFileExtensions = config.get<string[]>('ignoreFileExtensions') || [];
        const ignoreFolderPaths = config.get<string[]>('ignoreFolderPaths') || [];
        const ignoreFiles = config.get<string[]>('ignoreFiles') || [];
        
        // Filter files based on ignore settings
        const filteredFiles = files.filter(file => {
            const filePath = file.fsPath;
            const relativePath = path.relative(rootPath, filePath);
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
            // More comprehensive check for folder paths
            if (ignoreFolderPaths.some(folderPath => {
                const pathParts = relativePath.split(path.sep);
                
                // Check if any folder in the path matches the ignore pattern
                return pathParts.some(part => part === folderPath) || 
                       relativePath.includes(folderPath);
            })) {
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
        const structure = new Map<string, string[]>();
        
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
            } catch (error) {
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

async function processFolderContent(folderPath: string, outputPath: string, createTxtByDefault: boolean): Promise<void> {
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Extracting folder context...",
        cancellable: true
    }, async (progress) => {
        let output = 'PROJECT METADATA\n===============\n';
        output += `Project Root: ${folderPath}\n`;
        output += `Scan Date: ${new Date().toISOString()}\n`;

        const files = await getAllFiles(folderPath);
        output += `Total Files: ${files.length}\n\n`;

        progress.report({ message: "Building directory structure..." });

        // Directory structure section at the top as requested
        output += 'DIRECTORY STRUCTURE\n==================\n';
        const structure = new Map<string, string[]>();

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
            } catch (error) {
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

async function showFileCreationMessage(outputFileName: string, outputPath: string): Promise<void> {
    const action = await vscode.window.showInformationMessage(
        `Successfully extracted context to ${outputFileName} (and copied to clipboard)`,
        'Open File'
    );

    if (action === 'Open File') {
        const doc = await vscode.workspace.openTextDocument(outputPath);
        await vscode.window.showTextDocument(doc);
    }
}

async function showClipboardOnlyMessage(): Promise<void> {
    await vscode.window.showInformationMessage(
        'Context copied to clipboard'
    );
}

async function getAllFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    
    // Get configuration settings
    const config = vscode.workspace.getConfiguration('aicontext');
    const ignoreFileExtensions = config.get<string[]>('ignoreFileExtensions') || [];
    const ignoreFolderPaths = config.get<string[]>('ignoreFolderPaths') || [];
    const ignoreFiles = config.get<string[]>('ignoreFiles') || [];

    async function traverse(currentPath: string) {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);
            const relativePath = path.relative(dirPath, fullPath);

            if (entry.isDirectory()) {
                // Skip hidden directories by default
                if (entry.name.startsWith('.')) {
                    continue;
                }
                
                // More strict check for folder paths to ignore
                const shouldSkip = ignoreFolderPaths.some(folderPath => {
                    // If the folder name itself matches exactly
                    if (entry.name === folderPath) {
                        return true;
                    }
                    
                    // If any part of the relative path contains the ignore string
                    return relativePath.includes(folderPath);
                });
                
                if (!shouldSkip) {
                    await traverse(fullPath);
                }
            } else if (entry.isFile()) {
                // Skip files that match any of the ignoreFiles
                if (ignoreFiles.some(file => entry.name === file)) {
                    continue;
                }
                
                // Skip files with extensions in ignoreFileExtensions
                const fileExt = path.extname(entry.name);
                if (ignoreFileExtensions.includes(fileExt)) {
                    continue;
                }
                
                // Double-check if the file is in a path that should be ignored
                const shouldSkipFile = ignoreFolderPaths.some(folderPath => 
                    relativePath.includes(folderPath)
                );
                
                if (!shouldSkipFile) {
                    files.push(fullPath);
                }
            }
        }
    }

    await traverse(dirPath);
    return files;
}

export function deactivate() {}