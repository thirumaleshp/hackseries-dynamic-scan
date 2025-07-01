import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Simple test components
function TestDashboard() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <p>Welcome to AlgoQR - Blockchain QR Verification</p>
      <p>This is the dashboard where you can see your QR code statistics.</p>
    </div>
  );
}

function TestGenerate() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Generate QR Code</h1>
      <p>Create a new QR code that will be verified on the Algorand blockchain.</p>
      <form style={{ marginTop: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>Label: <input type="text" style={{ marginLeft: '10px', padding: '5px' }} /></label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Description: <textarea style={{ marginLeft: '10px', padding: '5px' }}></textarea></label>
        </div>
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '5px' }}>
          Generate QR Code
        </button>
      </form>
    </div>
  );
}

function TestScan() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Scan QR Code</h1>
      <p>Scan QR codes to verify their authenticity on the Algorand blockchain.</p>
      <div style={{ padding: '20px', border: '2px dashed #ccc', textAlign: 'center', marginTop: '20px' }}>
        <p>QR Code Scanner would go here</p>
        <button style={{ padding: '10px 20px', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '5px' }}>
          Start Camera
        </button>
      </div>
    </div>
  );
}

function TestHistory() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Transaction History</h1>
      <p>View your QR code generation and scanning history.</p>
      <div style={{ marginTop: '20px' }}>
        <div style={{ padding: '10px', border: '1px solid #ccc', marginBottom: '10px' }}>
          <strong>QR-001</strong> - Product Authentication - Verified ✅
        </div>
        <div style={{ padding: '10px', border: '1px solid #ccc', marginBottom: '10px' }}>
          <strong>QR-002</strong> - Event Ticket - Pending ⏳
        </div>
      </div>
    </div>
  );
}

function App() {
  console.log('App component rendering with all routes...');
  
  return (
    <Router>
      <div style={{ padding: '20px', backgroundColor: 'lightyellow', minHeight: '100vh' }}>
        <h1>AlgoQR App ✅</h1>
        <nav style={{ marginBottom: '20px' }}>
          <Link to="/" style={{ marginRight: '10px', color: 'blue', textDecoration: 'none' }}>Dashboard</Link>
          <Link to="/generate" style={{ marginRight: '10px', color: 'blue', textDecoration: 'none' }}>Generate</Link>
          <Link to="/scan" style={{ marginRight: '10px', color: 'blue', textDecoration: 'none' }}>Scan</Link>
          <Link to="/history" style={{ color: 'blue', textDecoration: 'none' }}>History</Link>
        </nav>
        <Routes>
          <Route path="/" element={<TestDashboard />} />
          <Route path="/generate" element={<TestGenerate />} />
          <Route path="/scan" element={<TestScan />} />
          <Route path="/history" element={<TestHistory />} />
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;