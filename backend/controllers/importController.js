import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse';
import XLSX from 'xlsx';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.csv', '.xlsx', '.xls'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV and Excel files are allowed'), false);
  }
};

export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: Infinity, // No file size limit
    files: Infinity // No file count limit
  }
});

// Parse CSV file - UNLIMITED VERSION
export const parseCSVFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const headers = [];
    let rowCount = 0;
    
    const stream = fs.createReadStream(filePath, { 
      highWaterMark: 256 * 1024 // 256KB chunks for better performance with large files
    });
    
    const parser = parse({ 
      skip_empty_lines: true,
      trim: true,
      relax_quotes: true,
      relax_column_count: true,
      max_record_size: 10 * 1024 * 1024 // 10MB max record size for very large rows
    });
    
    stream
      .pipe(parser)
      .on('data', (data) => {
        if (headers.length === 0) {
          headers.push(...data);
        } else {
          const row = {};
          headers.forEach((header, index) => {
            row[header] = data[index] || '';
          });
          results.push(row);
          rowCount++;
          
          // Log progress for large files
          if (rowCount % 50000 === 0) {
            console.log(`Processed ${rowCount} rows...`);
          }
        }
      })
      .on('end', () => {
        console.log(`Parsed ${rowCount} rows from CSV file`);
        resolve({
          headers,
          data: results,
          preview: results.slice(0, 5),
          totalRows: rowCount
        });
      })
      .on('error', (error) => {
        console.error('CSV parsing error:', error);
        reject(error);
      });
  });
};

// Parse Excel file - UNLIMITED VERSION
export const parseExcelFile = (filePath) => {
  try {
    console.log(`Starting Excel file parsing: ${filePath}`);
    const startTime = Date.now();
    
    const workbook = XLSX.readFile(filePath, { 
      cellDates: true,
      cellNF: false,
      cellText: false,
      cellStyles: false,
      cellFormula: false,
      cellHTML: false
    });
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Get sheet dimensions for progress tracking
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    const totalRows = range.e.r;
    console.log(`Excel file has ${totalRows} rows`);
    
    // Convert to JSON without row limit
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '',
      blankrows: false
    });
    
    if (data.length === 0) {
      throw new Error('Empty file');
    }
    
    const headers = data[0];
    const rows = data.slice(1).map(row => {
      const rowObject = {};
      headers.forEach((header, index) => {
        rowObject[header] = row[index] || '';
      });
      return rowObject;
    });

    const processingTime = Date.now() - startTime;
    console.log(`Parsed ${rows.length} rows from Excel file in ${processingTime}ms`);

    return {
      headers,
      data: rows,
      preview: rows.slice(0, 5),
      totalRows: rows.length
    };
  } catch (error) {
    console.error('Excel parsing error:', error);
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
};

// Upload files - FAST VERSION (no parsing during upload)
export const uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    console.log(`Uploaded ${req.files.length} files successfully`);
    
    const fileDetails = req.files.map(file => ({
      filename: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype
    }));

    res.json({
      message: 'Files uploaded successfully',
      files: fileDetails
    });
  } catch (error) {
    console.error('Upload files error:', error);
    res.status(500).json({ error: 'Failed to upload files: ' + error.message });
  }
};

// Get file preview - called separately after upload
export const getFilePreview = async (req, res) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(400).json({ error: 'File not found' });
    }

    console.log(`Getting preview for file: ${filePath}`);
    const startTime = Date.now();
    
    const ext = path.extname(filePath).toLowerCase();
    let parsedData;

    if (ext === '.csv') {
      parsedData = await parseCSVFile(filePath);
    } else if (ext === '.xlsx' || ext === '.xls') {
      parsedData = await parseExcelFile(filePath);
    } else {
      throw new Error('Unsupported file type');
    }

    const processingTime = Date.now() - startTime;
    console.log(`File preview generated in ${processingTime}ms`);

    res.json({
      headers: parsedData.headers,
      preview: parsedData.preview,
      totalRows: parsedData.totalRows
    });
  } catch (error) {
    console.error('Get file preview error:', error);
    res.status(500).json({ error: 'Failed to get file preview: ' + error.message });
  }
};

// Get sample data for mapping preview
export const getSampleData = async (req, res) => {
  try {
    const { filename } = req.params;
    
    // This is a placeholder - in a real implementation, you might want to
    // temporarily store processed file data or re-process the file
    res.json({
      message: 'Sample data endpoint',
      filename,
      note: 'This endpoint can be used to retrieve sample data for a specific file if needed'
    });
  } catch (error) {
    console.error('Get sample data error:', error);
    res.status(500).json({ error: 'Failed to get sample data' });
  }
};