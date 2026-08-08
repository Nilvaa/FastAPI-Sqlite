import { useState } from "react";
import "./App.css";

import Signup from "./components/Signup";
import Login from "./components/Login";
import Products from "./components/Products";
import Cart from "./components/Cart";

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

  return (
    <div className="app">
      <h1>Inventory Management System</h1>

      <button className="logout-button" onClick={logout}>
        Logout
      </button>

      {!showCart ? (
        <Products onGoToCart={() => setShowCart(true)} />
      ) : (
        <Cart onBackToProducts={() => setShowCart(false)} />
      )}
    </div>
  );
}

export default App;