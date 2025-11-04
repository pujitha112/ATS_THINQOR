import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRequirements, fetchClients } from "../auth/authSlice";
import { useNavigate } from "react-router-dom";

export default function Requirements() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, requirements, clients, loading } = useSelector((state) => state.auth);

  const [selectedClient, setSelectedClient] = useState("");

  // Fetch requirements + clients on load
  useEffect(() => {
    dispatch(fetchRequirements());
    dispatch(fetchClients());
  }, [dispatch]);

  const canCreate = ["ADMIN", "DELIVERY_MANAGER"].includes(user?.role);

  // ✅ Filter by selected client
  const filteredRequirements = selectedClient
    ? requirements.filter((r) => r.client_id === Number(selectedClient))
    : requirements;

  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Requirements</h2>

        {canCreate && (
          <button
            onClick={() => navigate("/create-requirement")}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            + New Requirement
          </button>
        )}
      </div>

      {/* ✅ Client Filter Dropdown */}
      <div className="flex gap-4 mb-4">
        <select
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm"
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
        >
          <option value="">All Clients</option>
          {clients?.map((client) => (
            <option key={client.id} value={client.id}>
              {client.client_name}
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center text-gray-500 py-10">
          ⏳ Loading requirements...
        </div>
      )}

      {/* Empty */}
      {!loading && filteredRequirements?.length === 0 && (
        <div className="text-center text-gray-600 py-10">
          ⚠️ No requirements found.
        </div>
      )}

      {/* Table */}
      {!loading && filteredRequirements?.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Location</th>
                <th className="px-4 py-2 text-left">Experience</th>
                <th className="px-4 py-2 text-left">Skills</th>
                <th className="px-4 py-2 text-left">Client</th>
                <th className="px-4 py-2 text-left">Created By</th>
                <th className="px-4 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequirements.map((req) => (
                <tr key={req.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{req.title}</td>
                  <td className="px-4 py-2">{req.location}</td>
                  <td className="px-4 py-2">{req.experience_required} yrs</td>
                  <td className="px-4 py-2">{req.skills_required}</td>
                  <td className="px-4 py-2">
                    {clients?.find((c) => c.id === req.client_id)?.client_name || "--"}
                  </td>
                  <td className="px-4 py-2">{req.created_by}</td>
                  <td className="px-4 py-2 text-center">
                    <span className="px-2 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-700">
                      {req.status || "OPEN"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
