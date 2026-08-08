import { useEffect, useState } from "react";

function Cart({ onBackToProducts }) {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch("http://127.0.0.1:8000/view_cart", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      setCart(data.cart);
    } else {
      alert("Failed to load cart");
    }
  };

  const deleteCart = async (cartId) => {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://127.0.0.1:8000/delete_cart/${cartId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      alert(data.message);
      fetchCart();
    } else {
      alert(data.detail || "Failed to delete item");
    }
  };

  return (
    <div className="section">
      <h2>My Cart</h2>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {cart.map((item) => (
              <tr key={item[0]}>
                <td>{item[1]}</td>
                <td>{item[2]}</td>
                <td>₹{item[3]}</td>
                <td>{item[4]}</td>
                <td>
                  <button onClick={() => deleteCart(item[0])}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button className="back-button" onClick={onBackToProducts}>
        Back to Products
      </button>
    </div>
  );
}

export default Cart;