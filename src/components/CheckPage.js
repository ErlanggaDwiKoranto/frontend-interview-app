import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Typography, Box, Card, CircularProgress, Button, Stack, CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';

// Tema Gelap
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

// Styling untuk Card (User Info)
const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  width: '100%',
  maxWidth: '500px',
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
}));

// Styling untuk Container
const CheckPageContainer = styled(Stack)(({ theme }) => ({
  minHeight: '100vh',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
  background: 'radial-gradient(circle, rgba(25,25,60,1) 0%, rgba(0,0,0,1) 100%)',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
}));

const CheckPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [folderUrl, setFolderUrl] = useState(null); // New state for folder URL
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserData = async () => {
      const params = new URLSearchParams(location.search);
      const idTele = params.get('idTele');
    
      if (!idTele) {
        console.error('ID Telegram tidak ditemukan di query parameter');
        return;
      }
    
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/data-user/${idTele}`);
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          const errorText = await response.text();
          console.error('Error fetching user data:', errorText); // Menampilkan respons sebagai teks
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [location.search]);

  // Fungsi handleConfirm untuk membuat folder di Google Drive
  const handleConfirm = async () => {
    if (!user || !user.idTele) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/create-folder/${user.idTele}`);
      if (response.ok) {
        const data = await response.json();
        setFolderUrl(data.folderUrl); // Set the folder URL if successful
        // alert(`Folder Created: ${data.folderUrl}`);

        // Kirim FolderLink ke backend untuk disimpan di DB
        const saveLinkResponse = await fetch(`${process.env.REACT_APP_API_URL}/save-folder-link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idTele: user.idTele,
                folderUrl: data.folderUrl
            })
        });

        if (saveLinkResponse.ok) {
            console.log("Folder link saved successfully.");
            navigate(`/interview?idTele=${encodeURIComponent(user.idTele)}`)
        } else {
            console.error('Error saving folder link');
        }
      } else {
        const errorText = await response.text();
        console.error('Error creating folder:', errorText);
        alert('Failed to create folder');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error occurred while creating folder');
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <CheckPageContainer>
          <CircularProgress color="primary" size={60} />
          <Typography variant="h6" sx={{ color: 'white', mt: 2 }}>
            Loading...
          </Typography>
        </CheckPageContainer>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <CheckPageContainer>
        <StyledCard>
          <Typography component="h1" variant="h5" sx={{ textAlign: 'center', color: 'white' }}>
            User Information
          </Typography>
          {user ? (
            <Box id="userInfo">
              <Typography sx={{ color: 'white' }}>
                ID Telegram: <span id="idTele">{user.idTele}</span>
              </Typography>
              <Typography sx={{ color: 'white' }}>
                Email: <span id="email">{user.email}</span>
              </Typography>
              <Typography sx={{ color: 'white' }}>
                Nama: <span id="nama">{user.nama}</span>
              </Typography>
              <Typography sx={{ color: 'white' }}>
                Telepon: <span id="telepon">{user.telepon}</span>
              </Typography>
              <Typography sx={{ color: 'white' }}>
                Devisi: <span id="devisi">{user.devisi || 'N/A'}</span>
              </Typography>
              <Typography sx={{ color: 'white' }}>
                Sub-Devisi: <span id="subDevisi">{user.subDevisi || 'N/A'}</span>
              </Typography>
              <Button
                variant="contained"
                sx={{backgroundColor: 'white', color: 'black', mt: 2 }}
                onClick={handleConfirm} // Add handleConfirm to onClick
              >
                Confirm
              </Button>
              {folderUrl && (
                <Typography sx={{ color: 'white', mt: 2 }}>
                  Folder Created: <a href={folderUrl} target="_blank" rel="noopener noreferrer">{folderUrl}</a>
                </Typography>
              )}
            </Box>
          ) : (
            <Typography sx={{ color: 'white' }}>No user data found</Typography>
          )}
        </StyledCard>
      </CheckPageContainer>
    </ThemeProvider>
  );
};

export default CheckPage;
