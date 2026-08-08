import { useEffect, useState } from "react";

function Products({ onGoToCart }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch("http://127.0.0.1:8000/view_products", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      setProducts(data.data);
    } else {
      alert("Failed to load products");
    }
  };

  const addToCart = async (productId) => {
    const token = localStorage.getItem("token");

    const response = await fetch("http://127.0.0.1:8000/add_cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        pdt_id: productId,
        quantity: 1,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message);
    } else {
      alert(data.message || "Failed to add to cart");
    }
  };

  return (
    <div className="section">
      <h2>Products</h2>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr key={product[0]}>
              <td>{product[0]}</td>
              <td>{product[1]}</td>
              <td>{product[2]}</td>
              <td>{product[3]}</td>
              <td>₹{product[4]}</td>
              <td>
                <button onClick={() => addToCart(product[0])}>
                  Add to Cart
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="cart-button" onClick={onGoToCart}>
        Go to Cart
      </button>
    </div>
  );
}

export default Products;