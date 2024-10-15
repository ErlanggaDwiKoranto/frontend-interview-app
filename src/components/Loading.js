import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LinearProgress, Typography, Box, Stack } from '@mui/material';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import logo from '../assets/images/levelUp2.png';
import CssBaseline from '@mui/material/CssBaseline';

// Tema gelap yang konsisten
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

// Styling untuk container loading menggunakan MUI
const LoadingContainer = styled(Stack)(({ theme }) => ({
  minHeight: '100vh',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'radial-gradient(circle, rgba(25,25,60,1) 0%, rgba(0,0,0,1) 100%)',
  textAlign: 'center',
  padding: theme.spacing(2),  // Menambah padding untuk lebih rapi
}));

// Mengembalikan ukuran logo
const Logo = styled('img')(({ theme }) => ({
  width: '250px',  // Ukuran logo yang lebih besar
  marginBottom: theme.spacing(4),  // Memberikan jarak lebih antara logo dan progress bar
}));

// Styling untuk progress bar
const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  width: '100%',  // Memastikan progress bar selebar container
  maxWidth: '300px',  // Membatasi lebar maksimal progress bar
  marginTop: theme.spacing(2),  // Menambah jarak dengan logo
  marginBottom: theme.spacing(2),  // Menambah jarak antara progress bar dan teks
}));

const LoadingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulasi loading dengan durasi 3 detik
    const timer = setTimeout(() => {
      navigate('/login');  // Redirect ke halaman login setelah loading
    }, 3000);

    // Membersihkan timer saat komponen di-unmount
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <LoadingContainer>
        {/* Logo */}
        <Logo src={logo} alt="Logo" />

        {/* Progress Bar */}
        <ProgressBar color="primary" />

        {/* Text Loading */}
        <Box>
          <Typography variant="h6" sx={{ color: 'white' }}>
            Loading...
          </Typography>
        </Box>
      </LoadingContainer>
    </ThemeProvider>
  );
};

export default LoadingPage;
