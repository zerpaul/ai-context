import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';

export function activate(context: vscode.ExtensionContext) {
    console.log('AI Context Extractor is now active');

    const disposable = vscode.commands.registerCommand('aicontext.extractFolder', async (uri: vscode.Uri) => {
        try {
            if (!uri) {
                vscode.window.showErrorMessage('Please select a file or folder to extract context from');
                return;
            }

            const stats = await fs.stat(uri.fsPath);

            // Handle folder case
            if (stats.isDirectory()) {
                const folderPath = uri.fsPath;
                const folderName = path.basename(folderPath);
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const outputFileName = `${folderName}_${timestamp}.txt`;
                const outputPath = path.join(folderPath, outputFileName);

                await processFolderContent(folderPath, outputPath);
                await showSuccessMessage(outputFileName, outputPath);
                return;
            }

            // Handle file case(s)
            const selectedFiles = getSelectedFiles(uri);
            const folderPath = path.dirname(uri.fsPath);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const outputFileName = selectedFiles.length > 1 ? 
                `selected_files_${timestamp}.txt` : 
                `single_file_${timestamp}.txt`;
            const outputPath = path.join(folderPath, outputFileName);

            await processFiles(selectedFiles, outputPath, folderPath);
            await showSuccessMessage(outputFileName, outputPath);

        } catch (error) {
            vscode.window.showErrorMessage(`Error extracting context: ${error}`);
        }
    });

    context.subscriptions.push(disposable);
}

function getSelectedFiles(clickedUri: vscode.Uri): vscode.Uri[] {
    const selectedFiles: vscode.Uri[] = [];
    
    // Get all selected files from the explorer
    if (vscode.window.activeTextEditor) {
        const selections = vscode.window.visibleTextEditors
            .filter(editor => editor.selection)
            .map(editor => editor.document.uri);
        selectedFiles.push(...selections);
    }

    // Get files from workspace selection
    const workspaceSelected = vscode.workspace.textDocuments
        .filter(doc => doc.uri.scheme === 'file' && doc.isDirty === false)
        .map(doc => doc.uri);
    selectedFiles.push(...workspaceSelected);

    // Always include the file that was right-clicked
    if (!selectedFiles.some(uri => uri.fsPath === clickedUri.fsPath)) {
        selectedFiles.push(clickedUri);
    }

    // Remove duplicates
    return Array.from(new Set(selectedFiles.map(uri => uri.fsPath)))
        .map(fsPath => vscode.Uri.file(fsPath));
}

async function processFiles(files: vscode.Uri[], outputPath: string, rootPath: string): Promise<void> {
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Extracting file context...",
        cancellable: true
    }, async (progress) => {
        let output = 'FILE EXTRACTION\n===============\n';
        output += `Root Path: ${rootPath}\n`;
        output += `Scan Date: ${new Date().toISOString()}\n`;
        output += `Total Files: ${files.length}\n\n`;

        output += 'SELECTED FILES\n==============\n';
        files.forEach(file => {
            output += `${path.relative(rootPath, file.fsPath)}\n`;
        });
        output += '\n';

        output += 'FILE CONTENTS\n=============\n\n';

        let processedFiles = 0;
        for (const file of files) {
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
                    message: `Processing files... (${processedFiles}/${files.length})`,
                    increment: (100 / files.length)
                });
            } catch (error) {
                output += `Error reading file ${file.fsPath}: ${error}\n\n`;
            }
        }

        await fs.writeFile(outputPath, output, 'utf8');
    });
}

async function processFolderContent(folderPath: string, outputPath: string): Promise<void> {
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

        await fs.writeFile(outputPath, output, 'utf8');
    });
}

async function showSuccessMessage(outputFileName: string, outputPath: string): Promise<void> {
    const action = await vscode.window.showInformationMessage(
        `Successfully extracted context to ${outputFileName}`,
        'Open File'
    );

    if (action === 'Open File') {
        const doc = await vscode.workspace.openTextDocument(outputPath);
        await vscode.window.showTextDocument(doc);
    }
}

async function getAllFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    
    async function traverse(currentPath: string) {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);
            
            // Skip node_modules and .git directories
            if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                await traverse(fullPath);
            } else if (entry.isFile()) {
                // You can add file extension filtering here if needed
                files.push(fullPath);
            }
        }
    }

    await traverse(dirPath);
    return files;
}

export function deactivate() {}