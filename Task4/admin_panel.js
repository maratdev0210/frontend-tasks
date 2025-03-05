const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();
const PORT = 3000;

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const fs = require('fs');
const path = require('path');

// Middleware для обработки JSON
app.use(bodyParser.json());

// Swagger документация
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Product Management API',
            version: '1.0.0',
            description: 'API для управления товарами',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],
    },
    apis: ['openapi_goods.yaml'], // укажите путь к файлам с аннотациями
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs_admin', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(cors());

const filePath = path.join(__dirname, 'goods.json');

// GET-запрос: получить список товаров
app.get('/goods', (req, res) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка чтения файла' });
        }
        try {
            const goods = JSON.parse(data);
            res.json(goods);
        } catch (parseError) {
            res.status(500).json({ error: 'Ошибка парсинга JSON' });
        }
    });
});

// POST-запрос: добавить новый товар
app.post('/goods', (req, res) => {
    const { name, cost, description, category } = req.body;

    if (!name || !cost || !description || !category) {
        return res.status(400).json({ error: 'Все поля (название, стоимость, описание, категория) обязательны' });
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка чтения файла' });
        }
        try {
            const goods = JSON.parse(data);
            const newGood = {
                id: goods.length ? goods[goods.length - 1].id + 1 : 1,
                name,
                cost,
                description,
                category,
            };

            goods.push(newGood);

            fs.writeFile(filePath, JSON.stringify(goods, null, 2), (writeErr) => {
                if (writeErr) {
                    return res.status(500).json({ error: 'Ошибка записи в файл' });
                }
                res.status(201).json({ message: 'Товар добавлен', товар: newGood });
            });
        } catch (parseError) {
            res.status(500).json({ error: 'Ошибка парсинга JSON' });
        }
    });
});

// PUT-запрос: обновить информацию о товаре по ID
app.put('/goods/:id', (req, res) => {
    const { id } = req.params;
    const { name, cost, description, category } = req.body;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка чтения файла' });
        }
        try {
            let goods = JSON.parse(data);
            const index = goods.findIndex(good => good.id === parseInt(id));

            if (index === -1) {
                return res.status(404).json({ error: 'Товар не найден' });
            }

            // Обновляем только переданные параметры
            if (name !== undefined) goods[index].name = name;
            if (cost !== undefined) goods[index].cost = cost;
            if (description !== undefined) goods[index].description = description;
            if (category !== undefined) goods[index].category = category;

            fs.writeFile(filePath, JSON.stringify(goods, null, 2), (writeErr) => {
                if (writeErr) {
                    return res.status(500).json({ error: 'Ошибка записи в файл' });
                }
                res.json({ message: 'Товар обновлен', товар: goods[index] });
            });
        } catch (parseError) {
            res.status(500).json({ error: 'Ошибка парсинга JSON' });
        }
    });
});

app.delete('/goods/:id', (req, res) => {
    const { id } = req.params;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка чтения файла' });
        }
        try {
            let goods = JSON.parse(data);
            const index = goods.findIndex(good => good.id === parseInt(id));

            if (index === -1) {
                return res.status(404).json({ error: 'Товар не найден' });
            }

            // Удаляем товар
            const deletedGood = goods.splice(index, 1)[0];

            fs.writeFile(filePath, JSON.stringify(goods, null, 2), (writeErr) => {
                if (writeErr) {
                    return res.status(500).json({ error: 'Ошибка записи в файл' });
                }
                res.json({ message: 'Товар удален', удаленный_товар: deletedGood });
            });
        } catch (parseError) {
            res.status(500).json({ error: 'Ошибка парсинга JSON' });
        }
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
