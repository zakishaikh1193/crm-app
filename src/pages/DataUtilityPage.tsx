import React, { useState } from 'react';
import { Box, Button, Typography, Alert, CircularProgress } from '@mui/material';
import api from '../config/axiosConfig';

const DataUtilityPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [duplicates, setDuplicates] = useState<any[]>([]);

  const handleCleanData = async () => {
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      await api.post('/contacts/mark-duplicates');
      setSuccess('Duplicates marked successfully!');
      // Optionally, fetch duplicates to display
      const res = await api.get('/contacts?duplicates=1');
      setDuplicates(res.data.contacts || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to mark duplicates');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
        Data Utility
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Use this tool to clean your data by marking and merging duplicate contacts.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleCleanData}
        disabled={loading}
        sx={{ mb: 3 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Clean Data (Mark Duplicates)'}
      </Button>
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {/* Placeholder for duplicates list */}
      {duplicates.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Duplicates Found</Typography>
          {/* Render duplicates here in a table or list */}
          <pre>{JSON.stringify(duplicates, null, 2)}</pre>
        </Box>
      )}
    </Box>
  );
};

export default DataUtilityPage; 