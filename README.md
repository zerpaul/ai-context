# AI Context Extractor

A VSCode extension that generates AI-readable context from your folders. This extension extracts the contents and structure of your folders into a well-formatted text file that's optimized for use with AI systems like ChatGPT, Claude, or other LLMs.

## Features

- 📁 Extracts complete folder structure and contents with a single click
- 🗺️ Creates a clear hierarchy of your project's directory structure
- 📝 Includes full file contents with clear separation and metadata
- 🎯 Optimized output format for AI context windows
- ⚡ Fast processing with progress indication
- 🚫 Automatically skips node_modules and hidden directories

## Usage

1. Right-click on any folder in the VSCode explorer
2. Select "Extract AI Context" from the context menu
3. Wait for the extraction to complete
4. A new file will be created in the selected folder with the format: `foldername_timestamp.txt`

## Output Format

The generated file includes:

### Project Metadata
```
PROJECT METADATA
===============
Project Root: /path/to/your/folder
Scan Date: 2024-12-26T16:38:43.675Z
Total Files: 42
```

### Directory Structure
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

### File Contents
```
FILE CONTENTS
=============
================================================================================
Absolute Path: /path/to/your/folder/main.cpp
Relative Path: main.cpp
================================================================================

[File contents here]
```

## Installation

1. Install from VSCode Marketplace
2. OR download the .vsix file and install manually:
   ```bash
   code --install-extension aicontext-0.0.1.vsix
   ```

## Requirements

- VSCode 1.96.0 or higher

## Extension Settings

No additional settings required.

## Known Issues

- None reported yet

## Release Notes

### 0.0.1

Initial release:
- Basic folder content extraction
- Directory structure visualization
- Full file content inclusion
- Progress indication during extraction
- Node modules and hidden directory exclusion

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This extension is licensed under the MIT License.

---

**Enjoy!** 🚀