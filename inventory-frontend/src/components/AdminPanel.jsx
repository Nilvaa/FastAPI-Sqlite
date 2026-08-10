import { useEffect, useState } from "react";

function AdminPanel({ onLogout }) {
  const [products, setProducts] = useState([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const [editId, setEditId] = useState(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editPrice, setEditPrice] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const token = localStorage.getItem("token");

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
  };

  // ADD PRODUCT
  const addProduct = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

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
      alert("Product added");

      setName("");
      setCategory("");
      setQuantity("");
      setPrice("");

      setShowAddForm(false);

      fetchProducts();
    } else {
      alert(data.detail || "Failed to add product");
    }
  };

  // OPEN EDIT
  const openEdit = (product) => {
    setEditId(product[0]);
    setEditQuantity(product[3]);
    setEditPrice(product[4]);

    setShowEditForm(true);
    setShowAddForm(false);
  };

  // EDIT PRODUCT
  const updateProduct = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const updateData = {};

    if (editQuantity !== "") {
      updateData.quantity = Number(editQuantity);
    }

    if (editPrice !== "") {
      updateData.price = Number(editPrice);
    }

    const response = await fetch(
      `http://127.0.0.1:8000/update_product/${editId}`,
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
      alert("Product updated");

      setShowEditForm(false);
      setEditId(null);

      fetchProducts();
    } else {
      alert(data.detail || "Failed to update product");
    }
  };

  // DELETE PRODUCT
  const deleteProduct = async (productId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) {
      return;
    }

    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://127.0.0.1:8000/delete_product/${productId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      alert("Product deleted");

      fetchProducts();
    } else {
      alert(data.detail || "Failed to delete product");
    }
  };

  return (
    <div className="section">

      <h2>Admin Panel</h2>

      {/* PRODUCT TABLE */}

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Actions</th>
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
                <button onClick={() => openEdit(product)}>
                  Edit
                </button>

                <button
                  onClick={() => deleteProduct(product[0])}
                  style={{ marginLeft: "8px" }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ADD BUTTON */}

      <button
        onClick={() => {
          setShowAddForm(!showAddForm);
          setShowEditForm(false);
        }}
        style={{ marginTop: "20px" }}
      >
        Add Product
      </button>

      {/* ADD FORM */}

      {showAddForm && (
        <div className="admin-form">

          <h3>Add Product</h3>

          <form onSubmit={addProduct}>

            <input
              type="text"
              placeholder="Product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />

            <input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />

            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />

            <button type="submit">
              Add
            </button>

          </form>
        </div>
      )}

      {/* EDIT FORM */}

      {showEditForm && (
        <div className="admin-form">

          <h3>Edit Product</h3>

          <form onSubmit={updateProduct}>

            <input
              type="number"
              placeholder="Quantity"
              value={editQuantity}
              onChange={(e) => setEditQuantity(e.target.value)}
            />

            <input
              type="number"
              placeholder="Price"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
            />

            <button type="submit">
              Update
            </button>

          </form>
        </div>
      )}

      <hr />

      <button
        className="logout-button"
        onClick={onLogout}
      >
        Logout
      </button>

    </div>
  );
}

export default AdminPanel;  