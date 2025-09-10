const express = require('express');
const cors = require('cors');
const { Storage } = require('@google-cloud/storage');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: 'trim-glazing-468422-d6', // Your actual project ID from service account
  keyFilename: './service-account-key.json' // Path to your service account key
});

const bucketName = 'asimsaadz';
const bucket = storage.bucket(bucketName);

// Store uploaded videos metadata (in production, use a database)
let uploadedVideos = [];

// Generate signed URL for upload
app.post('/api/generate-upload-url', async (req, res) => {
  try {
    const { fileName, fileType } = req.body;
    
    if (!fileName || !fileType) {
      return res.status(400).json({ error: 'fileName and fileType are required' });
    }

    // Generate unique file key
    const timestamp = Date.now();
    const fileKey = `videos/${timestamp}-${fileName}`;

    // Generate signed URL for upload (expires in 15 minutes)
    const [uploadUrl] = await bucket.file(fileKey).getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: fileType,
    });

    res.json({ uploadUrl, fileKey });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

// Handle upload completion
app.post('/api/upload-complete', async (req, res) => {
  try {
    const { fileKey, title, description } = req.body;
    
    if (!fileKey || !title) {
      return res.status(400).json({ error: 'fileKey and title are required' });
    }

    // Generate public URL for the uploaded file
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileKey}`;
    
    // Store video metadata
    const videoData = {
      id: Date.now().toString(),
      title,
      description: description || '',
      fileKey,
      publicUrl,
      uploadedAt: new Date().toISOString(),
      thumbnailUrl: 'https://placehold.co/600x400/333/fff?text=Video', // Default thumbnail
      channel: 'Your Channel',
      type: 'video'
    };
    
    uploadedVideos.push(videoData);
    
    res.json({ success: true, videoData });
  } catch (error) {
    console.error('Error handling upload completion:', error);
    res.status(500).json({ error: 'Failed to process upload completion' });
  }
});

// Get uploaded videos
app.get('/api/my-videos', (req, res) => {
  res.json(uploadedVideos);
});

// Delete uploaded video
app.delete('/api/videos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const videoIndex = uploadedVideos.findIndex(v => v.id === id);
    
    if (videoIndex === -1) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    const video = uploadedVideos[videoIndex];
    
    // Delete from Google Cloud Storage
    await bucket.file(video.fileKey).delete();
    
    // Remove from local storage
    uploadedVideos.splice(videoIndex, 1);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'searchbar.html'));
});

// Also serve searchbar.html directly
app.get('/searchbar.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'searchbar.html'));
});

// Serve static files AFTER defining routes
app.use(express.static('.'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Make sure to:');
  console.log('1. Replace "your-project-id" with your actual Google Cloud project ID');
  console.log('2. Add your service account key file as "service-account-key.json"');
  console.log('3. Enable Google Cloud Storage API in your project');
});
