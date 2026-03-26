import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import WavToMp3Page from './pages/WavToMp3Page';
import FlacToWavPage from './pages/FlacToWavPage';
import Mp3ToWavPage from './pages/Mp3ToWavPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/wav-to-mp3" element={<WavToMp3Page />} />
          <Route path="/flac-to-wav" element={<FlacToWavPage />} />
          <Route path="/mp3-to-wav" element={<Mp3ToWavPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
