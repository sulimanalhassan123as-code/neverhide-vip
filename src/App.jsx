import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HubPage from './pages/HubPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HubPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
