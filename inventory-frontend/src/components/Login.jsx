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
        localStorage.setItem("token", data.access_token);

        alert("Login successful");

        onLogin();
      } else {
        if (Array.isArray(data.detail)) {
          alert(data.detail.map((error) => error.msg).join("\n"));
        } else {
          alert(data.detail || "Login failed");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Could not connect to backend");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      <form onSubmit={login}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;