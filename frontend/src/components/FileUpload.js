import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = ['.csv', '.xlsx', '.xls'];
      const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(fileExtension)) {
        setError('Please select a CSV, XLSX, or XLS file');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError('');
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/lists/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setResult(response.data.list);
      setFile(null);
      // Reset file input
      document.getElementById('file-input').value = '';
    } catch (error) {
      setError(error.response?.data?.message || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Upload & Distribute Lists
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          File Requirements
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Upload a CSV, XLSX, or XLS file with the following columns:
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Chip label="FirstName" variant="outlined" sx={{ mr: 1 }} />
          <Chip label="Phone" variant="outlined" sx={{ mr: 1 }} />
          <Chip label="Notes" variant="outlined" />
        </Box>
        <Typography variant="body2" color="text.secondary">
          The system will automatically distribute the list items equally among all active agents.
        </Typography>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <input
            id="file-input"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <label htmlFor="file-input">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUpload />}
              sx={{ mb: 2 }}
            >
              Choose File
            </Button>
          </label>
          
          {file && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Selected: {file.name}
            </Typography>
          )}

          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!file || uploading}
            sx={{ minWidth: 120 }}
          >
            {uploading ? 'Uploading...' : 'Upload & Distribute'}
          </Button>

          {uploading && <LinearProgress sx={{ width: '100%', mt: 2 }} />}
        </Box>
      </Paper>

      {result && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom color="success.main">
              Upload Successful!
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>File:</strong> {result.fileName}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Total Items:</strong> {result.totalItems}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Distribution:</strong>
            </Typography>
            <Box sx={{ ml: 2 }}>
              {result.distributions.map((dist, index) => (
                <Typography key={index} variant="body2">
                  • {dist.agentName}: {dist.itemCount} items
                </Typography>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default FileUpload;
