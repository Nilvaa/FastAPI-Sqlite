import { useState } from "react";

function AdminProductForm({ mode, product, onBack }) {

  const isEdit = mode === "edit";

  const [name, setName] = useState(
    isEdit ? product[1] : ""
  );

  const [category, setCategory] = useState(
    isEdit ? product[2] : ""
  );

  const [quantity, setQuantity] = useState(
    isEdit ? product[3] : ""
  );

  const [price, setPrice] = useState(
    isEdit ? product[4] : ""
  );

  const [loading, setLoading] = useState(false);

  // -------------------------
  // ADD PRODUCT
  // -------------------------

  const addProduct = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/products/",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            name: name,
            category: category,
            quantity: Number(quantity),
            price: Number(price),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Product added successfully");
        onBack();
      } else {
        alert(data.detail || "Failed to add product");
      }

    } catch (error) {
      console.error(error);
      alert("Could not connect to backend");
    }

    setLoading(false);
  };

  // -------------------------
  // EDIT PRODUCT
  // -------------------------

  const updateProduct = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const updateData = {
      quantity: Number(quantity),
      price: Number(price),
    };

    setLoading(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/update_product/${product[0]}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Product updated successfully");
        onBack();
      } else {
        alert(data.detail || "Failed to update product");
      }

    } catch (error) {
      console.error(error);
      alert("Could not connect to backend");
    }

    setLoading(false);
  };

  return (
    <div className="form-page">

      <div className="form-page-card">

        <div className="form-page-header">

          <div>
            <h2>
              {isEdit ? "Edit Product" : "Add Product"}
            </h2>

            <p>
              {isEdit
                ? `Update product #${product[0]}`
                : "Add a new product to the inventory"}
            </p>
          </div>

        </div>

        <form
          className="product-form"
          onSubmit={isEdit ? updateProduct : addProduct}
        >

          {/* PRODUCT NAME */}

          <div className="form-group">

            <label>Product Name</label>

            <input
              type="text"
              placeholder="Enter product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isEdit}
            />

          </div>

          {/* CATEGORY */}

          <div className="form-group">

            <label>Category</label>

            <input
              type="text"
              placeholder="Enter category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              disabled={isEdit}
            />

          </div>

          {/* QUANTITY */}

          <div className="form-group">

            <label>Quantity</label>

            <input
              type="number"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              required
            />

          </div>

          {/* PRICE */}

          <div className="form-group">

            <label>Price</label>

            <input
              type="number"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="1"
              required
            />

          </div>

          {/* BUTTONS */}

          <div className="form-actions">

            <button
              type="submit"
              className="primary-action"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : isEdit
                ? "Update Product"
                : "Add Product"}
            </button>

            <button
              type="button"
              className="cancel-action"
              onClick={onBack}
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default AdminProductForm;