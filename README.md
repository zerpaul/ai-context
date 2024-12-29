# AI Context Extractor

A VSCode extension that generates AI-readable context from your folders and files. This extension extracts the contents and structure of your folders or selected files into a well-formatted text file that's optimized for use with AI systems like ChatGPT, Claude, or other LLMs.

## Features

- 📁 Extract complete folder structure and contents with a single click
- 📄 Extract single files or multiple selected files
- 🗺️ Creates a clear hierarchy of your project's directory structure (for folder extracts)
- 📝 Includes full file contents with clear separation and metadata
- 🎯 Optimized output format for AI context windows
- ⚡ Fast processing with progress indication
- 🚫 Automatically skips node_modules and hidden directories when processing folders

## Usage

### Folder Extraction
1. Right-click on any folder in the VSCode explorer
2. Select "Extract AI Context" from the context menu
3. Wait for the extraction to complete
4. A new file will be created in the selected folder with the format: `foldername_timestamp.txt`

### File Extraction
1. Right-click on any single file to extract just that file
   - OR select multiple files using Ctrl+Click
2. Select "Extract AI Context" from the context menu
3. Wait for the extraction to complete
4. A new file will be created in the same directory with the format:
   - Single file: `single_file_timestamp.txt`
   - Multiple files: `selected_files_timestamp.txt`

## Output Format

The generated file includes different sections based on what you're extracting:

### For Folders

#### Project Metadata
```
PROJECT METADATA
===============
Project Root: /path/to/your/folder
Scan Date: 2024-12-26T16:38:43.675Z
Total Files: 42
```

#### Directory Structure
```
DIRECTORY STRUCTURE
==================
/
  └── main.cpp
  └── utils.h
/src/
  └── components.ts
  └── helpers.ts
```

#### File Contents
```
FILE CONTENTS
=============
================================================================================
Absolute Path: /path/to/your/folder/main.cpp
Relative Path: main.cpp
================================================================================

[File contents here]
```

### For Single/Multiple Files

#### File Extraction Metadata
```
FILE EXTRACTION
===============
Root Path: /path/to/your/folder
Scan Date: 2024-12-26T16:38:43.675Z
Total Files: 3

SELECTED FILES
==============
src/main.ts
src/utils.ts
src/types.ts
```

#### File Contents
```
FILE CONTENTS
=============
================================================================================
Absolute Path: /path/to/your/folder/src/main.ts
Relative Path: src/main.ts
================================================================================

[File contents here]
```

## Installation

1. Install from VSCode Marketplace
2. OR download the .vsix file and install manually:
   ```bash
   code --install-extension aicontext-0.0.3.vsix
   ```

## Requirements

- VSCode 1.96.0 or higher

## Extension Settings

No additional settings required.

## Known Issues

- None reported yet

## Release Notes

### 0.0.3
- Added support for single file extraction
- Added support for multiple file selection and extraction
- Improved output formatting for different extraction types
- Maintained all existing folder extraction functionality

### 0.0.2
- Added progress indication during extraction
- Added automatic node_modules and hidden directory exclusion

### 0.0.1
- Initial release with basic folder extraction functionality
- Directory structure visualization
- Full file content inclusion

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Enjoy!** 🚀