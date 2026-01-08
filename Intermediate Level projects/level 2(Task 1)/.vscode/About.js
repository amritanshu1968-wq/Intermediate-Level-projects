import React, { useContext } from 'react';
import { AppContext } from './AppContext';

function About() {
  const { count, increment } = useContext(AppContext);

  return (
    <div className="page">
      <h1>About Page</h1>
      <p>This is the About page.</p>

      <div className="card" style={{ marginTop: 12 }}>
        <p style={{ marginBottom: 8 }}>Shared Count: <strong style={{ color: 'white' }}>{count}</strong></p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={increment}>Increment Count</button>
        </div>
      </div>
    </div>
  );
}

export default About;

