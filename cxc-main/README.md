# Chrono X Chroma - Chrome Extension

A Chrome extension that color-codes posts on X.com (formerly Twitter) based on their age and highlights smart contract addresses, making it easy to see how recent each post is and identify blockchain addresses at a glance. Features a modern Vue 3 settings interface with dark mode support and customizable color options.

## Features

- **Multiple Color Modes**:
  - **Both**: Background color + border (default)
  - **Border Only**: Just colored borders
  - **Overlay**: Just background colors  
  - **Off**: Disable all color coding

- **Age-based Color Coding**:
  - 🟢 **Green**: Very Recent (< 5 minutes)
  - 🟡 **Yellow**: Recent (5 minutes - 1 hour)
  - 🟠 **Orange**: Moderate (1 - 6 hours)
  - 🔴 **Red**: Old (6 - 24 hours)
  - 🟣 **Purple**: Very Old (> 1 day)

- **Smart Contract Address Highlighting**:
  - 🔴 **Magenta**: Ethereum addresses (0x...)
  - 🔵 **Cyan**: Solana addresses (base58 format)
  - **Customizable modes**: Both, Border, Overlay, or Off
  - **Automatic detection**: Works with any text containing addresses

- **Interactive Features**:
  - **Collapsible legend** in the top-left corner (toggleable)
  - **Settings popup** with Vue 3 interface
  - **Dark/Light mode** support in settings
  - **Persistent settings** using Chrome storage
  - **Emergency CSS override** to disable all styling

- **Smart Detection**:
  - Automatic detection of new posts (works with infinite scroll)
  - Automatic detection of smart contract addresses in text
  - SPA navigation handling for single-page app behavior
  - Responsive design for mobile and desktop

## Installation

### Development Installation

1. **Prerequisites**
   - Node.js (version 16 or higher)
   - npm or pnpm package manager

2. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd chrono-x-chroma
   
   # Install dependencies
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

4. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top-right corner
   - Click "Load unpacked" and select the **root project folder**
   - The extension will now be active on X.com

### Quick Installation (Pre-built)

If you have a pre-built version:
1. Download the extension files
2. Open `chrome://extensions/` in Chrome
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder

## Usage

### Basic Usage
1. Visit [X.com](https://x.com) or [www.x.com](https://www.x.com)
2. Posts will automatically be color-coded based on their age
3. Smart contract addresses will be highlighted in the text
4. A legend appears in the top-left corner showing both color schemes
5. Click the "+" button to expand the legend, or "−" to collapse it

### Settings Configuration
1. Click the extension icon in your Chrome toolbar
2. A modern settings popup will open with options for:
   - **Color Mode**: Choose how posts are styled
   - **Show Legend**: Toggle the legend visibility
   - **Highlight Smart Contracts**: Enable/disable contract address highlighting
   - **Contract Highlight Mode**: Choose how contract addresses are styled
   - **Remove All CSS**: Emergency override to disable styling
   - **Dark/Light Mode**: Toggle popup theme
   - **Reset to Defaults**: Restore original settings

### Color Modes Explained
- **Both** (Default): Posts get both background color and colored border
- **Border Only**: Only adds colored borders to posts
- **Overlay**: Only adds background color overlay
- **Off**: Completely disables color coding

### Smart Contract Highlighting
The extension automatically detects and highlights:
- **Ethereum addresses**: `0x` followed by 40 hexadecimal characters
- **Solana addresses**: Base58 encoded strings (32-44 characters)

Addresses are highlighted with:
- **Magenta colors** for Ethereum addresses
- **Cyan colors** for Solana addresses
- **Customizable styling** (background, border, or both)

## How It Works

The extension uses several sophisticated mechanisms:

1. **Content Script**: Scans the page for posts with `data-testid="tweet"`
2. **Time Parsing**: Finds `<time datetime="...">` elements within each post
3. **Age Calculation**: Calculates post age based on datetime attributes
4. **Address Detection**: Uses regex patterns to find smart contract addresses
5. **Dynamic Styling**: Applies appropriate colors and effects
6. **Settings Sync**: Uses Chrome storage to persist user preferences
7. **SPA Handling**: Monitors for DOM changes to catch dynamically loaded content

## Project Structure

```
chrono-x-chroma/
├── manifest.json              # Extension configuration
├── content.js                 # Main content script logic
├── styles.css                 # Legend and styling
├── src/                       # Vue 3 popup source
│   ├── popup.html             # Popup HTML template
│   ├── popup.js               # Vue app entry point
│   ├── style.css              # Tailwind CSS imports
│   └── components/
│       ├── PopupApp.vue       # Main settings interface
│       ├── ColorModeToggle.vue # Color mode selector
│       ├── ToggleSwitch.vue   # Toggle components
│       └── icons/             # Icon components
├── dist/                      # Built popup files
├── icons/                     # Extension icons
├── scripts/build.sh           # Build script
└── package.json               # Dependencies
```

## Development

### Development Workflow
1. Make changes to source files
2. Run `npm run build` to rebuild
3. Reload extension in `chrome://extensions/`
4. Test changes on X.com

### Popup Development
For UI development, you can use Vite's dev server:
```bash
npm run dev
```
This starts a development server at `http://localhost:5173` for UI preview (Chrome APIs won't work in browser).

### Building for Distribution
```bash
npm run build:extension
# or
./scripts/build.sh
```
This creates a `build/` directory and `chrono-x-chroma-extension.zip` for distribution.

## Permissions

The extension requires minimal permissions:
- **activeTab**: To interact with X.com pages
- **storage**: To save user preferences
- **No data collection**: Everything processed locally
- **No external requests**: No tracking or analytics

## Browser Compatibility

- ✅ Chrome (Manifest V3)
- ✅ Edge (Chromium-based)
- ✅ Brave (Chromium-based)
- ✅ Other Chromium browsers

## Privacy & Security

This extension:
- **Local processing only**: All calculations done in your browser
- **No data collection**: Zero telemetry or user tracking  
- **No external requests**: No network calls to external servers
- **Content preservation**: Never modifies post content, only adds visual styling
- **Minimal scope**: Only works on X.com domains
- **Open source**: All code is transparent and auditable

## Troubleshooting

### Extension Not Working
- Ensure you're on x.com or www.x.com
- Try refreshing the page
- Check extension is enabled in `chrome://extensions/`
- Verify the build completed successfully

### No Color Coding Visible
- Check Color Mode setting in popup (might be set to "Off")
- Ensure posts have timestamps (some embedded posts may not work)
- Try different color modes (border/overlay/both)

### Smart Contract Addresses Not Highlighted
- Check "Highlight Smart Contracts" setting in popup
- Verify addresses are in correct format (0x... for Ethereum, base58 for Solana)
- Try different contract highlight modes

### Settings Not Saving
- Check Chrome storage permissions
- Try disabling/re-enabling the extension
- Clear extension data and reconfigure

### Legend Not Appearing
- Check "Show Legend" setting in popup
- Legend appears in top-left corner
- On mobile, position may be adjusted

### Build Issues
- Ensure Node.js 16+ is installed
- Delete `node_modules/` and `dist/`, then `npm install && npm run build`
- Check console for build errors

For more detailed troubleshooting, see [install_instructions.md](install_instructions.md).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on X.com
5. Submit a pull request

## License

This project is open source and available under the MIT License. 