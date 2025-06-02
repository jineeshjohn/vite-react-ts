import React, { useState } from 'react';
import './App.scss';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <p>
        <button onClick={() => setCount((count) => count + 1)}>
          count: {count}
        </button>
      </p>
    </div>
  );
}

export default App;
