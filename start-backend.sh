#!/bin/bash

# YesLocker Backend Startup Script
# This script starts the backend service with proper configuration

# Set environment variables
export SPRING_PROFILES_ACTIVE=dev

# Change to project directory
cd "$(dirname "$0")"

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "Error: Java is not installed or not in PATH"
    exit 1
fi

# Check if the JAR file exists
JAR_FILE="litemall-all/target/litemall-all-0.1.0-exec.jar"
if [ ! -f "$JAR_FILE" ]; then
    echo "Error: JAR file not found at $JAR_FILE"
    echo "Please build the project first with: mvn clean package -DskipTests"
    exit 1
fi

# Create storage directory if it doesn't exist
mkdir -p storage

# Start the backend service
echo "Starting YesLocker backend service..."
echo "Profile: dev"
echo "Port: 8080"
echo "Admin Panel: http://localhost:8080/admin/index.html"
echo "API Base: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop the service"
echo ""

# Run the application
java -Xms128m -Xmx512m \
    -Dspring.profiles.active=dev \
    -Dfile.encoding=UTF-8 \
    -jar "$JAR_FILE"