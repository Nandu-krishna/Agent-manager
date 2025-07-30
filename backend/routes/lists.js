const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const Agent = require('../models/Agent');
const List = require('../models/List');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV, XLSX, and XLS files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Function to parse CSV file
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Normalize column names (case insensitive)
        const normalizedData = {};
        Object.keys(data).forEach(key => {
          const normalizedKey = key.toLowerCase().trim();
          if (normalizedKey.includes('firstname') || normalizedKey.includes('first_name') || normalizedKey.includes('first name')) {
            normalizedData.firstName = data[key];
          } else if (normalizedKey.includes('phone') || normalizedKey.includes('mobile')) {
            normalizedData.phone = data[key];
          } else if (normalizedKey.includes('notes') || normalizedKey.includes('note')) {
            normalizedData.notes = data[key] || '';
          }
        });
        
        if (normalizedData.firstName && normalizedData.phone) {
          results.push(normalizedData);
        }
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

// Function to parse Excel file
const parseExcel = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  return data.map(row => {
    const normalizedData = {};
    Object.keys(row).forEach(key => {
      const normalizedKey = key.toLowerCase().trim();
      if (normalizedKey.includes('firstname') || normalizedKey.includes('first_name') || normalizedKey.includes('first name')) {
        normalizedData.firstName = row[key];
      } else if (normalizedKey.includes('phone') || normalizedKey.includes('mobile')) {
        normalizedData.phone = row[key];
      } else if (normalizedKey.includes('notes') || normalizedKey.includes('note')) {
        normalizedData.notes = row[key] || '';
      }
    });
    
    return normalizedData;
  }).filter(item => item.firstName && item.phone);
};

// Function to distribute items among agents
const distributeItems = (items, agents) => {
  const distributions = [];
  const itemsPerAgent = Math.floor(items.length / agents.length);
  const remainingItems = items.length % agents.length;
  
  let startIndex = 0;
  
  agents.forEach((agent, index) => {
    const extraItem = index < remainingItems ? 1 : 0;
    const itemCount = itemsPerAgent + extraItem;
    const agentItems = items.slice(startIndex, startIndex + itemCount);
    
    distributions.push({
      agentId: agent._id,
      agentName: agent.name,
      items: agentItems,
      itemCount: agentItems.length
    });
    
    startIndex += itemCount;
  });
  
  return distributions;
};

// Upload and distribute list
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get all active agents
    const agents = await Agent.find({ isActive: true });
    if (agents.length === 0) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'No active agents found. Please add agents first.' });
    }

    let items = [];
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    try {
      // Parse file based on extension
      if (fileExtension === '.csv') {
        items = await parseCSV(req.file.path);
      } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
        items = parseExcel(req.file.path);
      }

      // Validate parsed data
      if (items.length === 0) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ 
          message: 'No valid data found. Please ensure your file has columns: FirstName, Phone, Notes' 
        });
      }

      // Distribute items among agents
      const distributions = distributeItems(items, agents);

      // Save to database
      const list = new List({
        fileName: req.file.originalname,
        totalItems: items.length,
        distributions,
        uploadedBy: req.user._id
      });

      await list.save();

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.json({
        message: 'File uploaded and distributed successfully',
        list: {
          id: list._id,
          fileName: list.fileName,
          totalItems: list.totalItems,
          distributions: list.distributions
        }
      });

    } catch (parseError) {
      // Clean up uploaded file on parse error
      fs.unlinkSync(req.file.path);
      throw parseError;
    }

  } catch (error) {
    console.error('Upload error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Error processing file: ' + error.message });
  }
});

// Get all lists
router.get('/', auth, async (req, res) => {
  try {
    const lists = await List.find()
      .populate('uploadedBy', 'email')
      .sort({ createdAt: -1 });
    res.json(lists);
  } catch (error) {
    console.error('Error fetching lists:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific list
router.get('/:id', auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id)
      .populate('uploadedBy', 'email');
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    res.json(list);
  } catch (error) {
    console.error('Error fetching list:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
