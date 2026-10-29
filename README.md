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
- `assets/manifest.json` — auto-generated index of `assets/` (do not edit by hand)
- `scripts/build-manifest.js` — generates `assets/manifest.json` from the `assets/` folder

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

## Adding content

The terminal's file system mirrors the `assets/` folder: each sub-folder becomes a directory and each `.txt` / `.pdf` file becomes a file you can `cat`.

1. Drop a new file in the right folder, e.g. `assets/projects/my_new_project.txt` (or create a new folder like `assets/certifications/`).
2. Regenerate the index:
   ```bash
   node scripts/build-manifest.js
   ```
3. Commit and push. On Vercel the index is also regenerated automatically at each deployment (`vercel.json`).

Rules:
- Only `.txt` and `.pdf` files are shown (images and other files are ignored).
- French translation: put `my_file.fr.txt` next to `my_file.txt`. It is not listed separately; the terminal shows it when the language is French (`lang fr` or the FR button). Without a `.fr.txt`, the English file is shown.
- SEO: `scripts/build-seo.js` (run at each Vercel deployment) rebuilds the hidden summary for search engines in `index.html` / `terminal.html` (experiences, projects, skills, from the English `.txt` files) and `sitemap.xml`. Don't edit the part between the `AUTO-GENERATED` markers by hand.
- Files and folders starting with `_` are hidden from `ls` but stay reachable by URL — useful for attachments linked from a `.txt` (e.g. `assets/experiences/_reports/`).
- `.txt` files can contain HTML (`<span class="...">`, `<a href="...">`) for colors and links.

To preview locally, run `npm run dev` (regenerates the index and starts a local server), since `fetch` does not work when opening the HTML file directly from disk.

## Notes

- The portfolio is built with plain web technologies and needs no backend; a static file server is enough.
- Use a modern browser for the best experience.