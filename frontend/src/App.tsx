import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Cover from './pages/Cover';
import Consent from './pages/Consent';
import Aspect from './pages/Aspect';
import Entry from './pages/Entry';
import Result from './pages/Result';
import Shelves from './pages/Shelves'; // 👈 추가
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-archive-bg text-archive-paper font-serif">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Cover />} />
          <Route path="/consent" element={<Consent />} />
          <Route path="/aspect" element={<Aspect />} />
          <Route path="/entry" element={<Entry />} />
          <Route path="/result" element={<Result />} />
          <Route path="/shelves" element={<Shelves />} /> {/* 👈 교체됨 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;