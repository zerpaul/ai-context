# Change Log

All notable changes to the "aicontext" extension will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [0.0.9] - 2025-01-05

### Added
- **New user setting**: `aicontext.createTxtFileByDefault`
  - If `true`, a `.txt` file is always generated when extracting context
  - If `false`, no `.txt` file is generated; content is only copied to clipboard (default)
- Updated documentation (README) to explain new setting

## [0.0.3] - 2024-12-29

### Added
- Support for single file extraction via right-click menu
- Support for multiple file selection and extraction using Ctrl+Click
- New output formats optimized for single and multiple file extractions
- Separate metadata sections for file-based extractions
- Updated command registration to handle both files and folders

### Changed
- Improved progress indication to show file-specific progress
- Refined output file naming convention for different extraction types:
  - `foldername_timestamp.txt` for folders
  - `single_file_timestamp.txt` for single files
  - `selected_files_timestamp.txt` for multiple files
- Updated documentation to reflect new functionality

## [0.0.2] - 2024-12-26

### Added
- Progress indication during extraction process
- Skip functionality for node_modules directory
- Skip functionality for hidden directories and files

### Changed
- Improved error handling and messaging
- Enhanced extraction performance

## [0.0.1] - 2024-12-24

### Added
- Initial release of AI Context Extractor
- Basic folder content extraction functionality
- Directory structure visualization
- Full file content inclusion in output
- Basic error handling
- Output file generation with timestamp