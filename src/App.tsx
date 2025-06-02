import React, { useState } from 'react';
import './App.scss';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <p>
        <h1>Test !!!</h1>
        <button onClick={() => setCount((count) => count + 1)}>
          count: {count}
        </button>
      </p>
    </div>
  );
}

export default App;
