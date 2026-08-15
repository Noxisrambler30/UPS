import { useState } from 'react';
import api from '../api/axios';

function TrackStatus() {
  const [code, setCode] = useState('');
  const [request, setRequest] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setRequest(null);
    setLoading(true);

    try {
      const response = await api.get(`/quotes/${code.trim()}`);
      setRequest(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setErrorMessage('No request found with that code. Please check and try again.');
      } else {
        setErrorMessage('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const statusLabels = {
    PENDING: { text: 'Pending Review', color: 'bg-yellow-100 text-yellow-800' },
    QUOTED: { text: 'Quotation Sent', color: 'bg-blue-100 text-blue-800' },
    REVISION_REQUESTED: { text: 'Under Revision', color: 'bg-orange-100 text-orange-800' },
    APPROVED: { text: 'Approved', color: 'bg-purple-100 text-purple-800' },
    BILLED: { text: 'Billed', color: 'bg-green-100 text-green-800' },
  };

  const currentLabel = request
    ? statusLabels[request.status] || { text: request.status || 'Unknown', color: 'bg-gray-100 text-gray-800' }
    : null;

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Track Your Request</h2>

      <form onSubmit={handleTrack} className="flex gap-2 mb-6">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter your reference code"
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="bg-blue-600 text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {errorMessage && <p className="text-red-600 text-sm mb-4">{errorMessage}</p>}

      {request && (
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-mono font-bold">{request.uniqueCode}</span>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${currentLabel.color}`}>
              {currentLabel.text}
            </span>
          </div>

          <div className="text-sm text-gray-600">
            <p>Power: {request.power}</p>
            <p>Backup: {request.backup}</p>
            <p>Phase: {request.phase}</p>
          </div>

          {request.quote && (
            <div className="pt-3 border-t">
              <p className="text-sm font-medium mb-1">
                Quote Amount: ₹{request.quote.amount.toLocaleString('en-IN')}
              </p>
              <a
                href={request.quote.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                View Quotation PDF →
              </a>
            </div>
          )}

          {request.bill && (
            <div className="pt-3 border-t">
              <p className="text-sm font-medium mb-1">
                Bill Amount: ₹{request.bill.amount.toLocaleString('en-IN')}
              </p>
              <a
                href={request.bill.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                View Bill PDF →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TrackStatus;