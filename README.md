# Portfolio Terminal

An interactive portfolio website built with HTML, CSS, and JavaScript that simulates a Linux-style terminal experience.

## Overview

This project presents a personal portfolio as a command-line interface. Users navigate the site using terminal commands like `ls`, `cd`, and `cat` to explore sections such as about, experiences, skills, and projects.

## Features

- Linux-style terminal UI
- Animated boot screen landing page
- Directory navigation with `cd`, `ls`, and `pwd`
- File viewing with `cat` for text content
- PDF opening support for resume/CV files
- Autocomplete support for commands and file/directory names
- Responsive design for modern screens

## Project Structure

- `index.html` — boot screen landing page
- `terminal.html` — terminal interface page
- `css/style.css` — boot screen styling
- `css/terminal.css` — terminal page styling
- `js/boot.js` — boot animation and navigation logic
- `js/terminal.js` — terminal command handling and file system logic
- `assets/` — content files for about, experiences, projects, and skills

## Usage

1. Open `index.html` in a browser.
2. Wait for the boot animation to complete.
3. Press Enter or click to continue to `terminal.html`.
4. Enter commands like:
   - `ls`
   - `cd about`
   - `cat presentation.txt`
   - `pwd`
   - `clear`

## Commands

- `ls` — list current files and folders
- `cd [folder]` — change directory
- `cd ..` — move up one directory
- `cat [file]` — display file content or open PDF
- `pwd` — print current directory
- `clear` — clear terminal output and show help again

## Customization

Update the `filesystem` and `fileContent` objects in `js/terminal.js` to add or modify files and folders.

## Notes

- The portfolio is built with plain web technologies and works locally without a backend.
- Use a modern browser for the best experience.
