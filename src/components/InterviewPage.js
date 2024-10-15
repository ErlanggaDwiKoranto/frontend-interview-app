import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { Box, Button, Typography, Card, Stack, CssBaseline, CircularProgress } from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  width: '100%',
  maxWidth: '600px',
  margin: 'auto',
}));

const InterviewContainer = styled(Stack)(({ theme }) => ({
  minHeight: '100vh',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
  background: 'radial-gradient(circle, rgba(25,25,60,1) 0%, rgba(0,0,0,1) 100%)',
}));

const InterviewPage = () => {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(''); // Stores upload status ('Uploading', 'Success', 'Error')
  const [stream, setStream] = useState(null);
  const [folderUrl, setFolderUrl] = useState(null);
  const [timer, setTimer] = useState('00:00');
  const [timerInterval, setTimerInterval] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null); 
  const maxRecordingTime = 60;
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch folder link and ensure it exists
  const ensureFolderExists = async (idTele) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/create-folder/${idTele}`);
      if (response.ok) {
        const data = await response.json();
        setFolderUrl(data.folderUrl);
      } else {
        throw new Error('Error creating or checking folder');
      }
    } catch (error) {
      console.error('Error ensuring folder exists:', error);
      alert('Error occurred while ensuring folder exists');
    }
  };

  useEffect(() => {
    const fetchFolderLink = async () => {
      const params = new URLSearchParams(location.search);
      const idTele = params.get('idTele');
      
      if (!idTele) {
        console.error('idTele is missing in the query parameter');
        return;
      }

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/get-folder-link/${idTele}`);
        if (response.ok) {
          const data = await response.json();
          if (data.folderUrl) {
            setFolderUrl(data.folderUrl);
          } else {
            await ensureFolderExists(idTele);
          }
        } else {
          console.error('Error fetching folder link');
        }
      } catch (error) {
        console.error('Error fetching folder link:', error);
      }
    };
    fetchFolderLink();
  }, [location.search]);

  useEffect(() => {
    const fetchQuestions = async () => {
      const params = new URLSearchParams(location.search);
      const idTele = params.get('idTele');
  
      if (!idTele) {
        console.error('idTele is missing in the query parameter');
        return;
      }
  
      try {
        // Fetch user data to get devisiId and subDevisiId
        const userResponse = await fetch(`${process.env.REACT_APP_API_URL}/data-user/${idTele}`);
        const userData = await userResponse.json();
  
        if (userData.devisiId && userData.subDevisiId) {
          // Fetch questions based on devisiId and subDevisiId
          const questionsResponse = await fetch(`${process.env.REACT_APP_API_URL}/questions?devisiId=${userData.devisiId}&subDevisiId=${userData.subDevisiId}`);
          const questionsData = await questionsResponse.json();
  
          if (Array.isArray(questionsData) && questionsData.length > 0) {
            setQuestions(questionsData);  // Set questions data
          } else {
            console.error('No questions found');
          }
        } else {
          console.error('User does not have valid devisiId or subDevisiId');
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };
  
    fetchQuestions();
  }, [location.search]);
  

  const startRecording = async () => {
    try {
      setRecordedBlob(null);

      if (!stream) {
        throw new Error("No media stream available.");
      }

      const mimeType = 'video/webm';
      
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      setMediaRecorder(recorder);
      setIsRecording(true);
      setIsVideoReady(false);

      let timeElapsed = 0;
      const interval = setInterval(() => {
        timeElapsed++;
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        setTimer(`${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);

        if (timeElapsed >= maxRecordingTime) {
          stopRecording();
          clearInterval(interval);
        }
      }, 1000);

      setTimerInterval(interval);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setRecordedBlob(e.data);
          const videoURL = URL.createObjectURL(e.data);
          const videoElement = document.getElementById('videoElement');
          videoElement.srcObject = null;
          videoElement.src = videoURL;
          videoElement.controls = true;
          setIsVideoReady(true);
        }
      };

      recorder.start();
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Terjadi kesalahan saat memulai rekaman.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      setTimer('00:00');

      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    } else {
      console.error('No active media recorder to stop.');
    }
  };

  const reloadRecording = () => {
    if (isRecording) {
      stopRecording();
    }
  
    setTimer('00:00');
    setIsRecording(false);
    setIsVideoReady(false);
  
    const videoElement = document.getElementById('videoElement');
    videoElement.srcObject = stream;
    videoElement.controls = false;
    videoElement.play();
  };

  const uploadVideo = async (blob) => {
    if (!folderUrl) {
      alert('Unable to upload video, folder URL not available.');
      return;
    }

    const idTele = new URLSearchParams(location.search).get('idTele');
    const fileName = `${idTele}_video_${currentQuestionIndex + 1}.webm`;

    const formData = new FormData();
    formData.append('video', blob, fileName);
    formData.append('folderUrl', folderUrl);

    setUploadStatus('Uploading...');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/upload-file`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadStatus(' ');
      } else {
        setUploadStatus('Error');
        throw new Error('Failed to upload video');
      }
    } catch (error) {
      setUploadStatus('Error');
      console.error('Error uploading video:', error);
    }
  };

  const nextQuestion = async () => {
    if (!isVideoReady || !recordedBlob) {
      alert('Video belum direkam atau belum siap diunggah.');
      return;
    }

    // Disable the button while uploading to prevent multiple clicks
    setUploadStatus('Uploading...');

    // Upload the recorded video
    await uploadVideo(recordedBlob);

    // Reset state for the next question
    setRecordedBlob(null);
    setIsVideoReady(false);

    // Stop the current stream and reset the media
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    // After upload, fetch the media stream again for the next question
    const newStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setStream(newStream);
    const videoElement = document.getElementById('videoElement');
    videoElement.srcObject = newStream;

    // Wait for the new stream to load and then play it
    videoElement.onloadedmetadata = () => {
      videoElement.play().catch((error) => {
        console.error('Error playing the video:', error);
      });
    };

    // Only update the current question index here to avoid multiple increments
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      navigate('/end');  // Redirect to the end page
    }
  };
  
  useEffect(() => {
    const getMediaStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);

        const videoElement = document.getElementById('videoElement');
        videoElement.srcObject = mediaStream;
        videoElement.onloadedmetadata = () => {
          videoElement.play();
        };
      } catch (error) {
        alert('Unable to access media devices.');
      }
    };

    if (!stream) {
      getMediaStream();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <InterviewContainer>
        <StyledCard>
          <Typography component="h1" variant="h5" sx={{ textAlign: 'center', color: 'white' }}>
            Interview Session
          </Typography>
          
          {/* Show loading indicator while uploading */}
          {uploadStatus === 'Uploading...' ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2, color: 'white' }}>Uploading Video...</Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ mt: 2, mb: 2 }}>
                <video id="videoElement" autoPlay muted style={{ width: '100%', height: 'auto', backgroundColor: '#121212' }}></video>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Button variant="contained" onClick={startRecording} disabled={isRecording}>
                  Start Recording
                </Button>
                <Button variant="contained" onClick={stopRecording} disabled={!isRecording}>
                  Stop Recording
                </Button>
                <Button variant="contained" onClick={reloadRecording} disabled={isRecording}>
                  Reload Recording
                </Button>
              </Box>
              <Typography variant="h6" sx={{ color: 'white', textAlign: 'center' }} id="timer">
                {timer}
              </Typography>
              <Typography variant="h6" sx={{ color: 'white', textAlign: 'center' }} id="question">
                Current Question: {questions[currentQuestionIndex]?.pertanyaan || 'Loading question...'}
              </Typography>
              <Typography sx={{ color: 'white', mt: 2 }} id="uploadStatus">
                {uploadStatus}
              </Typography>
              <Typography variant="h6" sx={{ color: 'white', textAlign: 'center' }}>
                Progress: {currentQuestionIndex + 1}/{questions.length}
              </Typography>
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={nextQuestion}
                disabled={isRecording || !isVideoReady || uploadStatus === 'Uploading...' || !recordedBlob}
              >
                {currentQuestionIndex + 1 === questions.length ? 'Finish' : 'Next Question'}
              </Button>
            </>
          )}

        </StyledCard>
      </InterviewContainer>
    </ThemeProvider>
  );
};

export default InterviewPage;
