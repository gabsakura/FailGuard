const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors()); // Habilita o CORS para todas as origens

const db = new sqlite3.Database('banco-de-dados.db');

// Lógica para criar a tabela se ela não existir
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS dados_sensores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sensor_id INTEGER,
        temperatura REAL,
        umidade REAL,
        vibracao REAL,
        tensao REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Endpoint para inserir dados do sensor
app.post('/inserir-dados-sensor', (req, res) => {
    const { sensor_id, temperatura, umidade, vibracao, tensao, timestamp } = req.body;
    console.log('Dados do sensor recebidos:', { sensor_id, temperatura, umidade, vibracao, tensao, timestamp });

    // Lógica para inserir os dados na tabela
    db.run(`INSERT INTO dados_sensores (sensor_id, temperatura, umidade, vibracao, tensao, timestamp) VALUES (?, ?, ?, ?, ?, ?)`, 
           [sensor_id, temperatura, umidade, vibracao, tensao, timestamp], 
           (err) => {
               if (err) {
                   console.error('Erro ao inserir dados no banco de dados:', err.message);
                   res.status(500).send('Erro ao processar os dados.');
               } else {
                   console.log('Dados inseridos no banco de dados com sucesso.');
                   res.send('Dados recebidos e armazenados com sucesso.');
               }
           });
});

// Endpoint para buscar todos os dados dos sensores
app.get('/dados-sensores', (req, res) => {
    // Query para buscar todos os dados cadastrados na tabela
    const query = `SELECT * FROM dados_sensores`;

    // Executando a query no banco de dados
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar dados no banco de dados:', err.message);
            res.status(500).send('Erro ao buscar os dados.');
        } else {
            // Se não houver erros, envie os dados como resposta
            res.json(rows);
        }
    });
});

// Endpoint para limpar todos os dados da tabela
app.delete('/limpar-dados', (req, res) => {
    // Query para deletar todos os dados da tabela
    const query = `DELETE FROM dados_sensores`;

    // Executando a query no banco de dados
    db.run(query, [], (err) => {
        if (err) {
            console.error('Erro ao limpar dados do banco de dados:', err.message);
            res.status(500).send('Erro ao limpar os dados.');
        } else {
            console.log('Dados da tabela limpos com sucesso.');
            res.send('Dados da tabela foram limpos com sucesso.');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
