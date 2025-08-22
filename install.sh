#!/bin/bash

# CascadeTimer Installer
# This script downloads all the necessary dependencies for the CascadeTimer project.

# --- Configuration ---
BOOTSTRAP_VERSION="5.3.3"
JQUERY_VERSION="3.7.1"
JQUERY_UI_VERSION="1.13.2"
FONT_AWESOME_VERSION="6.5.2"
JSZIP_VERSION="3.10.1"

# --- Directory Setup ---
echo "--- Creating library and asset directories ---"
mkdir -p lib/bootstrap
mkdir -p lib/jquery
mkdir -p lib/fontawesome
mkdir -p lib/jszip
mkdir -p sounds
echo "Directories created."

# --- Helper Function for Downloading ---
download_file() {
    local url=$1
    local destination=$2
    local filename=$(basename "$destination")

    if [ -f "$destination" ]; then
        echo "$filename already exists. Skipping download."
    else
        echo "Downloading $filename from $url..."
        if curl -f -L "$url" -o "$destination"; then
            echo "$filename downloaded successfully."
        else
            echo "ERROR: Failed to download $filename from $url."
            echo "Please check your internet connection or the URL."
            exit 1
        fi
    fi
}

# 1. Bootstrap
echo -e "\n--- Handling Bootstrap ---"
download_file "https://cdn.jsdelivr.net/npm/bootstrap@$BOOTSTRAP_VERSION/dist/css/bootstrap.min.css" "lib/bootstrap/bootstrap.min.css"
download_file "https://cdn.jsdelivr.net/npm/bootstrap@$BOOTSTRAP_VERSION/dist/js/bootstrap.bundle.min.js" "lib/bootstrap/bootstrap.bundle.min.js"

# 2. jQuery & jQuery UI
echo -e "\n--- Handling jQuery & jQuery UI ---"
download_file "https://code.jquery.com/jquery-$JQUERY_VERSION.min.js" "lib/jquery/jquery.min.js"
download_file "https://code.jquery.com/ui/$JQUERY_UI_VERSION/jquery-ui.min.js" "lib/jquery/jquery-ui.min.js"
download_file "https://code.jquery.com/ui/$JQUERY_UI_VERSION/themes/base/jquery-ui.css" "lib/jquery/jquery-ui.css"

# 3. Font Awesome
echo -e "\n--- Handling Font Awesome ---"
FA_CSS_URL="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@$FONT_AWESOME_VERSION/css/all.min.css"
FA_WEBFONTS_URL="https://github.com/FortAwesome/Font-Awesome/archive/refs/tags/$FONT_AWESOME_VERSION.zip"
FA_ZIP_FILE="lib/fontawesome/fontawesome.zip"
FA_EXTRACT_DIR="lib/fontawesome/temp_fa"
# **FIX:** The final destination for webfonts should be lib/webfonts
FA_FINAL_FONTS_DIR="lib/webfonts"

download_file "$FA_CSS_URL" "lib/fontawesome/all.min.css"

if [ -d "$FA_FINAL_FONTS_DIR" ]; then
    echo "Font Awesome webfonts directory already exists. Skipping download."
else
    echo "Downloading Font Awesome webfonts..."
    download_file "$FA_WEBFONTS_URL" "$FA_ZIP_FILE"
    
    echo "Extracting webfonts..."
    mkdir -p "$FA_EXTRACT_DIR"
    unzip -q "$FA_ZIP_FILE" -d "$FA_EXTRACT_DIR"
    EXTRACTED_FOLDER=$(find "$FA_EXTRACT_DIR" -type d -name "Font-Awesome-*" -print -quit)
    
    if [ -d "$EXTRACTED_FOLDER/webfonts" ]; then
        # **FIX:** Move the webfonts folder to the correct location
        mv "$EXTRACTED_FOLDER/webfonts" "$FA_FINAL_FONTS_DIR"
        echo "Webfonts moved to $FA_FINAL_FONTS_DIR."
    else
        echo "ERROR: Could not find webfonts directory in the downloaded zip."
    fi
    
    rm "$FA_ZIP_FILE"
    rm -rf "$FA_EXTRACT_DIR"
fi

# 4. JSZip
echo -e "\n--- Handling JSZip ---"
download_file "https://cdnjs.cloudflare.com/ajax/libs/jszip/$JSZIP_VERSION/jszip.min.js" "lib/jszip/jszip.min.js"

# 5. Notification Sounds
echo -e "\n--- Handling Notification Sounds ---"
download_file "https://cdn.pixabay.com/download/audio/2022/03/15/audio_2f20d5291f.mp3" "sounds/chime.mp3"
download_file "https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3" "sounds/notification.mp3"
download_file "https://cdn.pixabay.com/download/audio/2022/10/26/audio_833440b898.mp3" "sounds/alarm-clock.mp3"
download_file "https://cdn.pixabay.com/download/audio/2022/03/24/audio_7386de49e8.mp3" "sounds/digital-bleep.mp3"

echo -e "\n--- Installation Complete ---"
echo "All dependencies have been successfully downloaded."
echo "For best results, run a local web server in this directory to avoid browser security issues."
echo "Example using Python 3: python -m http.server"