import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';

export function activate(context: vscode.ExtensionContext) {
    console.log('AI Context Extractor is now active');

    const disposable = vscode.commands.registerCommand('aicontext.extractFolder', async (uri: vscode.Uri) => {
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
                    } catch (error) {
                        output += `Error reading file ${file}: ${error}\n\n`;
                    }
                }

                // Write the output file
                await fs.writeFile(outputPath, output, 'utf8');
            });

            // Show success message with option to open the file
            const action = await vscode.window.showInformationMessage(
                `Successfully extracted context to ${outputFileName}`,
                'Open File'
            );

            if (action === 'Open File') {
                const doc = await vscode.workspace.openTextDocument(outputPath);
                await vscode.window.showTextDocument(doc);
            }

        } catch (error) {
            vscode.window.showErrorMessage(`Error extracting folder context: ${error}`);
        }
    });

    context.subscriptions.push(disposable);
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