import { useEffect, useState } from "react";

function Products({ onGoToCart }) {

  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  // -------------------------
  // FETCH PRODUCTS
  // -------------------------

  const fetchProducts = async () => {

    const token = localStorage.getItem("token");

    try {

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/view_products`,
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


  // -------------------------
  // ADD TO CART
  // -------------------------

  const addToCart = async (productId) => {

    const token = localStorage.getItem("token");

    try {

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/add_cart`,
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

        alert(
          data.detail ||
          data.message ||
          "Failed to add product"
        );

      }

    } catch (error) {

      console.error("Error:", error);
      alert("Could not connect to backend");

    }
  };


  // -------------------------
  // UI
  // -------------------------

  return (

    <div className="page-card">

      {/* HEADER */}

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


      {/* PRODUCT TABLE */}

      <div className="table-container">

        <div className="product-grid">

  {products.length === 0 ? (

    <p className="no-products">
      No products available
    </p>

  ) : (

    products.map((product) => (

      <div className="product-card" key={product[0]}>

        {/* IMAGE */}

        <div className="product-image-container">

          {product[5] ? (
            <img
              src={`${import.meta.env.VITE_API_URL}/uploads/${product[5]}`}
              alt={product[1]}
              className="product-card-image"
            />
          ) : (
            <div className="no-image">
              No Image
            </div>
          )}

        </div>


        {/* DETAILS */}

        <div className="product-card-body">

          <p className="product-category">
            {product[2]}
          </p>

          <h3>
            {product[1]}
          </h3>

          <p className="product-price">
            ₹{product[4]}
          </p>

          <span className="stock-badge">
            {product[3]} available
          </span>


          {/* BUTTON */}

          <button
            className="add-button product-cart-button"
            onClick={() => addToCart(product[0])}
            disabled={product[3] <= 0}
          >

            {product[3] <= 0
              ? "Out of Stock"
              : "Add to Cart"}

          </button>

        </div>

      </div>

    ))

  )}

</div>

      </div>

    </div>

  );
}

export default Products;