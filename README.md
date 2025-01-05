# AI Context Extractor

A VSCode extension that generates AI-readable context from your folders and files.

## Features

- 📁 Extract complete folder structure and contents with a single click
- 📄 Extract single files or multiple selected files
- ✂️ **Optionally skip .txt file creation** and just copy extracted content to the clipboard (see settings below)

## Extension Settings

- **`aicontext.createTxtFileByDefault`**  
  - **Default:** `false`  
  - If `true`, a `.txt` file is created by default (in addition to copying to clipboard).  
  - If `false`, the content is copied to the clipboard only.

## Release Notes

### 0.0.9
- **New setting**: `aicontext.createTxtFileByDefault`
  - When enabled (`true`), `.txt` files are created by default for folder/file extracts  
  - When disabled (`false`, default), only the clipboard is updated
