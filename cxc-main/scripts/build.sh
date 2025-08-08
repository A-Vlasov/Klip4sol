#!/bin/bash

# Chrono X Chroma - Build Script
# Creates a minimal extension package for distribution

echo "🚀 Building Chrono X Chroma Extension..."

# Create build directory
rm -rf build
mkdir -p build

# Build the Vite project
echo "📦 Building Vite project..."
npm run build

# Copy essential extension files to build directory
echo "📂 Copying extension files..."

# Core extension files
cp manifest.json build/
cp content.js build/
cp styles.css build/

# Icons
cp -r icons build/

# Built popup files (from Vite)
cp -r dist build/

# Documentation
cp README.md build/
cp LICENSE build/

echo "🧹 Cleaning up build..."

# Remove development files from build
rm -rf build/dist/src/style.css.map 2>/dev/null || true

# Create extension package
echo "📦 Creating extension package..."
cd build
zip -r ../chrono-x-chroma-extension.zip . -x "*.DS_Store" "*.map"
cd ..

# Calculate file sizes
BUILD_SIZE=$(du -sh build | cut -f1)
ZIP_SIZE=$(du -sh chrono-x-chroma-extension.zip | cut -f1)

echo "✅ Build complete!"
echo "📊 Build directory: $BUILD_SIZE"
echo "📊 Extension package: $ZIP_SIZE"
echo "📁 Extension package: chrono-x-chroma-extension.zip"
echo ""
echo "🔧 To load the extension:"
echo "1. Open Chrome and go to chrome://extensions/"
echo "2. Enable Developer mode"
echo "3. Click 'Load unpacked' and select the 'build' directory"
echo ""
echo "📤 To distribute:"
echo "Use the chrono-x-chroma-extension.zip file" 