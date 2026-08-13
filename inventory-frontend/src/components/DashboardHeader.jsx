function DashboardHeader({ username, role, onLogout }) {
  return (
    <div className="dashboard-header">

      <div className="header-title">
        <h1>Inventory Management System</h1>
        <p>{role === "admin" ? "Admin Dashboard" : "User Dashboard"}</p>
      </div>

      <div className="header-actions">
        <span className="username">
          👤 {username}
        </span>

        <button
          className="logout-button"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>

    </div>
  );
}

export default DashboardHeader;