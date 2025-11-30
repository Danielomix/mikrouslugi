#!/bin/bash

echo "Starting Notification Service..."
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the service
echo "Notification Service starting on port 3006..."
npm start