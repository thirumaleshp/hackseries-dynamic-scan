console.log('Starting main.tsx...');

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

console.log('React imports successful');

// Simple test component
function TestApp() {
  console.log('TestApp rendering...');
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'lightblue', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: 'darkblue' }}>React is Working! 🎉</h1>
      <p>If you can see this, React has loaded successfully.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
}

console.log('TestApp component defined');

const rootElement = document.getElementById('root');
console.log('Root element found:', !!rootElement);

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    console.log('React root created successfully');
    
    root.render(
      <StrictMode>
        <TestApp />
      </StrictMode>
    );
    
    console.log('TestApp rendered successfully!');
  } catch (error) {
    console.error('Error rendering React app:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    rootElement.innerHTML = `
      <div style="padding: 20px; background: red; color: white;">
        <h1>React Error</h1>
        <p>Error: ${errorMessage}</p>
      </div>
    `;
  }
} else {
  console.error('Root element not found!');
  document.body.innerHTML = `
    <div style="padding: 20px; background: orange; color: black;">
      <h1>Root Element Missing</h1>
      <p>Could not find element with id="root"</p>
    </div>
  `;
}
