import React, { useContext } from 'react';
import { AppContext } from './AppContext';

function Home() {
  const { count, increment } = useContext(AppContext);

  return (
    <div className="page">
      <h1>Home Page</h1>
      <p>Welcome to the Home page!</p>
      <p>Shared Count: {count}</p>
      <button onClick={increment}>Increment Count</button>
    </div>
  );
}

export default Home;
