import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchClients,
  createClient,
  clearMessages,
} from "../auth/authSlice";

export default function Clients() {
  const dispatch = useDispatch();
  const { clients = [], loading, successMessage, error } = useSelector(
    (state) => state.auth
  );

  const [search, setSearch] = useState("");

  const filtered = clients.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const [form, setForm] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage || error) {
      setTimeout(() => dispatch(clearMessages()), 3000);
    }
  }, [successMessage, error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createClient(form)).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        setForm({
          name: "",
          contact_person: "",
          email: "",
          phone: "",
          address: "",
        });
        dispatch(fetchClients());
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-6">

      <h2 className="text-2xl font-bold mb-4">Client Management</h2>

      {/* Alerts */}
      {error && <p className="p-2 bg-red-100 text-red-600 rounded">{error}</p>}
      {successMessage && (
        <p className="p-2 bg-green-100 text-green-700 rounded">
          {successMessage}
        </p>
      )}

      {/* Add New Client */}
      <div className="bg-white shadow rounded p-5 mb-6">
        <h3 className="text-lg font-semibold mb-3">Add New Client</h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <input
            type="text"
            placeholder="Client Name *"
            className="border p-2 rounded"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <input
            type="text"
            placeholder="Contact Person"
            className="border p-2 rounded"
            value={form.contact_person}
            onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
          />

          <input
            type="email"
            placeholder="Email"
            className="border p-2 rounded"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="text"
            placeholder="Phone"
            className="border p-2 rounded"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <input
            type="text"
            placeholder="Location"
            className="border p-2 rounded"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
          >
            {loading ? "Saving..." : "Add Client"}
          </button>

        </form>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Search Clients by Name/Email"
          className="border p-2 rounded w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
