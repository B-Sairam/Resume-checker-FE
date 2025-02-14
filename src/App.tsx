import React, { useState } from 'react';
import ReactMarkdown from "react-markdown";
import axios from 'axios';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fade,
  Alert,
  IconButton,
} from '@mui/material';
import { FileUp, Target, Lightbulb, Award, AlertTriangle, RefreshCw } from 'lucide-react';

interface AnalysisResult {
  analysis: {
    matching_score: number;
    missing_skill: string[];
    Suggestions: string;
  };
}

function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      const selectedFile = event.target.files[0];
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setFile(selectedFile);
      setActiveStep(1);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !jobDescription) {
      setError('Please provide both resume and job description');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('job_description', jobDescription);

    try {
      const response = await axios.post<AnalysisResult>(
        'http://23.20.138.89:3000/analyze',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
          },
          timeout: 30000, 
        }
      );

      setAnalysisResult(response.data);
      setShowResults(true);
      setActiveStep(2);
    } catch (err) {
      let errorMessage = 'Failed to analyze resume. Please try again.';
      
      
      setError(errorMessage);
      console.error('Analysis error:', errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setShowResults(false);
    setFile(null);
    setJobDescription('');
    setError(null);
    setAnalysisResult(null);
  };

  const steps = ['Upload Resume', 'Job Description', 'Results'];

  return  <Box sx={{ 
    minHeight: '100vh',
    background: 'linear-gradient(120deg, #f6f7fc 0%, #e9eeff 100%)',
    py: 4 
  }}>
    <Container maxWidth="lg">
  <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
      <Typography variant="h3" sx={{ 
        fontWeight: 700,
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        backgroundClip: 'text',
        textFillColor: 'transparent',
      }}>
        AI Resume Analyzer
      </Typography>
      {(showResults || activeStep > 0) && (
        <IconButton onClick={handleReset} color="primary" size="large">
          <RefreshCw />
        </IconButton>
      )}
    </Box>

    <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>

    {error && (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    )}

    <Box sx={{ mt: 4 }}>
      {activeStep === 0 && (
        <Fade in>
          <Box sx={{ textAlign: 'center' }}>
            <input
              accept=".pdf"
              style={{ display: 'none' }}
              id="resume-upload"
              type="file"
              onChange={handleFileUpload}
            />
            <label htmlFor="resume-upload">
              <Button
                variant="outlined"
                component="span"
                size="large"
                startIcon={<FileUp />}
                sx={{ mb: 2 }}
              >
                Upload Resume
              </Button>
            </label>
            <Typography variant="body2" color="text.secondary">
              Supported formats: PDF, DOC, DOCX (Max 5MB)
            </Typography>
          </Box>
        </Fade>
      )}

      {activeStep === 1 && (
        <Fade in>
          <Box>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Paste Job Description"
              variant="outlined"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Button
              variant="contained"
              size="large"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              startIcon={isAnalyzing ? <CircularProgress size={20} /> : <Target />}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Match'}
            </Button>
          </Box>
        </Fade>
      )}

      {showResults && analysisResult && (
        <Fade in>
          <Box>
            <Card sx={{ mb: 3, background: '#f8f9fa' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Match Score
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CircularProgress
                    variant="determinate"
                    value={analysisResult.analysis.matching_score}
                    size={60}
                    thickness={4}
                    sx={{ mr: 2 }}
                  />
                  <Typography variant="h4">{analysisResult.analysis.matching_score}%</Typography>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <AlertTriangle size={20} style={{ marginRight: '8px' }} />
                  Missing Skills
                </Typography>
                <List>
                  {analysisResult.analysis.missing_skill.map((skill) => (
                    <ListItem key={skill}>
                      <ListItemIcon>
                        <Award size={20} />
                      </ListItemIcon>
                      <ListItemText primary={skill} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Lightbulb size={20} style={{ marginRight: '8px' }} />
                  Suggestions
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  <ReactMarkdown>
                  {analysisResult.analysis.Suggestions}
                  </ReactMarkdown>
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Fade>
      )}
    </Box>
  </Paper>
</Container>
</Box>
}

export default App;