import { useEffect, useState } from "react";

function Cart({ onBackToProducts }) {

    const [cart, setCart] = useState([]);

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/view_cart`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = await response.json();

        console.log("Cart response:", data);

        if (response.ok) {
            setCart(data.cart || []);
        } else {
            alert(data.detail || "Failed to load cart");
            setCart([]);
        }

    } catch (error) {
        console.error("Cart error:", error);
        setCart([]);
        alert("Could not connect to backend");
    }
};

  const deleteCart = async (productId) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/delete_cart/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        fetchCart();
      } else {
        alert(data.detail || "Failed to delete item");
      }
    } catch (error) {
      console.error(error);
      alert("Could not connect to backend");
    }
  };

  return (
    <div className="page-card">

      <div className="page-header">
        <div>
          <h2>My Cart</h2>

          <p className="page-description">
            Review the products you've added.
          </p>
        </div>

        <button
          className="back-button"
          onClick={onBackToProducts}
        >
          ← Continue Shopping
        </button>
      </div>

      {cart.length === 0 ? (

        <div className="empty-cart">
          <div className="empty-cart-icon">
            🛒
          </div>

          <h3>Your cart is empty</h3>

          <p>
            Add some products to get started.
          </p>

          <button onClick={onBackToProducts}>
            Browse Products
          </button>
        </div>

      ) : (

        <table className="data-table cart-table">

          <thead>
            <tr>
              <th>Image</th>
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
                <td>{item[5]?(
                  <img
        src={`http://127.0.0.1:8000/uploads/${item[5]}`}
        alt={item[1]}
        className="cart-product-image"/>
                ):(
                  <span>No image</span>
                )}</td>
                <td>
                  <strong>{item[1]}</strong>
                </td>

                <td>{item[2]}</td>

                <td>
                  <strong>₹{item[3]}</strong>
                </td>

                <td>{item[4]}</td>

                <td>
                  <button
                    className="delete-button"
                    onClick={() => deleteCart(item[0])}
                  >
                    Delete
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      )}

    </div>
  );
}

export default Cart;