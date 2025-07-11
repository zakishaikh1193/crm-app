import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Button, Alert, CircularProgress, Divider } from '@mui/material';
import api from '../config/axiosConfig';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

interface PredictionResult {
  predicted_email: string;
  pattern: string;
  accuracy: number;
  pattern_count: number;
  total_company_emails: number;
}

const EmailFinderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchPrediction();
    // eslint-disable-next-line
  }, [id]);

  const fetchPrediction = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/contacts/predict-email/${id}`);
      setPrediction(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch prediction');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!prediction) return;
    setSaving(true);
    setSaveSuccess('');
    setSaveError('');
    try {
      await api.post(`/contacts/${id}/save-predicted-email`, {
        email: prediction.predicted_email,
      });
      setSaveSuccess('Predicted email saved as primary!');
      setTimeout(() => navigate(`/contacts/${id}`), 1200);
    } catch (err: any) {
      setSaveError(err.response?.data?.error || 'Failed to save email');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    if (prediction?.predicted_email) {
      navigator.clipboard.writeText(prediction.predicted_email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  return (
    <Box maxWidth={500} mx="auto" mt={6}>
      <Card sx={{ boxShadow: 4, borderRadius: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom fontWeight={700} color="primary.main">
            Email Finder
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : prediction ? (
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Predicted Email:
                </Typography>
                <Typography variant="subtitle1" fontFamily="monospace" color="primary.dark">
                  {prediction.predicted_email}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  color={copied ? 'success' : 'primary'}
                  onClick={handleCopy}
                  sx={{ minWidth: 36, px: 1, ml: 1 }}
                  title="Copy to clipboard"
                >
                  {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                </Button>
              </Box>
              <Box display="flex" gap={2} mb={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Pattern:</strong> <span style={{ color: '#6366f1' }}>{prediction.pattern}</span> <span style={{ color: '#64748b' }}>({prediction.pattern_count}/{prediction.total_company_emails})</span>
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Accuracy:</strong> <span style={{ color: prediction.accuracy > 0.8 ? '#059669' : '#f59e42' }}>{(prediction.accuracy * 100).toFixed(1)}%</span>
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box mt={2} display="flex" gap={2}>
                <Button variant="contained" color="primary" onClick={handleSave} disabled={saving} sx={{ fontWeight: 600, borderRadius: 3 }}>
                  {saving ? 'Saving...' : 'Save Email'}
                </Button>
                <Button variant="outlined" onClick={() => navigate(`/contacts/${id}`)} sx={{ borderRadius: 3 }}>
                  Back to Contact
                </Button>
              </Box>
              {saveSuccess && <Alert severity="success" sx={{ mt: 2 }}>{saveSuccess}</Alert>}
              {saveError && <Alert severity="error" sx={{ mt: 2 }}>{saveError}</Alert>}
            </Box>
          ) : null}
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmailFinderPage; 