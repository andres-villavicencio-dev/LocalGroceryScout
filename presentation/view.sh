#!/bin/bash

# Local Grocery Scout Presentation Viewer
# Simple script to serve the presentation locally

PORT=8000

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║        Local Grocery Scout - Presentation Deck                ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Starting local server on port $PORT..."
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "✓ Using Python 3 HTTP server"
    echo ""
    echo "🌐 Open in your browser:"
    echo "   → http://localhost:$PORT"
    echo ""
    echo "📋 Keyboard shortcuts:"
    echo "   → Arrow keys: Navigate"
    echo "   → ESC: Overview mode"
    echo "   → F: Fullscreen"
    echo "   → S: Speaker notes"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    echo "✓ Using Python 2 HTTP server"
    echo ""
    echo "🌐 Open in your browser:"
    echo "   → http://localhost:$PORT"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python -m SimpleHTTPServer $PORT
else
    echo "❌ Error: Python not found"
    echo ""
    echo "Please install Python or open index.html directly in your browser:"
    echo "   open index.html"
    echo ""
    exit 1
fi
