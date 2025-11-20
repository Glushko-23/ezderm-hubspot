# SCSS Compilation Setup

This project includes a setup for compiling SCSS files to CSS using `sass` and watching for changes with `chokidar`.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository or download the project files.
2. Run the following command to install dependencies:

   ```bash
   npm install
   ```

## Project Structure

- **scss/**: Source folder for SCSS files.
- **css/**: Output folder for compiled CSS files.
- **compile-scss.js**: Script for compiling and watching SCSS files.

## Usage

### Compile SCSS Files

To compile all SCSS files in the `scss/` folder and watch for changes, run:

```bash
  npm run sass:watch
```

```bash
  npm run sass:build
```

This command:
- Compiles all `.scss` files in the `scss/` folder to corresponding `.css` files in the `css/` folder.
- Watches for changes to `.scss` files and recompiles only the modified files.

### How It Works

- The script uses `sass` to compile SCSS files with the `expanded` style output.
- `chokidar` monitors the `scss/` folder for changes or new `.scss` files.
- Compiled CSS files maintain the same folder structure as the source SCSS files.
- Errors during compilation are logged to the console.

## Dependencies

- **sass**: SCSS compiler.
- **chokidar**: File watcher for incremental compilation.
- **nodemon** (dev): Watches the compilation script for changes.

## Scripts

- `npm run sass:watch`: Compiles SCSS files and watches for changes.

## Notes

- Ensure the `scss/` and `css/` folders exist in the project root.
- The script preserves HubL variables during compilation.
- Compilation errors are logged with detailed messages.
- HubSpot Variables in SCSS: To use HubSpot variables (e.g., theme variables), wrap them in string.unquote() to prevent compilation issues. 

Example:
  
``` scss
@use "sass:string";

.selector {
    background-color: string.unquote("{{ theme.global_colors.accent.color }}");
}
```

- Special CSS Files:
  - `ezderm/css/main.css`, 
  - `ezderm/css/sections.css`, 
  - `ezderm/css/theme-overrides.css`, 
  - `ezderm/css/tools/_macros.css`, 
  - `ezderm/css/generic/*.css`, 
  - `ezderm/css/objects/*.css` 
  
  operate independently and may include HubSpot-specific conditions, imports, and variables. Changes to these files should be made directly in their respective `.css` files, as they are not generated from SCSS sources.