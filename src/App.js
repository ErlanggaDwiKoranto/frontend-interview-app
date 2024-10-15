import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Loading from './components/Loading';
import LoginPage from './components/LoginPage'; // Halaman login
import RolePage from './components/RolePage'; // Halaman devisi
import CheckPage from './components/CheckPage'; // Halaman cek
import InterviewPage from './components/InterviewPage'; // Halaman cek
import EndPage from './components/EndPage';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Loading />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/role" element={<RolePage />} />
        <Route path="/check" element={<CheckPage />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path='/end' element={<EndPage/>}/>
      </Routes>
    </Router>
  );
}

export default App;
