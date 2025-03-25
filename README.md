# AI Context Extractor
A VSCode extension that generates AI-readable context from your folders and files.

## Features
- 📁 Extract complete folder structure and contents with a single click
- 📂 **Extract multiple folders** by ctrl-clicking them in the explorer
- 📄 Extract single files or multiple selected files
- 🔄 **Combine files and folders** in a single extraction when ctrl-clicking both
- ✂️ **Optionally skip .txt file creation** and just copy extracted content to the clipboard (see settings below)
- 🔍 **Filter unwanted content** by ignoring specific file extensions, folders, or files
- 📊 **Optimized output format** with directory structures always at the top for easy navigation

## Extension Settings
- **`aicontext.createTxtFileByDefault`**  
  - **Default:** `false`  
  - If `true`, a `.txt` file is created by default (in addition to copying to clipboard).  
  - If `false`, the content is copied to the clipboard only.

- **`aicontext.ignoreFileExtensions`**
  - **Default:** `[".pyc", ".map"]`
  - List of file extensions to ignore when extracting context.
  - Example: `[".pyc", ".js", ".map"]` will ignore all Python cache files, JavaScript files, and source map files (even .js.map).

- **`aicontext.ignoreFolderPaths`**
  - **Default:** `["__pycache__", "node_modules", ".git"]`
  - List of partial folder paths to ignore when extracting context.
  - The extension will ignore any folder whose path contains any of these strings.
  - Example: `["node_modules", "__pycache__", "dist"]` will ignore node_modules folders, Python cache folders, and distribution folders.
  - For more specific targeting, use longer path segments like `"test_project/node_modules"`.

- **`aicontext.ignoreFiles`**
  - **Default:** `[]` (empty list)
  - List of specific files to ignore when extracting context.
  - Example: `["package.json", "package-lock.json", ".env"]` will ignore package files and environment variables.

## Usage
1. Right-click on a folder or file in the Explorer
2. Or ctrl-click to select multiple items (can be any combination of files and folders)
3. Select "Extract AI Context"
4. The context will be copied to your clipboard (and optionally saved as a .txt file)

## Output Structure
- For any extraction, directory structures are always displayed at the top
- File contents follow after all directory structures
- For multiple folders, each folder's structure is shown separately
- When extracting mixed content (folders and files), all structures are grouped together, followed by all contents