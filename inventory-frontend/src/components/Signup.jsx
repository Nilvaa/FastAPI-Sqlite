import { useState } from "react";

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_URL}/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setUsername("");
        setPassword("");
      } else {
        setMessage(data.detail || "Signup failed");
      }
    } catch (error) {
      setMessage("Could not connect to backend");
    }
  };

  return (
    <div className="auth-form">

      <h2>Create Account</h2>
      <p className="form-subtitle">
        Sign up to manage your inventory
      </p>

      <form onSubmit={handleSignup}>

        <label>Username</label>

        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label>Password</label>

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="primary-button"
        >
          Sign Up
        </button>

      </form>

      {message && (
        <p className="message">
          {message}
        </p>
      )}

    </div>
  );
}

export default Signup;