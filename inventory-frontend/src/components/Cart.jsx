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
       <div className="cart-products">
    {cart.map((item) => (
        <div className="cart-product-card" key={item[0]}>

            <div className="cart-product-image">
                <img
                    src={`${import.meta.env.VITE_API_URL}/uploads/${item[5]}`}
                    alt={item[1]}
                />
            </div>

            <div className="cart-product-info">
                <h3>{item[1]}</h3>
                <p className="category">{item[2]}</p>

                <div className="cart-product-details">
                    <span>₹{item[3]}</span>
                    <span>Quantity: {item[4]}</span>
                </div>
            </div>

            <button
                className="delete-btn"
                onClick={() => deleteCartItem(item[0])}
            >
                Delete
            </button>

        </div>
    ))}
</div>
      )}

    </div>
  );
}

export default Cart;