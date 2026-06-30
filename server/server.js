require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Set up Multer for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Helper: Common tech skills database for keyword matching simulator
const TECH_SKILLS = [
  'React', 'Angular', 'Vue', 'Next.js', 'Nuxt.js', 'HTML', 'CSS', 'JavaScript', 'TypeScript', 'Sass', 'Tailwind', 'Bootstrap',
  'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'FastAPI', 'Ruby on Rails', 'Laravel', 'ASP.NET', 'GraphQL',
  'MongoDB', 'PostgreSQL', 'MySQL', 'SQL', 'SQLite', 'Redis', 'Cassandra', 'DynamoDB', 'Firebase', 'Oracle',
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'GitHub', 'GitLab', 'Jenkins', 'Terraform',
  'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Objective-C', 'Dart', 'Flutter', 'React Native',
  'REST API', 'Microservices', 'Serverless', 'Redux', 'Zustand', 'Webpack', 'Vite', 'Jira', 'Agile', 'Scrum', 'Linux', 'Bash'
];

// Helper: Weak resume wording phrases
const WEAK_WORDS = [
  { weak: 'worked on', strong: 'Developed and optimized', improvement: 'Change to action verb and quantify.' },
  { weak: 'responsible for', strong: 'Spearheaded the development of', improvement: 'Focus on ownership and outcomes rather than duties.' },
  { weak: 'helped with', strong: 'Collaborated on', improvement: 'Clarify your exact contribution and impact.' },
  { weak: 'made a website', strong: 'Architected a responsive web application', improvement: 'Use more descriptive tech industry phrasing.' },
  { weak: 'fixed bugs', strong: 'Resolved critical production anomalies, improving reliability by', improvement: 'State the type of bugs and add a performance metric.' },
  { weak: 'handled', strong: 'Managed and streamlined', improvement: 'Be specific about what you managed.' }
];

