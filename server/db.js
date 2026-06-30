const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Ensure data folder exists for JSON fallback
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const FILES = {
  profile: path.join(DATA_DIR, 'profile.json'),
  progress: path.join(DATA_DIR, 'progress.json'),
  assessments: path.join(DATA_DIR, 'assessments.json')
};

// Initialize JSON files if they don't exist
Object.entries(FILES).forEach(([key, filepath]) => {
  if (!fs.existsSync(filepath)) {
    const initialContent = key === 'profile' 
      ? {} 
      : key === 'progress' 
        ? { completedSkills: [], completedProjects: [] } 
        : [];
    fs.writeFileSync(filepath, JSON.stringify(initialContent, null, 2));
  }
});

let useLocalJSON = false;

// 1. Mongoose Schemas (Used when connected to Mongo)
const ProfileSchema = new mongoose.Schema({
  name: String,
  email: String,
  targetRole: String,
  currentSkills: [String]
}, { timestamps: true });

const ProgressSchema = new mongoose.Schema({
  completedSkills: [String],
  completedProjects: [String]
}, { timestamps: true });

const AssessmentSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  resumeText: String,
  jobDescriptionText: String,
  matchScore: Number,
  matchedSkills: [String],
  missingSkills: [String],
  softSkills: [String],
  roadmap: mongoose.Schema.Types.Mixed, // Weeks structure
  projectRecommendations: mongoose.Schema.Types.Mixed, // Projects details
  resumeImprovements: mongoose.Schema.Types.Mixed, // Wording updates
  recommendedRoles: mongoose.Schema.Types.Mixed, // Job role recommendations
  atsScore: Number,
  atsSuggestions: [String]
}, { timestamps: true });

let ProfileModel, ProgressModel, AssessmentModel;

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/skill-gap';
  console.log(`Connecting to database: ${uri}...`);
  try {
    // 5-second timeout for quick fallback checking
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB successfully connected.');
    ProfileModel = mongoose.model('Profile', ProfileSchema);
    ProgressModel = mongoose.model('Progress', ProgressSchema);
    AssessmentModel = mongoose.model('Assessment', AssessmentSchema);
    useLocalJSON = false;
  } catch (error) {
    console.warn('\x1b[33m%s\x1b[0m', `MongoDB connection failed: ${error.message}`);
    console.warn('\x1b[33m%s\x1b[0m', 'Switched database provider to server-local JSON storage.');
    useLocalJSON = true;
  }
}

// Helper functions for JSON database operations
function readJSON(fileKey) {
  try {
    const data = fs.readFileSync(FILES[fileKey], 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return fileKey === 'profile' ? {} : fileKey === 'progress' ? { completedSkills: [], completedProjects: [] } : [];
  }
}

function writeJSON(fileKey, content) {
  fs.writeFileSync(FILES[fileKey], JSON.stringify(content, null, 2));
}

// Unified database operations
const db = {
  connectDB,
  isLocalMode: () => useLocalJSON,

  // Profile operations
  getProfile: async () => {
    if (!useLocalJSON && mongoose.connection.readyState === 1) {
      const p = await ProfileModel.findOne();
      return p || { name: 'Guest Developer', email: 'guest@example.com', targetRole: 'Software Developer', currentSkills: [] };
    } else {
      const p = readJSON('profile');
      if (Object.keys(p).length === 0) {
        return { name: 'Guest Developer', email: 'guest@example.com', targetRole: 'Software Developer', currentSkills: [] };
      }
      return p;
    }
  },

  saveProfile: async (profileData) => {
    if (!useLocalJSON && mongoose.connection.readyState === 1) {
      let p = await ProfileModel.findOne();
      if (p) {
        Object.assign(p, profileData);
        await p.save();
      } else {
        p = new ProfileModel(profileData);
        await p.save();
      }
      return p;
    } else {
      writeJSON('profile', profileData);
      return profileData;
    }
  },

  // Progress operations
  getProgress: async () => {
    if (!useLocalJSON && mongoose.connection.readyState === 1) {
      const p = await ProgressModel.findOne();
      return p || { completedSkills: [], completedProjects: [] };
    } else {
      return readJSON('progress');
    }
  },

  saveProgress: async (progressData) => {
    if (!useLocalJSON && mongoose.connection.readyState === 1) {
      let p = await ProgressModel.findOne();
      if (p) {
        Object.assign(p, progressData);
        await p.save();
      } else {
        p = new ProgressModel(progressData);
        await p.save();
      }
      return p;
    } else {
      writeJSON('progress', progressData);
      return progressData;
    }
  },

  // Assessment/Analysis operations
  getAnalyses: async () => {
    if (!useLocalJSON && mongoose.connection.readyState === 1) {
      return await AssessmentModel.find().sort({ date: -1 });
    } else {
      const data = readJSON('assessments');
      // Sort desc by date
      return [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  },

  saveAnalysis: async (analysisData) => {
    const formattedData = {
      ...analysisData,
      date: analysisData.date || new Date().toISOString()
    };
    if (!useLocalJSON && mongoose.connection.readyState === 1) {
      const a = new AssessmentModel(formattedData);
      await a.save();
      return a;
    } else {
      const data = readJSON('assessments');
      const newAnalysis = {
        _id: 'local_' + Math.random().toString(36).substr(2, 9),
        ...formattedData
      };
      data.push(newAnalysis);
      writeJSON('assessments', data);
      return newAnalysis;
    }
  },

  deleteAnalysis: async (id) => {
    if (!useLocalJSON && mongoose.connection.readyState === 1) {
      return await AssessmentModel.findByIdAndDelete(id);
    } else {
      let data = readJSON('assessments');
      const filtered = data.filter(item => item._id !== id);
      writeJSON('assessments', filtered);
      return { success: true };
    }
  }
};

module.exports = db;
