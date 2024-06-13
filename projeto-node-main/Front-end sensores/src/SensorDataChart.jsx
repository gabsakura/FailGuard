// src/SensorDataChart.jsx
import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './App.css';

const SensorDataChart = () => {
  const [sensorData, setSensorData] = useState([]);
  const [chartInstances, setChartInstances] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(null);
  const [sendInterval, setSendInterval] = useState(null);

  const generateRandomInRange = (min, max) => Math.random() * (max - min) + min;

  const sendSensorData = async () => {
    const dadosSensor = {
      sensor_id: 1,
      temperatura: generateRandomInRange(0, 50),
      umidade: generateRandomInRange(0, 100),
      vibracao: generateRandomInRange(0, 10),
      tensao: generateRandomInRange(0, 220),
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch('http://localhost:3000/inserir-dados-sensor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosSensor)
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar dados do sensor: ' + response.statusText);
      }

      console.log('Dados do sensor enviados com sucesso.');
      fetchData(); // Atualiza os dados após enviar os novos dados
    } catch (error) {
      console.error('Erro ao enviar dados do sensor:', error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:3000/dados-sensores');
      if (!response.ok) {
        throw new Error('Erro ao buscar dados: ' + response.statusText);
      }
      const data = await response.json();
      setSensorData(data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  const deleteSensorData = async () => {
    try {
      const response = await fetch('http://localhost:3000/limpar-dados', {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar dados: ' + response.statusText);
      }

      console.log('Dados do sensor deletados com sucesso.');
      fetchData(); // Atualiza os dados após deletar os dados
    } catch (error) {
      console.error('Erro ao deletar dados do sensor:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // Atualiza os dados a cada 5 minutos (300000 ms)
    setUpdateInterval(interval);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (sensorData.length === 0) return;

    Object.values(chartInstances).forEach(chart => chart.destroy());

    const ctxTemperatura = document.getElementById('temperatura-chart');
    const ctxUmidade = document.getElementById('umidade-chart');
    const ctxVibracao = document.getElementById('vibracao-chart');
    const ctxTensao = document.getElementById('tensao-chart');

    const chartOptions = {
      type: 'line',
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              font: {
                size: 14 // Tamanho da fonte dos ticks do eixo Y
              }
            },
            title: {
              display: true,
              text: 'Valores',
              font: {
                size: 16 // Tamanho da fonte do título do eixo Y
              }
            }
          },
          x: {
            ticks: {
              font: {
                size: 14 // Tamanho da fonte dos ticks do eixo X
              }
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: darkMode ? 'white' : 'black',
              font: {
                size: 16 // Tamanho da fonte das labels da legenda
              }
            }
          }
        }
      }
    };

    const newChartInstances = {
      temperatura: new Chart(ctxTemperatura, {
        ...chartOptions,
        data: {
          labels: sensorData.map(entry => new Date(entry.timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })),
          datasets: [{
            label: 'Temperatura',
            data: sensorData.map(entry => entry.temperatura),
            borderColor: 'rgb(227, 15, 89)',
          }]
        }
      }),
      umidade: new Chart(ctxUmidade, {
        ...chartOptions,
        data: {
          labels: sensorData.map(entry => new Date(entry.timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })),
          datasets: [{
            label: 'Umidade',
            data: sensorData.map(entry => entry.umidade),
            borderColor: 'rgb(54, 162, 235)',
          }]
        }
      }),
      vibracao: new Chart(ctxVibracao, {
        ...chartOptions,
        data: {
          labels: sensorData.map(entry => new Date(entry.timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })),
          datasets: [{
            label: 'Vibração',
            data: sensorData.map(entry => entry.vibracao),
            borderColor: 'rgb(75, 192, 192)',
          }]
        }
      }),
      tensao: new Chart(ctxTensao, {
        ...chartOptions,
        data: {
          labels: sensorData.map(entry => new Date(entry.timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })),
          datasets: [{
            label: 'Tensão',
            data: sensorData.map(entry => entry.tensao),
            borderColor: 'rgb(255, 206, 86)',
          }]
        }
      })
    };

    setChartInstances(newChartInstances);
  }, [sensorData, darkMode]);



  const startSendingData = () => {
    if (!sendInterval) {
      const interval = setInterval(sendSensorData, 300000); // Envia dados a cada 5 minutos (300000 ms)
      setSendInterval(interval);
    }
  };

  const stopSendingData = () => {
    if (sendInterval) {
      clearInterval(sendInterval);
      setSendInterval(null);
    }
  };

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="button-container">
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
        <button onClick={sendSensorData}>Send Data</button>
        <button onClick={startSendingData}>Start Sending Data</button>
        <button onClick={stopSendingData}>Stop Sending Data</button>
        <button onClick={deleteSensorData}>Delete Data</button>
      </div>
      <div className="charts-container">
        <div className="chart-wrapper">
          <canvas id="temperatura-chart"></canvas>
        </div>
        <div className="chart-wrapper">
          <canvas id="umidade-chart"></canvas>
        </div>
        <div className="chart-wrapper">
          <canvas id="vibracao-chart"></canvas>
        </div>
        <div className="chart-wrapper">
          <canvas id="tensao-chart"></canvas>
        </div>
      </div>
    </div>
  );
};

export default SensorDataChart;
