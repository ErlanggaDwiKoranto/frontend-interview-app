import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, MenuItem, TextField, Typography, Card, Stack, CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';

// Tema Gelap
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

// Styling untuk Card (Form)
const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  padding: theme.spacing(4),
  gap: theme.spacing(3),
  width: '100%',
  maxWidth: '500px',
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
}));

// Styling untuk Container
const RolePageContainer = styled(Stack)(({ theme }) => ({
  minHeight: '100vh',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
  background: 'radial-gradient(circle, rgba(25,25,60,1) 0%, rgba(0,0,0,1) 100%)',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
}));

const DevisiPage = () => {
  const [devisiOptions, setDevisiOptions] = useState([]);
  const [subDevisiOptions, setSubDevisiOptions] = useState([]);
  const [selectedDevisi, setSelectedDevisi] = useState('');
  const [selectedSubDevisi, setSelectedSubDevisi] = useState('');
  const [idTele, setIdTele] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idTeleParam = params.get('idTele');
    if (!idTeleParam) {
      console.error('ID Telegram tidak ditemukan di query parameter');
      return;
    }
    setIdTele(idTeleParam);

    const fetchDevisi = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/role-devisi`);
        if (!response.ok) {
          throw new Error('Failed to fetch devisi');
        }
        const devisi = await response.json();
        setDevisiOptions(devisi);
      } catch (error) {
        console.error('Error fetching devisi:', error);
      }
    };

    const fetchSubDevisi = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/role-sub-devisi`);
        if (!response.ok) {
          throw new Error('Failed to fetch sub-devisi');
        }
        const subDevisi = await response.json();
        setSubDevisiOptions(subDevisi);
      } catch (error) {
        console.error('Error fetching sub-devisi:', error);
      }
    };

    fetchDevisi();
    fetchSubDevisi();
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idTele || !selectedDevisi || !selectedSubDevisi) {
      console.error('Missing required fields');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/update-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idTele, devisi: selectedDevisi, subDevisi: selectedSubDevisi }),
      });
      
      const result = await response.json();
      console.log(result);

      if (response.ok) {
        navigate(`/check?idTele=${encodeURIComponent(idTele)}`);
      } else {
        const errorData = await response.json();
        console.error('Error updating devisi:', errorData);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <RolePageContainer>
        <StyledCard>
          <Typography component="h1" variant="h5" sx={{ textAlign: 'center', color: 'white' }}>
            Choose Devisi and Sub-Devisi
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              select
              fullWidth
              label="Devisi"
              id="devisi"
              name="devisi"
              value={selectedDevisi}
              onChange={(e) => setSelectedDevisi(e.target.value)}
              variant="outlined"
              sx={{ backgroundColor: '#121212', input: { color: 'white' }, mb: 2 }}
            >
              <MenuItem value="">
                <em>Select Devisi</em>
              </MenuItem>
              {devisiOptions.map(d => (
                <MenuItem key={d.id} value={d.id}>
                  {d.namaDevisi}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Sub-Devisi"
              id="subDevisi"
              name="subDevisi"
              value={selectedSubDevisi}
              onChange={(e) => setSelectedSubDevisi(e.target.value)}
              variant="outlined"
              sx={{ backgroundColor: '#121212', input: { color: 'white' }, mb: 2 }}
            >
              <MenuItem value="">
                <em>Select Sub-Devisi</em>
              </MenuItem>
              {Array.isArray(subDevisiOptions) && subDevisiOptions.map(sd => (
                <MenuItem key={sd.id} value={sd.id}>
                  {sd.namaSubDevisi}
                </MenuItem>
              ))}
            </TextField>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: 'white',
                color: 'black',
                '&:hover': {
                  backgroundColor: '#f0f0f0',
                },
                mt: 2,
              }}
            >
              Submit
            </Button>
          </Box>
        </StyledCard>
      </RolePageContainer>
    </ThemeProvider>
  );
};

export default DevisiPage;
