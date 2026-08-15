import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import RequestQuotation from './pages/RequestQuotation';
import TrackStatus from './pages/TrackStatus';
import ServiceRequest from './pages/ServiceRequest';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <nav className="bg-blue-600 text-white px-6 py-4 flex gap-6">
        <Link to="/" className="font-semibold hover:underline">Request Quotation</Link>
        <Link to="/track" className="font-semibold hover:underline">Track Status</Link>
        <Link to="/service" className="font-semibold hover:underline">Service Request</Link>
        <Link to="/admin" className="font-semibold hover:underline ml-auto">Admin</Link>
      </nav>

      <Routes>
        <Route path="/" element={<RequestQuotation />} />
        <Route path="/track" element={<TrackStatus />} />
        <Route path="/service" element={<ServiceRequest />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;