// src/App.jsx
import React from 'react';
import SensorDataChart from './SensorDataChart';
import './App.css';

const App = () => {
  return (
    <div className="App">
      <h1>Dados do Sensor</h1>
      <SensorDataChart />
    </div>
  );
};

export default App;
