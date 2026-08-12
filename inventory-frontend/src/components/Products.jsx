import { useEffect, useState } from "react";

function Products({ onGoToCart }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/view_products",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setProducts(data.data);
      } else {
        alert(data.detail || "Failed to load products");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Could not connect to backend");
    }
  };

  const addToCart = async (productId) => {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/add_cart",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pdt_id: productId,
          quantity: 1,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      alert(data.message || "Product added to cart");
    } else {
      alert(data.detail || data.message || "Failed to add product");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Could not connect to backend");
  }
};

  return (
    <div className="page-card">

      <div className="page-header">
        <div>
          <h2>Products</h2>

          <p className="page-description">
            Browse available products and add them to your cart.
          </p>
        </div>

        <button
          className="cart-button"
          onClick={onGoToCart}
        >
          🛒 Go to Cart
        </button>
      </div>

      <table className="data-table">

        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Stock</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {products.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No products available
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product[0]}>

                <td>#{product[0]}</td>

                <td>
                  <strong>{product[1]}</strong>
                </td>

                <td>{product[2]}</td>

                <td>
                  <span className="stock-badge">
                    {product[3]} available
                  </span>
                </td>

                <td>
                  <strong>₹{product[4]}</strong>
                </td>

                <td>
                  <button
                    onClick={() => addToCart(product[0])}
                  >
                    Add to Cart
                  </button>
                </td>

              </tr>
            ))
          )}

        </tbody>

      </table>

    </div>
  );
}

export default Products;