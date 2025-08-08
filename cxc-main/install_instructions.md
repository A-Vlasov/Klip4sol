# Installation Instructions

## Development Setup (Vue 3 + Vite)

1. **Prerequisites**
   - Node.js (version 16 or higher)
   - npm or pnpm package manager

2. **Install Dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Build the Extension**
   ```bash
   npm run build
   # or
   pnpm run build
   ```
   This will create a `dist/` folder with the compiled Vue 3 popup files.

4. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Type `chrome://extensions/` in the address bar and press Enter
   - OR click the three dots menu → More tools → Extensions

5. **Enable Developer Mode**
   - In the top-right corner, toggle "Developer mode" ON
   - You should see additional buttons appear

6. **Load the Extension**
   - Click "Load unpacked" button
   - Select the **root project folder** (not the dist folder)
   - The extension should now appear in your extensions list

7. **Test the Extension**
   - Go to [x.com](https://x.com) or [www.x.com](https://www.x.com)
   - You should see posts color-coded based on their age
   - A legend should appear in the top-left corner
   - Click the extension icon to open the Vue 3 settings popup

## Quick Setup (Pre-built Version)

If you have a pre-built version without source code:

1. **Download the Extension**
   - Download all the files to your computer
   - Keep them together in a single folder (e.g., `chrono-x-chroma`)

2. **Load in Chrome**
   - Follow steps 4-7 from the Development Setup above

## Development Workflow

### Making Changes to the Settings Popup
1. Edit files in the `src/` directory:
   - `src/components/PopupApp.vue` - Main settings interface
   - `src/components/ToggleSwitch.vue` - Toggle switch component
   - `src/style.css` - Tailwind CSS imports

2. Rebuild the extension:
   ```bash
   npm run build
   ```

3. Reload the extension in Chrome:
   - Go to `chrome://extensions/`
   - Click the refresh icon on your extension
   - Test your changes

### Development Mode
For faster development, you can use Vite's dev server:
```bash
npm run dev
```
This will start a development server at `http://localhost:5173` where you can preview the popup interface.

**Note:** The dev server is for UI development only. Chrome extension APIs won't work in the browser preview.

## Creating Icons (Optional)

The extension will work without icons, but if you want custom icons:

1. Open `create_icons.html` in your browser
2. Follow the instructions to create 16x16, 48x48, and 128x128 pixel PNG files
3. Name them `icon16.png`, `icon48.png`, and `icon128.png`
4. Place them in the same folder as the other extension files

## Troubleshooting

### Build Issues
- Make sure Node.js is installed (version 16+)
- Delete `node_modules/` and `dist/` folders, then run `npm install` and `npm run build`
- Check for any error messages during the build process

### Extension Not Working
- Make sure you're on x.com (not other social media sites)
- Try refreshing the page
- Check that the extension is enabled in `chrome://extensions/`
- Ensure you've run `npm run build` before loading the extension

### No Color Coding Visible
- The extension only works on X.com/Twitter posts
- Make sure posts have timestamps (some embedded posts might not work)
- Try scrolling down to load more posts

### Legend Not Showing
- The legend appears in the top-left corner
- On mobile/narrow screens, it might be positioned differently
- Try refreshing the page

### Settings Popup Not Opening
- Make sure the extension built successfully (`dist/` folder exists)
- Check that `dist/popup.html` and `dist/popup.js` files were created
- Try reloading the extension in `chrome://extensions/`

### Console Errors
- Press F12 to open Developer Tools
- Check the Console tab for any error messages
- Look for messages starting with "Chrono X Chroma"
- For Vue-related errors, check both the extension popup console and the page console

## Uninstalling

1. Go to `chrome://extensions/`
2. Find "Chrono X Chroma" in the list
3. Click "Remove" button
4. Confirm removal

## File Structure

### Development Version
Your extension folder should contain:
```
chrono-x-chroma/
├── manifest.json              # Extension configuration
├── content.js                 # Content script for X.com
├── styles.css                 # Content script styles
├── package.json               # Node.js dependencies
├── vite.config.js             # Vite build configuration
├── src/                       # Vue 3 source files
│   ├── popup.html             # Popup HTML template
│   ├── popup.js               # Vue 3 app entry point
│   ├── style.css              # Tailwind CSS imports
│   └── components/
│       ├── PopupApp.vue       # Main popup component
│       └── ToggleSwitch.vue   # Toggle switch component
├── dist/                      # Built files (created after npm run build)
│   ├── popup.html             # Compiled popup HTML
│   ├── popup.js               # Compiled popup JavaScript
│   └── popup.css              # Compiled Tailwind CSS
├── node_modules/              # Dependencies (auto-generated)
├── README.md
├── install_instructions.md
├── create_icons.html
├── icon16.png (optional)
├── icon48.png (optional)
└── icon128.png (optional)
```

### Pre-built Version
```
chrono-x-chroma/
├── manifest.json
├── content.js
├── styles.css
├── popup.html                 # Pre-built popup
├── popup.js                   # Pre-built popup script
├── popup.css                  # Pre-built popup styles
├── README.md
├── install_instructions.md
├── create_icons.html
├── icon16.png (optional)
├── icon48.png (optional)
└── icon128.png (optional)
```

## Security Note

This extension:
- Only works on X.com domains
- Does not collect or send any data
- Does not modify post content
- Only adds visual styling to help you see post ages 