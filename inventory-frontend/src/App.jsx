import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import "./App.css";

import Signup from "./components/Signup";
import Login from "./components/Login";
import Products from "./components/Products";
import Cart from "./components/Cart";
import AdminPanel from "./components/AdminPanel";
import AdminProductForm from "./components/AdminProductForm";

function App() {
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [showCart, setShowCart] = useState(false);

  const [authPage, setAuthPage] = useState("login");

  // Admin pages:
  // dashboard
  // add
  // edit
  const [adminPage, setAdminPage] = useState("dashboard");

  const [editProduct, setEditProduct] = useState(null);

  const handleLogin = () => {
    setLoggedIn(true);
    setAdminPage("dashboard");
  };

  const logout = () => {
    localStorage.removeItem("token");

    setLoggedIn(false);
    setShowCart(false);
    setAuthPage("login");
    setAdminPage("dashboard");
    setEditProduct(null);
  };

  // -------------------------
  // LOGIN / SIGNUP
  // -------------------------

  if (!loggedIn) {
    return (
      <div className="app auth-page">

        <div className="auth-card">

          {authPage === "login" ? (
            <Login onLogin={handleLogin} />
          ) : (
            <Signup />
          )}

          <div className="switch-auth">

            {authPage === "login" ? (
              <p>
                Don't have an account?{" "}
                <button
                  className="link-button"
                  onClick={() => setAuthPage("signup")}
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  className="link-button"
                  onClick={() => setAuthPage("login")}
                >
                  Login
                </button>
              </p>
            )}

          </div>

        </div>

      </div>
    );
  }

  // -------------------------
  // GET USER ROLE
  // -------------------------

  const token = localStorage.getItem("token");
  const decodedToken = jwtDecode(token);

  // -------------------------
  // ADMIN
  // -------------------------

  if (decodedToken.userRole === "admin") {

    // ADMIN DASHBOARD
    if (adminPage === "dashboard") {
      return (
        <div className="app">

          <div className="main-header">
            <div>
              <h1>Inventory Management System</h1>
              <p>Admin Dashboard</p>
            </div>
          </div>

          <AdminPanel
            onLogout={logout}
            onAddProduct={() => setAdminPage("add")}
            onEditProduct={(product) => {
              setEditProduct(product);
              setAdminPage("edit");
            }}
          />

        </div>
      );
    }

    // ADD PRODUCT PAGE
    if (adminPage === "add") {
      return (
        <div className="app">

          <div className="main-header">
            <div>
              <h1>Inventory Management System</h1>
              <p>Admin Dashboard</p>
            </div>
          </div>

          <AdminProductForm
            mode="add"
            onBack={() => setAdminPage("dashboard")}
          />

        </div>
      );
    }

    // EDIT PRODUCT PAGE
    if (adminPage === "edit") {
      return (
        <div className="app">

          <div className="main-header">
            <div>
              <h1>Inventory Management System</h1>
              <p>Admin Dashboard</p>
            </div>
          </div>

          <AdminProductForm
            mode="edit"
            product={editProduct}
            onBack={() => {
              setEditProduct(null);
              setAdminPage("dashboard");
            }}
          />

        </div>
      );
    }
  }

  // -------------------------
  // NORMAL USER
  // -------------------------

  return (
    <div className="app">

      <div className="main-header">
        <div>
          <h1>Inventory Management System</h1>
          <p>User Dashboard</p>
        </div>
      </div>

      {!showCart ? (
        <Products
          onGoToCart={() => setShowCart(true)}
        />
      ) : (
        <Cart
          onBackToProducts={() => setShowCart(false)}
        />
      )}

      <div className="logout-container">
        <button
          className="logout-button"
          onClick={logout}
        >
          Logout
        </button>
      </div>

    </div>
  );
}

export default App;