# Educational Video Platform - Setup Guide

This is a YouTube-like educational video platform with Google Cloud Storage integration for video uploads.

## Features
- 🎥 YouTube video search and playback
- 📤 Video upload to Google Cloud Storage
- 🎙️ Voice search functionality
- 📱 Mobile responsive design
- 🌊 Interactive background effects

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Google Cloud Setup
1. Create a Google Cloud project
2. Enable the Cloud Storage API
3. Create a service account with Storage Admin permissions
4. Download the service account key as `service-account-key.json`
5. Create a storage bucket named `asimsaadz` (or update the bucket name in `server.js`)

### 3. Update Configuration
- Replace `your-project-id` in `server.js` with your actual Google Cloud project ID
- Ensure your YouTube API key is set in `searchbar.html`

### 4. Run the Server
```bash
npm start
```

The platform will be available at `http://localhost:3000`

## File Structure
- `searchbar.html` - Main platform interface
- `server.js` - Backend server for Google Cloud Storage integration
- `index.html` - Landing page with Google sign-in
- `welcome.html` - Interactive welcome page with thunder effects

## Usage
1. Navigate to the platform
2. Search for educational videos using the search bar or voice search
3. Upload your own videos using the Upload button
4. View your uploaded videos in the "My Videos" section

## Security Notes
- The API key in the frontend should be replaced with environment variables in production
- Service account keys should be kept secure and not committed to version control
- Consider implementing proper authentication for production use
