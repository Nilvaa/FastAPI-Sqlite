import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import "./App.css";

import Signup from "./components/Signup";
import Login from "./components/Login";
import Products from "./components/Products";
import Cart from "./components/Cart";
import AdminPanel from "./components/AdminPanel";

function App() {
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [showCart, setShowCart] = useState(false);

  const handleLogin = () => {
    setLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setShowCart(false);
  };

  if (!loggedIn) {
    return (
      <div className="app">
        <h1>Inventory Management System</h1>

        <div className="auth-container">
          <div className="form-box">
            <Signup />
          </div>

          <div className="form-box">
            <Login onLogin={handleLogin} />
          </div>
        </div>
      </div>
    );
  }

  const token = localStorage.getItem("token");
  const decodedToken = jwtDecode(token);

  if (decodedToken.userRole === "admin") {
    return (
      <div className="app">
        <h1>Inventory Management System</h1>

        <AdminPanel onLogout={logout} />
      </div>
    );
  }

  return (
    <div className="app">
      <h1>Inventory Management System</h1>

      {!showCart ? (
        <Products onGoToCart={() => setShowCart(true)} />
      ) : (
        <Cart onBackToProducts={() => setShowCart(false)} />
      )}

      <button className="logout-button" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

export default App;