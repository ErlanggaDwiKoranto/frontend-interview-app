import React from 'react';
import { Box, Typography, Button, Stack, CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const EndContainer = styled(Stack)(({ theme }) => ({
  minHeight: '100vh',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
  background: 'radial-gradient(circle, rgba(25,25,60,1) 0%, rgba(0,0,0,1) 100%)',
}));

const StyledCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  width: '100%',
  maxWidth: '600px',
  background: '#1e1e1e',
  borderRadius: theme.spacing(2),
  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
}));

const EndPage = () => {
  const navigate = useNavigate();

  const handleReturnHome = () => {
    // Redirect to the home page or another desired page
    navigate('/');
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <EndContainer>
        <StyledCard>
          <Typography variant="h4" sx={{ color: 'white', textAlign: 'center' }}>
            Interview Completed
          </Typography>
          <Typography variant="h6" sx={{ color: 'white', textAlign: 'center', mt: 2 }}>
            Thank you for participating in the interview process. Your videos have been successfully uploaded.
          </Typography>
          <Typography variant="body1" sx={{ color: 'white', textAlign: 'center', mt: 2 }}>
            Our team will review your responses and get back to you shortly.
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleReturnHome}
            sx={{ mt: 3 }}
          >
            Return to Home
          </Button>
        </StyledCard>
      </EndContainer>
    </ThemeProvider>
  );
};

export default EndPage;
