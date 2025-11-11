import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchClients,
  createClient,
  updateClient,
  deleteClient,
  clearMessages,
} from "../auth/authSlice";

export default function Clients() {
  const dispatch = useDispatch();
  const { clients = [], loading, successMessage, error } = useSelector(
    (state) => state.auth
  );

  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    contact_person: "",
    location: "",
    phone: "",
    

  });

  const [editForm, setEditForm] = useState(null); // Stores client being edited

  const filtered = clients.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage || error) {
      setTimeout(() => dispatch(clearMessages()), 3000);
    }
  }, [successMessage, error, dispatch]);

  // ---------------- Add Client ----------------
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createClient(form)).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        setForm({ name: "",  email: "", contact_person: "", location: "", phone: "" });
        dispatch(fetchClients());
      }
    });
  };

  // ---------------- Edit Client ----------------
  const handleEdit = (client) => {
    setEditForm(client);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    dispatch(updateClient({ id: editForm.id, clientData: editForm })).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        setEditForm(null);
        dispatch(fetchClients());
      }
    });
  };

  // ---------------- Delete Client ----------------
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      dispatch(deleteClient(id)).then(() => dispatch(fetchClients()));
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">

      <h2 className="text-2xl font-bold mb-4">Client Management</h2>

      {/* Alerts */}
      {error && <p className="p-2 bg-red-100 text-red-600 rounded">{error}</p>}
      {successMessage && <p className="p-2 bg-green-100 text-green-700 rounded">{successMessage}</p>}

      {/* Add New Client */}
      <div className="bg-white shadow rounded p-5 mb-6">
        <h3 className="text-lg font-semibold mb-3">Add New Client</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input type="text" placeholder="Client Name *" className="border p-2 rounded"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input type="text" placeholder="Contact Person" className="border p-2 rounded"
            value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
          <input type="email" placeholder="Email" className="border p-2 rounded"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input type="text" placeholder="Phone" className="border p-2 rounded"
            value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input type="text" placeholder="Location" className="border p-2 rounded"
            value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <button type="submit" disabled={loading} className="bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
            {loading ? "Saving..." : "Add Client"}
          </button>
        </form>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input type="text" placeholder="🔍 Search Clients by Name/Email" className="border p-2 rounded w-full"
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Clients List */}
      <div className="bg-white shadow rounded p-5">
        <h3 className="font-semibold text-lg mb-3">Clients List</h3>
        <table className="w-full border text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2 border">Client</th>
              <th className="p-2 border">Contact Person</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Location</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="p-2 border">{c.name}</td>
                <td className="p-2 border">{c.contact_person || "-"}</td>
                <td className="p-2 border">{c.email || "-"}</td>
                <td className="p-2 border">{c.phone || "-"}</td>
                <td className="p-2 border">{c.address || "-"}</td>
                <td className="p-2 border space-x-2">
                  <button onClick={() => handleEdit(c)} className="bg-yellow-400 px-2 py-1 rounded hover:bg-yellow-500">Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="bg-red-500 px-2 py-1 rounded text-white hover:bg-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal/Form */}
      {editForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">Edit Client</h3>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 gap-3">
              <input type="text" placeholder="Client Name *" className="border p-2 rounded"
                value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
              <input type="text" placeholder="Contact Person" className="border p-2 rounded"
                value={editForm.contact_person} onChange={(e) => setEditForm({ ...editForm, contact_person: e.target.value })} />
              <input type="email" placeholder="Email" className="border p-2 rounded"
                value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              <input type="text" placeholder="Phone" className="border p-2 rounded"
                value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              <input type="text" placeholder="Location" className="border p-2 rounded"
                value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
              <div className="flex justify-end space-x-2 mt-2">
                <button type="button" onClick={() => setEditForm(null)} className="px-3 py-1 rounded border hover:bg-gray-100">Cancel</button>
                <button type="submit" className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}