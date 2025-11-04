import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function DmDashboard() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // ✅ Protect route
  useEffect(() => {
    if (!user) navigate("/");
    if (user?.role !== "DELIVERY_MANAGER") navigate("/");
  }, [user, navigate]);

  const stats = [
    { label: "Total Requirements", value: 12 },
    { label: "Open Requirements", value: 8 },
    { label: "Closed Requirements", value: 4 },
    { label: "Assigned to Recruiters", value: 6 },
  ];

  const actions = [
    { label: "Create Requirement", onClick: () => navigate("/create-requirement") },
    { label: "Requirement Allocation", onClick: () => navigate("/requirements") },
  ];

  const recentRequirements = [
    { id: 1, title: "Java Developer", status: "Open", date: "2025-01-05" },
    { id: 2, title: "React Engineer", status: "Assigned", date: "2025-01-04" },
    { id: 3, title: "Salesforce Admin", status: "Open", date: "2025-01-03" },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Delivery Manager Dashboard</h2>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, index) => (
          <div key={index} className="bg-white p-5 shadow rounded-xl">
            <p className="text-gray-500 text-sm">{s.label}</p>
            <h3 className="text-2xl font-bold text-indigo-600 mt-1">{s.value}</h3>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-5 rounded-xl shadow mb-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Quick Actions</h3>
        <div className="flex gap-4 flex-wrap">
          {actions.map((a, index) => (
            <button
              key={index}
              onClick={a.onClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Requirements */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Recent Requirements</h3>

        <table className="w-full text-left border mt-2">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-2">Title</th>
              <th className="p-2">Status</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentRequirements.map((req) => (
              <tr key={req.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{req.title}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    req.status === "Open"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {req.status}
                  </span>
                </td>
                <td className="p-2">{req.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
