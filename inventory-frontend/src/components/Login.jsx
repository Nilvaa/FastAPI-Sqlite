import { useState } from "react";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            username: username,
            password: password,
          }),
        }
      );

      const data = await response.json();

      console.log("Login response:", data);

      if (response.ok) {
        localStorage.setItem(
          "token",
          data.access_token
        );

        alert("Login successful");

        onLogin();
      } else {
        if (Array.isArray(data.detail)) {
          alert(
            data.detail
              .map((error) => error.msg)
              .join("\n")
          );
        } else {
          alert(
            data.detail || "Login failed"
          );
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Could not connect to backend");
    }
  };

  return (
    <div className="auth-form">

      <h2>Welcome Back</h2>

      <p className="form-subtitle">
        Login to your account
      </p>

      <form onSubmit={login}>

        <label>Username</label>

        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
          required
        />

        <label>Password</label>

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          required
        />

        <button
          type="submit"
          className="primary-button"
        >
          Login
        </button>

      </form>

    </div>
  );
}

export default Login;