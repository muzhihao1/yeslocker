#!/bin/bash

# Start Mock Storage API Server for Terminal A Support

echo "🚀 Starting Mock Storage API Server..."
echo "📍 Server will run on port 8081"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js first:"
    echo "brew install node"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules/express" ] || [ ! -d "node_modules/cors" ]; then
    echo "📦 Installing dependencies..."
    npm install express cors
fi

echo "✅ Mock server starting..."
echo ""
echo "📌 Available endpoints:"
echo "   POST http://localhost:8081/wx/locker/request/create"
echo "   GET  http://localhost:8081/wx/locker/available"
echo "   GET  http://localhost:8081/wx/storage/request/:id"
echo "   POST http://localhost:8081/wx/storage/confirm-key-return"
echo ""
echo "📖 See docs/api/storage-request-mock-guide.md for details"
echo ""
echo "Press Ctrl+C to stop the server"
echo "----------------------------------------"

# Start the mock server
node mock-storage-api.js