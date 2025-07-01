function App() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '100vh' }}>
      <h1 style={{ color: 'black', fontSize: '24px', marginBottom: '20px' }}>
        AlgoQR - Blockchain QR Verification
      </h1>
      <p style={{ color: 'black', fontSize: '16px' }}>
        React is working! ✅
      </p>
      <div style={{ 
        backgroundColor: '#f0f0f0', 
        padding: '10px', 
        border: '1px solid #ccc',
        marginTop: '20px'
      }}>
        <p>If you can see this, the app is loading correctly.</p>
        <p>Timestamp: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}

export default App;