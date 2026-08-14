import { useEffect, useState } from "react";

function AdminPanel({
  onLogout,
  onAddProduct,
  onEditProduct
}) {

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

      console.error(error);
      alert("Could not connect to backend");

    }
  };

  // -------------------------
  // DELETE PRODUCT
  // -------------------------

  const deleteProduct = async (productId) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) {
      return;
    }

    const token = localStorage.getItem("token");

    try {

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/delete_product/${productId}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {

        alert("Product deleted successfully");

        fetchProducts();

      } else {

        alert(
          data.detail || "Failed to delete product"
        );

      }

    } catch (error) {

      console.error(error);
      alert("Could not connect to backend");

    }
  };

  return (
    <div className="page-card">

      {/* HEADER */}
      

      <div className="page-header">

        <div>

          <h2>Admin Dashboard</h2>

          <p className="page-description">
            Manage products, inventory and pricing.
          </p>

        </div>

        <button
          className="add-button"
          onClick={onAddProduct}
        >
          + Add Product
        </button>

      </div>

      {/* PRODUCT TABLE */}

      <div className="table-container">

        <table className="data-table">

          <thead>

            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>

          </thead>

          <tbody>

            {products.length === 0 ? (

              <tr>

                <td
                  colSpan="7"
                  className="no-products"
                >
                  No products available
                </td>

              </tr>

            ) : (

              products.map((product) => (

                <tr key={product[0]}>

                  <td>
                    #{product[0]}
                  </td>
                  <td>
                    {product[5]?(
                      <img src={`${import.meta.env.VITE_API_URL}/uploads/${product[5]}`} alt={product[1]} className="product-image" />
                    ):(
                      <span>No Image</span>
                    )}
                  </td>

                  <td>
                    <strong>
                      {product[1]}
                    </strong>
                  </td>

                  <td>
                    {product[2]}
                  </td>

                  <td>

                    <span className="stock-badge">
                      {product[3]} available
                    </span>

                  </td>

                  <td>

                    <strong>
                      ₹{product[4]}
                    </strong>

                  </td>

                  

                  <td>

                    <div className="action-buttons">

                      <button
                        className="edit-button"
                        onClick={() =>
                          onEditProduct(product)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() =>
                          deleteProduct(product[0])
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {/* LOGOUT */}

      

    </div>
  );
}

export default AdminPanel;