// Dynamic local matching simulator (Fallback when no API Key is provided)
function runSimulator(resumeText, jdText) {
  const resumeLower = resumeText.toLowerCase();
  const jdLower = jdText.toLowerCase();

  // Detect job role category
  let role = 'fullstack'; // default fallback
  if (/front\s*end|ui|ux|react|angular|vue|stylesheet|css|html/i.test(jdLower)) {
    role = 'frontend';
  } else if (/devops|cloud|docker|kubernetes|aws|azure|gcp|ci\/cd|pipeline|jenkins/i.test(jdLower)) {
    role = 'devops';
  } else if (/data\s*science|machine\s*learning|ai|analytics|python|sql|database|model/i.test(jdLower)) {
    role = 'data';
  } else if (/back\s*end|api|node|express|django|flask|spring|java\b|golang/i.test(jdLower)) {
    role = 'backend';
  }

  // Extract skills from JD and Resume
  const jdSkills = TECH_SKILLS.filter(skill => {
    const rx = new RegExp(`\\b${skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
    return rx.test(jdLower);
  });

  const resumeSkills = TECH_SKILLS.filter(skill => {
    const rx = new RegExp(`\\b${skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
    return rx.test(resumeLower);
  });

  // Default skills per role if none detected
  const defaultSkillsByRole = {
    frontend: ['React', 'CSS', 'JavaScript', 'Tailwind'],
    backend: ['Node.js', 'Express', 'SQL', 'MongoDB'],
    devops: ['Docker', 'AWS', 'CI/CD', 'Git'],
    data: ['Python', 'SQL', 'Pandas', 'TensorFlow'],
    fullstack: ['React', 'Node.js', 'SQL', 'Git']
  };

  const requiredSkills = jdSkills.length > 0 ? jdSkills : (defaultSkillsByRole[role] || defaultSkillsByRole.fullstack);
  
  // Calculate matched and missing
  const matchedSkills = requiredSkills.filter(skill => 
    resumeSkills.some(rs => rs.toLowerCase() === skill.toLowerCase())
  );
  
  const missingSkills = requiredSkills.filter(skill => 
    !resumeSkills.some(rs => rs.toLowerCase() === skill.toLowerCase())
  );

  // Soft skills detection
  const softSkillsDB = ['Communication', 'Leadership', 'Teamwork', 'Problem-solving', 'Critical thinking', 'Adaptability', 'Time management', 'Agile', 'Scrum'];
  const softSkills = softSkillsDB.filter(skill => 
    new RegExp(`\\b${skill}\\b`, 'i').test(jdLower)
  );
  if (softSkills.length === 0) {
    softSkills.push('Problem-solving', 'Collaboration');
  }

  // Calculate Match Score
  let matchScore = 100;
  if (requiredSkills.length > 0) {
    matchScore = Math.round((matchedSkills.length / requiredSkills.length) * 100);
  }
  if (matchScore === 0 && matchedSkills.length > 0) matchScore = 15;
  if (matchScore === 100 && missingSkills.length > 0) matchScore = 85;

  const skillsToLearn = missingSkills.length > 0 ? missingSkills : ['Docker', 'AWS', 'CI/CD'];
  const primaryMissing = skillsToLearn[0] || 'Node.js';
  const secondaryMissing = skillsToLearn[1] || 'AWS';
  const thirdMissing = skillsToLearn[2] || 'CI/CD';

  // Customize Roadmap based on Role
  const roadmap = {};
  
  if (role === 'frontend') {
    roadmap.week1 = {
      title: `Week 1: UI Engineering with ${primaryMissing}`,
      topics: [`Core architecture of ${primaryMissing}`, 'Component lifecycle and state hook patterns', 'Structuring stylesheets and modular layouts'],
      resources: [{ name: `Official ${primaryMissing} Docs`, url: 'https://react.dev' }, { name: 'Frontend Design Best Practices', url: 'https://smashingmagazine.com' }]
    };
    roadmap.week2 = {
      title: `Week 2: Advanced State & Routing`,
      topics: ['Global state container patterns (Redux/Zustand)', 'Client-side dynamic routing systems', 'Optimizing initial page loads and virtual DOM splits'],
      resources: [{ name: 'State Management Overview', url: 'https://dev.to' }]
    };
    roadmap.week3 = {
      title: `Week 3: CSS Frameworks & Layouts (${secondaryMissing})`,
      topics: [`Responsive designs with ${secondaryMissing}`, 'Utility-first styling methodologies', 'Configuring transitions and interactive themes'],
      resources: [{ name: `${secondaryMissing} Configuration Guide`, url: 'https://tailwindcss.com' }]
    };
    roadmap.week4 = {
      title: 'Week 4: Build Optimization & Staging Deploy',
      topics: ['Configuring bundles using Vite compiler configurations', 'Writing frontend unit tests using Vitest', 'Staging deployment on modern CDN hosts (Vercel/Netlify)'],
      resources: [{ name: 'Production Build Checklist', url: 'https://vite.dev' }]
    };
  } else if (role === 'backend') {
    roadmap.week1 = {
      title: `Week 1: Server Architecture with ${primaryMissing}`,
      topics: [`Setting up server runtime using ${primaryMissing}`, 'Handling routing parameters, parsing, and query filters', 'Middleware creation for cors and security configuration'],
      resources: [{ name: `Getting Started with ${primaryMissing}`, url: 'https://nodejs.org' }]
    };
    roadmap.week2 = {
      title: `Week 2: Relational & Document DBs (${secondaryMissing})`,
      topics: [`Configuring datastore schemas using ${secondaryMissing}`, 'Optimizing query index lookups and join metrics', 'Database migrations and configuration scripts'],
      resources: [{ name: `Connecting ${secondaryMissing} in Node`, url: 'https://mongoosejs.com' }]
    };
    roadmap.week3 = {
      title: `Week 3: API Standards & Auth`,
      topics: ['JWT session tokens and route protection middleware', 'Structuring RESTful resource responses', 'Swagger API documentation automation'],
      resources: [{ name: 'Secure API Standards', url: 'https://owasp.org' }]
    };
    roadmap.week4 = {
      title: 'Week 4: Unit Testing & Performance',
      topics: ['Writing integration tests with Supertest and Jest', 'Caching expensive queries using Redis key-value stores', 'Deploying Node services to production cloud hosting'],
      resources: [{ name: 'Backend Testing Patterns', url: 'https://jestjs.io' }]
    };
  } else if (role === 'devops') {
    roadmap.week1 = {
      title: `Week 1: Containerization with ${primaryMissing}`,
      topics: [`Writing optimized Dockerfiles for ${primaryMissing}`, 'Multi-stage builds to decrease bundle footprint size', 'Docker Compose definitions for multi-container services'],
      resources: [{ name: 'Docker Reference Manual', url: 'https://docs.docker.com' }]
    };
    roadmap.week2 = {
      title: `Week 2: Cloud Infrastructure Provider (${secondaryMissing})`,
      topics: [`Provisioning servers and hosting via ${secondaryMissing}`, 'Security Groups, IAM policies, and VPC configuration setup', 'Configuring public domains and SSL certificates'],
      resources: [{ name: `${secondaryMissing} Core Services Guide`, url: 'https://aws.amazon.com' }]
    };
    roadmap.week3 = {
      title: `Week 3: Deployment Integration (${thirdMissing})`,
      topics: [`Automating pipelines using ${thirdMissing}`, 'Environment secrets management in workflows', 'Setting up runners and build agents'],
      resources: [{ name: `${thirdMissing} Workflow Examples`, url: 'https://github.com/features/actions' }]
    };
    roadmap.week4 = {
      title: 'Week 4: Cluster Orchestration & Monitoring',
      topics: ['Deploying containers on Kubernetes clusters', 'Configuring horizontal pod autoscalers', 'Setting up Prometheus/Grafana analytics metrics dashboards'],
      resources: [{ name: 'Kubernetes Basics', url: 'https://kubernetes.io' }]
    };
  } else if (role === 'data') {
    roadmap.week1 = {
      title: `Week 1: Analytics Processing with ${primaryMissing}`,
      topics: [`Data analysis pipelines in ${primaryMissing}`, 'Vector arrays and indexing with Numpy & Pandas', 'Data cleanup, normalization, and outlier detection'],
      resources: [{ name: `Scientific computing in ${primaryMissing}`, url: 'https://scipy.org' }]
    };
    roadmap.week2 = {
      title: `Week 2: Database Operations & SQL (${secondaryMissing})`,
      topics: [`Aggregating analytical queries using ${secondaryMissing}`, 'Designing data schemas optimized for reporting read speeds', 'Integrating raw datastores with Python drivers'],
      resources: [{ name: 'Analytical Query Guides', url: 'https://postgresql.org' }]
    };
    roadmap.week3 = {
      title: `Week 3: Model Training Pipelines`,
      topics: ['Configuring supervised regression and classification models', 'Training neural networks and tuning hyperparameter configurations', 'Testing accuracy metrics (F1-score, Confusion Matrix)'],
      resources: [{ name: 'Scikit-learn Documentation', url: 'https://scikit-learn.org' }]
    };
    roadmap.week4 = {
      title: 'Week 4: Model Serving & Analytics Dashboards',
      topics: ['Exposing model prediction endpoints via FastAPI', 'Building interactive dashboards with Streamlit', 'Deploying analytics endpoints to cloud runtimes'],
      resources: [{ name: 'Streamlit Framework Guide', url: 'https://streamlit.io' }]
    };
  } else {
    // Default Full-Stack Roadmap
    roadmap.week1 = {
      title: `Week 1: Client UI Foundation (${primaryMissing})`,
      topics: [`Structuring views using ${primaryMissing} template layouts`, 'Managing component state bindings and network calls', 'Setting up Vite configurations'],
      resources: [{ name: 'Vite React Quickstart', url: 'https://vite.dev' }]
    };
    roadmap.week2 = {
      title: `Week 2: Backend API and Routes`,
      topics: ['Structuring Express RESTful servers', 'Creating controllers for user profiles and database operations', 'Middleware configurations for requests validation'],
      resources: [{ name: 'Express Guides', url: 'https://expressjs.com' }]
    };
    roadmap.week3 = {
      title: `Week 3: Datastore Schemas (${secondaryMissing || 'MongoDB'})`,
      topics: [`Connecting express to ${secondaryMissing || 'MongoDB'} datastores`, 'Defining document constraints and model methods', 'Performing collection query filters'],
      resources: [{ name: 'Database Integrations', url: 'https://mongodb.com' }]
    };
    roadmap.week4 = {
      title: `Week 4: Deployment & Pipelines (${thirdMissing || 'CI/CD'})`,
      topics: [`Deploying full-stack applications`, 'Writing container Dockerfiles', 'Automating tests on version control check-ins'],
      resources: [{ name: 'Deployment Pipelines Guide', url: 'https://dev.to' }]
    };
  }

  // Customize Projects based on Role
  const projectRecommendations = [];
  
  if (role === 'frontend') {
    projectRecommendations.push({
      title: `Interactive Data Analytics Dashboard`,
      description: `Build a highly polished, responsive client dashboard presenting graphical datasets, customizable layout widgets, and dark mode toggles utilizing ${primaryMissing}.`,
      skills: [primaryMissing, 'CSS', 'JavaScript', 'Recharts'],
      difficulty: 'Intermediate',
      duration: '2 weeks',
      features: ['Dynamic drag-and-drop widget layout', 'Interactive time-period charts & zoom details', 'Custom styling themes and animations'],
      architecture: 'Client-side SPA built with React (Vite), importing Recharts for visual rendering and local storage for theme caching.'
    });
    projectRecommendations.push({
      title: `Responsive E-Commerce Showcase Client`,
      description: `A beautiful web checkout front-end featuring rich cards, product filter slide-outs, item carts, and fluid micro-animations.`,
      skills: [primaryMissing, secondaryMissing || 'Tailwind', 'JavaScript'],
      difficulty: 'Advanced',
      duration: '3 weeks',
      features: ['Live category search and filtering tags', 'Smooth flyout cart slide overlays', 'Responsive styling grids targeting mobile and desktop views'],
      architecture: 'Vite React project utilizing Tailwind CSS for custom utility-first responsive layout rules.'
    });
  } else if (role === 'backend') {
    projectRecommendations.push({
      title: `Scalable RESTful Task Manager API`,
      description: `Create a robust backend server handling security session creation, multi-role routes access, database operations, and document storage using ${primaryMissing}.`,
      skills: [primaryMissing, secondaryMissing || 'MongoDB', 'REST API'],
      difficulty: 'Intermediate',
      duration: '2 weeks',
      features: ['Token authentication (JWT) & validation rules', 'CRUD endpoints for task models and categorizations', 'Comprehensive postman collection and route docs'],
      architecture: 'NodeJS Express server connected via Mongoose to MongoDB, version controlled using Git.'
    });
    projectRecommendations.push({
      title: `Real-Time Messaging Broker Service`,
      description: `A fast WebSocket message server supporting instant chat rooms, delivery receipts, and persistent message logs.`,
      skills: [primaryMissing, secondaryMissing || 'SQL', 'Redis', 'WebSockets'],
      difficulty: 'Advanced',
      duration: '3 weeks',
      features: ['Real-time socket channel broadcasting', 'Database message history indexing', 'In-memory Redis message queues for low-latency delivery'],
      architecture: 'Express backend using Socket.io, backed by PostgreSQL for persistence and Redis for state caching.'
    });
  } else if (role === 'devops') {
    projectRecommendations.push({
      title: `Automated Git CI/CD Build Pipeline`,
      description: `Construct a multi-branch deployment pipeline that runs automated testing, checks syntax rules, packages code containers, and deploys to cloud servers on check-in.`,
      skills: [primaryMissing, thirdMissing, 'Git', 'Bash'],
      difficulty: 'Intermediate',
      duration: '2 weeks',
      features: ['Automated pipeline execution triggers', 'Environment secrets variables encryption checks', 'Clean notifications on pipeline success/failure'],
      architecture: 'GitHub Actions workflow connecting to target cloud container registries via custom bash runner scripts.'
    });
    projectRecommendations.push({
      title: `High-Availability Infrastructure as Code System`,
      description: `Deploy a secure database and API cluster on a cloud hosting provider, fully configured using declarative configuration scripts.`,
      skills: [primaryMissing, secondaryMissing, 'Terraform', 'Kubernetes'],
      difficulty: 'Advanced',
      duration: '3 weeks',
      features: ['Multi-AZ server subnetting configuration', 'Declarative Infrastructure as Code (IaC) templates', 'Auto-scaling load balancer setup'],
      architecture: 'Terraform script repository configuring AWS VPC, EC2, and RDS instances, deployed as Kubernetes pods.'
    });
  } else if (role === 'data') {
    projectRecommendations.push({
      title: `Customer Churn Predictive Model API`,
      description: `Create an analytical prediction pipeline that reads user activity datasets, cleans outliers, trains classification models, and exposes results as an API.`,
      skills: [primaryMissing, 'Scikit-learn', 'Pandas', 'FastAPI'],
      difficulty: 'Intermediate',
      duration: '2 weeks',
      features: ['Data cleaning and pandas pipeline automation scripts', 'Supervised classification model evaluation logs', 'FastAPI prediction post routes'],
      architecture: 'Python analytics project packaging scikit-learn models and exposing prediction handlers using FastAPI.'
    });
    projectRecommendations.push({
      title: `Real-time Stock Sentiment Analytics System`,
      description: `A high-throughput ingestion scraper that aggregates social data, calculates sentiment indexes, and renders graphs in a browser dashboard.`,
      skills: [primaryMissing, secondaryMissing || 'SQL', 'Streamlit'],
      difficulty: 'Advanced',
      duration: '3 weeks',
      features: ['Real-time social feeds database insertion scripts', 'Natural Language Processing (NLP) sentiment scoring models', 'Interactive Streamlit metrics graphs'],
      architecture: 'Python aggregation script persisting to PostgreSQL, with visualization rendered in Streamlit.'
    });
  } else {
    // Default Full-Stack Projects
    projectRecommendations.push({
      title: `E-Commerce Product Portal Application`,
      description: `A full-stack product catalog with responsive client search, database persistence, and protected administration pages.`,
      skills: ['React', 'Node.js', secondaryMissing || 'SQL', 'Express'],
      difficulty: 'Intermediate',
      duration: '2 weeks',
      features: ['Product inventory catalog filter queries', 'Session routes authorization verification check', 'Interactive admin stock edit tables'],
      architecture: 'React (Vite) client sending request queries to Express API, backing up listings in MongoDB/PostgreSQL.'
    });
    projectRecommendations.push({
      title: `Real-Time Collaboration Team Workspace`,
      description: `A dashboard for teams to write files, update task cards, and converse in live real-time chats.`,
      skills: ['React', 'Node.js', 'WebSockets', 'Docker'],
      difficulty: 'Advanced',
      duration: '3 weeks',
      features: ['Simultaneous document editing state synchronization', 'Instant socket chat channels', 'Docker configuration file setups for quick deployments'],
      architecture: 'Vite client and Express API running WebSockets, containerized via Docker for instant deployment configurations.'
    });
  }

  // Resume Improvements recommendations
  const resumeImprovements = [];
  WEAK_WORDS.forEach(item => {
    const rx = new RegExp(`\\b${item.weak}\\b`, 'i');
    if (rx.test(resumeLower)) {
      const index = resumeLower.indexOf(item.weak);
      const start = Math.max(0, index - 20);
      const end = Math.min(resumeText.length, index + item.weak.length + 30);
      const originalSentence = resumeText.slice(start, end).replace(/\n/g, ' ').trim();
      
      resumeImprovements.push({
        original: originalSentence.length > 5 ? `"... ${originalSentence} ..."` : `bullet containing "${item.weak}"`,
        suggested: `${item.strong} [your specific feature], boosting delivery efficiency by [X]%`,
        reason: item.improvement
      });
    }
  });

  if (resumeImprovements.length === 0) {
    resumeImprovements.push({
      original: 'Worked on software development task',
      suggested: 'Spearheaded development of a scalable software component, cutting latency issues by 25%.',
      reason: 'Use action verbs and quantitative metrics.'
    });
  }

  // ATS Scoring
  let atsScore = 85;
  const atsSuggestions = [];

  // Check section headings
  if (!resumeLower.includes('experience') && !resumeLower.includes('work')) {
    atsScore -= 10;
    atsSuggestions.push('Add an "Experience" or "Work History" section headers clearly.');
  }
  if (!resumeLower.includes('project')) {
    atsScore -= 10;
    atsSuggestions.push('Add a dedicated "Projects" section to showcase key works.');
  }
  if (!resumeLower.includes('education')) {
    atsScore -= 5;
    atsSuggestions.push('Include an "Education" section for degree qualifications.');
  }
  if (!resumeLower.includes('skill')) {
    atsScore -= 10;
    atsSuggestions.push('Add a clear, formatted "Skills" summary list.');
  }

  // Email and Phone check
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
  if (!emailRegex.test(resumeLower)) {
    atsScore -= 10;
    atsSuggestions.push('Include a contact email address for recruiters.');
  }

  // Action verbs check
  const hasActionVerbs = ['developed', 'designed', 'managed', 'created', 'built', 'spearheaded', 'optimized', 'led'].some(verb => resumeLower.includes(verb));
  if (!hasActionVerbs) {
    atsScore -= 10;
    atsSuggestions.push('Use strong action verbs like "Spearheaded", "Optimized", "Architected" at the start of bullets.');
  }

  // Keywords suggestions
  missingSkills.slice(0, 4).forEach(skill => {
    atsSuggestions.push(`Add keyword "${skill}" to your resume to pass search filters.`);
  });

  atsScore = Math.max(45, Math.min(100, atsScore));

  // Dynamic Job Role Recommendations in Simulator
  const recommendedRoles = [];
  const rolesRegistry = [
    {
      role: 'Frontend Developer',
      skills: ['react', 'vue', 'angular', 'javascript', 'css', 'html', 'tailwind', 'bootstrap'],
      reason: 'Your background matches critical frontend technologies like React and layout design.'
    },
    {
      role: 'Backend Engineer',
      skills: ['node', 'express', 'django', 'flask', 'springboot', 'java', 'python', 'sql', 'mongodb', 'postgresql'],
      reason: 'Your experience aligns with server configurations, databases, and API development paradigms.'
    },
    {
      role: 'Full Stack Developer',
      skills: ['react', 'node', 'express', 'javascript', 'typescript', 'mongodb', 'sql'],
      reason: 'You demonstrate core familiarity with both client-side presentation layers and server database integrations.'
    },
    {
      role: 'Software Engineer',
      skills: ['java', 'python', 'c++', 'c#', 'data structures', 'algorithms', 'git'],
      reason: 'Your credentials show general software engineering principles, code versioning, and foundational systems.'
    }
  ];

  rolesRegistry.forEach(item => {
    const matches = item.skills.filter(s => {
      return matchedSkills.some(ms => ms.toLowerCase().includes(s));
    });
    
    let matchPct = 40;
    if (matches.length > 0) {
      matchPct = Math.min(95, 40 + (matches.length * 20));
    } else {
      const targetLower = jdText.toLowerCase();
      if (targetLower.includes(item.role.toLowerCase().split(' ')[0])) {
        matchPct = 55;
      }
    }

    if (matchPct >= 50 || recommendedRoles.length < 2) {
      recommendedRoles.push({
        role: item.role,
        matchPercentage: matchPct,
        reason: item.reason
      });
    }
  });

  recommendedRoles.sort((a, b) => b.matchPercentage - a.matchPercentage);

  return {
    matchScore,
    matchedSkills,
    missingSkills,
    softSkills,
    roadmap,
    projectRecommendations,
    resumeImprovements,
    recommendedRoles,
    atsScore,
    atsSuggestions
  };
}

// REST Endpoints

// 1. Profile Endpoints
app.get('/api/profile', async (req, res) => {
  try {
    const profile = await db.getProfile();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/profile', async (req, res) => {
  try {
    const updated = await db.saveProfile(req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Progress Endpoints
app.get('/api/progress', async (req, res) => {
  try {
    const progress = await db.getProgress();
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/progress', async (req, res) => {
  try {
    const updated = await db.saveProgress(req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Analysis List & History
app.get('/api/analyses', async (req, res) => {
  try {
    const list = await db.getAnalyses();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/analyses/:id', async (req, res) => {
  try {
    await db.deleteAnalysis(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. File Parsing & Core Skill Gap Analysis Endpoint
app.post('/api/analyze', upload.single('resumeFile'), async (req, res) => {
  try {
    let resumeText = req.body.resumeText || '';
    const jobDescriptionText = req.body.jobDescription || '';
    const clientApiKey = req.headers['x-gemini-key'] || process.env.GEMINI_API_KEY || '';

    // If file is uploaded, extract the text content
    if (req.file) {
      const mime = req.file.mimetype;
      const buffer = req.file.buffer;

      if (mime === 'application/pdf') {
        const parsed = await pdfParse(buffer);
        resumeText = parsed.text;
      } else if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mime === 'application/msword') {
        const parsed = await mammoth.extractRawText({ buffer });
        resumeText = parsed.value;
      } else {
        return res.status(400).json({ error: 'Unsupported file format. Please upload PDF or DOCX resume.' });
      }
    }

    if (!resumeText.trim()) {
      return res.status(400).json({ error: 'No resume text detected. Please paste text or upload a valid resume file.' });
    }

    if (!jobDescriptionText.trim()) {
      return res.status(400).json({ error: 'Job description text is empty. Please enter the target job description.' });
    }

    let result;

    // Determine if we should run Live Gemini AI or local matching simulator
    if (clientApiKey && clientApiKey.trim() !== '') {
      console.log('API Key detected. Triggering Live Google Gemini analysis...');
      try {
        const ai = new GoogleGenerativeAI(clientApiKey);

        const prompt = `
        You are an expert career consultant, ATS optimizer, and professional recruiter.
        Your task is to perform a detailed skill gap analysis between a candidate's resume and a target job description.
        
        Candidate's Resume:
        """
        ${resumeText}
        """

        Target Job Description:
        """
        ${jobDescriptionText}
        """

        Analyze the texts and output a strict JSON payload with the following exact keys and types:
        {
          "matchScore": <number, percentage matching score between 0 and 100 based on technical skill compatibility>,
          "matchedSkills": [<array of strings, exact technical skills identified in both the resume and the job description>],
          "missingSkills": [<array of strings, exact technical skills required or preferred by the job description but not found in the resume>],
          "softSkills": [<array of strings, soft skills, methodologies, or communication traits mentioned in the job description>],
          "roadmap": {
            "week1": {
              "title": "Week 1: [Short Title of Topic]",
              "topics": ["subtopic 1", "subtopic 2"],
              "resources": [{"name": "Resource Name", "url": "Resource URL"}]
            },
            "week2": {
              "title": "Week 2: [Short Title of Topic]",
              "topics": ["subtopic 1", "subtopic 2"],
              "resources": [{"name": "Resource Name", "url": "Resource URL"}]
            },
            "week3": {
              "title": "Week 3: [Short Title of Topic]",
              "topics": ["subtopic 1", "subtopic 2"],
              "resources": [{"name": "Resource Name", "url": "Resource URL"}]
            },
            "week4": {
              "title": "Week 4: [Short Title of Topic]",
              "topics": ["subtopic 1", "subtopic 2"],
              "resources": [{"name": "Resource Name", "url": "Resource URL"}]
            }
          },
          "projectRecommendations": [
            {
              "title": "[Project Title]",
              "description": "[1-2 sentence overview of the project]",
              "skills": ["Skill 1", "Skill 2"],
              "difficulty": "Beginner|Intermediate|Advanced",
              "duration": "[e.g. 2 weeks]",
              "features": ["Feature list item 1", "Feature list item 2"],
              "architecture": "[Brief architecture stack overview]"
            }
          ],
          "resumeImprovements": [
            {
              "original": "[Specify the actual weak/non-quantified sentence fragment from the resume]",
              "suggested": "[Provide a professional, quantified alternative using action verbs]",
              "reason": "[Explain why this improvement increases ATS readability and recruiter appeal]"
            }
          ],
          "recommendedRoles": [
            {
              "role": "[Job Role name, e.g. Frontend Engineer]",
              "matchPercentage": <number, score between 0 and 100 representing how well the current resume fits this role>,
              "reason": "[1-2 sentences explaining why this role fits their current skills]"
            }
          ],
          "atsScore": <number, overall ATS layout and wording score between 0 and 100>,
          "atsSuggestions": [<array of strings, actionable bullet suggestions to improve formatting, section headers, readability, and formatting rules>]
        }

        Do not wrap the output in markdown code blocks. Return only raw JSON. Ensure all JSON fields are valid.
        `;

        const modelsToTry = [
          'gemini-1.5-flash',
          'gemini-2.5-flash',
          'gemini-2.0-flash',
          'gemini-1.5-pro'
        ];

        let response;
        let lastError;

        for (const modelName of modelsToTry) {
          try {
            console.log(`Attempting Gemini analysis with model: ${modelName}...`);
            const model = ai.getGenerativeModel({ 
              model: modelName,
              generationConfig: { responseMimeType: 'application/json' }
            });
            response = await model.generateContent(prompt);
            if (response && response.response) {
              console.log(`Successfully generated content using model: ${modelName}`);
              break;
            }
          } catch (modelError) {
            console.warn(`Model ${modelName} failed or not found:`, modelError.message);
            lastError = modelError;
          }
        }

        if (!response) {
          throw new Error(`All attempted Gemini models failed. Last error: ${lastError?.message}`);
        }

        const text = response.response.text();
        result = JSON.parse(text);
      } catch (aiError) {
        console.warn('Gemini API call failed, falling back to local simulator:', aiError.message);
        result = runSimulator(resumeText, jobDescriptionText);
      }
    } else {
      console.log('No Gemini API Key detected. Using local matching simulator...');
      result = runSimulator(resumeText, jobDescriptionText);
    }

    // Save the analysis result in database
    const saved = await db.saveAnalysis({
      resumeText,
      jobDescriptionText,
      ...result
    });

    res.json(saved);
  } catch (error) {
    console.error('Error during analysis:', error);
    res.status(500).json({ error: error.message });
  }
});

// App Startup and DB init
db.connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`Skill Gap Analyzer Express server running on port: ${PORT}`);
    console.log(`Database Local Mode Active: ${db.isLocalMode()}`);
    console.log(`==================================================`);
  });
});
