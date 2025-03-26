// const express = require("express");
// const jwt = require("jsonwebtoken");
// const bodyParser = require("body-parser");
// const cors = require("cors");

import express from "express";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const PORT = 5000;
const SECRET_KEY = "your_secret_key";

app.use(cors());
app.use(bodyParser.json());

let users = [];

app.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (users.find((user) => user.username === username)) {
    return res.status(400).json({ message: "Пользователь уже существует" });
  }
  users.push({ username, password });
  res.json({ message: "Регистрация успешна" });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (user) => user.username === username && user.password === password
  );
  if (!user) {
    return res.status(401).json({ message: "Неверные учетные данные" });
  }
  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ token });
});

const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "Требуется аутентификация" });
  }
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Неверный токен" });
    }
    req.user = user;
    next();
  });
};

app.get("/protected", authenticateJWT, (req, res) => {
  res.json({ message: `Привет, ${req.user.username}! Это защищенный ресурс.` });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
