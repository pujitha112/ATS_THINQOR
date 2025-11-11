import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  clearMessages,
} from "../auth/authSlice";

export default function Users() {
  const dispatch = useDispatch();
  const { usersList = [], loading, successMessage, error } = useSelector(
    (state) => state.auth
  );

  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    password: "",
    status: "active",
  });

  // ✅ Corrected fetchUsers call
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => dispatch(clearMessages()), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, dispatch]);

  const safeUsers = Array.isArray(usersList) ? usersList : [];
  const filtered = safeUsers.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      dispatch(updateUser({ id: editingUser.id, ...form })).then((res) => {
        if (res.meta.requestStatus === "fulfilled") {
          setEditingUser(null);
          setForm({ name: "", email: "", phone: "", role: "", password: "" });
          dispatch(fetchUsers());
        }
      });
    } else {
      dispatch(createUser(form)).then((res) => {
        if (res.meta.requestStatus === "fulfilled") {
          setForm({ name: "", email: "", phone: "", role: "", password: "" });
          dispatch(fetchUsers());
        }
      });
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      password: "", // optional
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      dispatch(deleteUser(id)).then(() => dispatch(fetchUsers()));
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>

      {error && <p className="p-2 bg-red-100 text-red-600 rounded">{error}</p>}
      {successMessage && (
        <p className="p-2 bg-green-100 text-green-700 rounded">{successMessage}</p>
      )}

      {/* Add/Edit Form */}
      <div className="bg-white shadow rounded p-5 mb-6">
        <h3 className="text-lg font-semibold mb-3">
          {editingUser ? "Edit User" : "Add New User"}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Full Name *"
            className="border p-2 rounded"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email *"
            className="border p-2 rounded"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Phone Number *"
            className="border p-2 rounded"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Role"
            className="border p-2 rounded"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          />
          <input
            type="password"
            placeholder={editingUser ? "New Password (optional)" : "Password *"}
            className="border p-2 rounded"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={!editingUser}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
            >
              {loading ? "Saving..." : editingUser ? "Update User" : "Add User"}
            </button>
            {editingUser && (
              <button
                type="button"
                onClick={() => {
                  setEditingUser(null);
                  setForm({ name: "", email: "", phone: "", role: "", password: "" });
                }}
                className="bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Search Users by Name / Email / Role / Phone"
          className="border p-2 rounded w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded p-5">
        <h3 className="font-semibold text-lg mb-3">Users List</h3>
        <table className="w-full border text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="p-2 border">{u.name}</td>
                <td className="p-2 border">{u.email}</td>
                <td className="p-2 border">{u.phone || "-"}</td>
                <td className="p-2 border">{u.role || "-"}</td>
                <td className="p-2 border text-center">
                  <button
                    onClick={() => handleEdit(u)}
                    className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="p-2 border text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}