import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import Index from './pages/Index';
import KaraokePage from './pages/KaraokePage';
import LibraryPage from './pages/LibraryPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <WalletProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/karaoke" element={<KaraokePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Router>
    </WalletProvider>
  );
}

export default App;
