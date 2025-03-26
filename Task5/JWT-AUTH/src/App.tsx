import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoginActive, setIsLoginActive] = useState(false);
  const [payload, setPayload] = useState(null);
  const errorRef = useRef(null);
  const successRef = useRef(null);

  useEffect(() => {
    if (errorRef.current !== null) {
      errorRef.current.style.color = "red";
    }
    if (successRef.current !== null) {
      successRef.current.style.color = "green";
    }
  }, [errorMessage, message]);

  const handleRegister = async () => {
    try {
      const response = await axios.post("http://localhost:5000/register", {
        username,
        password,
      });
      console.log(response);
      setMessage(response.data.message);
    } catch (error) {
      console.log(error);
      setErrorMessage(error.response?.data?.message || "Ошибка регистрации");
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:5000/login", {
        username,
        password,
      });
      setToken(response.data.token);
      setMessage("Успешный вход");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Ошибка входа");
    }
  };

  const handleSubmit = () => {
    if (isLoginActive) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  const fetchProtectedData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/protected", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(response.data.message);
      setPayload(response.data);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Ошибка доступа");
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <div>
        <div className="cursor-pointer border-1 p-2 rounded-xl border-gray-300 h-80 w-80 relative">
          <div className="mt-4 px-10 *:cursor-pointer relative">
            <button
              className={`${isLoginActive ? "text-black" : "text-white"} text-lg`}
              onClick={() => setIsLoginActive(false)}
            >
              Регистрация
            </button>
            <button
              className={`${isLoginActive ? "text-white" : "text-black"} ml-12 text-lg`}
              onClick={() => setIsLoginActive(true)}
            >
              Вход
            </button>
            <div
              className={`${isLoginActive ? "translate-x-30 duration-300" : "translate-x-0 duration-300"} transition w-30 translate-x-0 left-8 h-8 bg-black rounded-xl absolute top-0 -z-100`}
            ></div>
          </div>
          <div className="mt-0 mx-auto w-3/4 flex flex-col justify-center h-45">
            <div>
              <input
                type="text"
                placeholder="Логин"
                className="text-lg px-2 py-1 focus:outline-blue-300 focus:border-0 placeholder-gray-500 text-gray-700 w-full border-1 border-gray-300 rounded-xl"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="mt-2">
              <input
                type="password"
                className="text-lg focus:outline-blue-300 focus:border-0 px-2 py-1 placeholder-gray-500 text-gray-700 w-full  border-1 border-gray-300 rounded-xl"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="pt-4">
              <button
                className="text rounded-lg bg-blue-500 text-white px-2 py-1 cursor-pointer hover:transition hover:duration-200 hover:bg-blue-700/75 active:duration-100 active:scale-105"
                onClick={handleSubmit}
              >
                {isLoginActive ? "Войти" : "Создать аккаунт"}
              </button>
            </div>
          </div>
        </div>
        <br />

        <br />
        {token && (
          <button onClick={fetchProtectedData}>
            Получить защищённые данные
          </button>
        )}
        <p ref={errorRef}>{errorMessage}</p>
        <p ref={successRef}>{message}</p>
        {payload && <pre>{JSON.stringify(payload, null, 2)}</pre>}
        {payload && <p>{token}</p>}
      </div>
    </div>
  );
}
