import React, { useEffect, useState } from "react";
import { ArrowLeft, Download } from "lucide-react";

export default function Reports() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("http://localhost:5000/api/reports/stats")
            .then((res) => res.json())
            .then((data) => {
                if (data.error) throw new Error(data.error);
                setStats(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-10 text-center">Loading reports...</div>;
    if (error) return <div className="p-10 text-center text-red-600">Error: {error}</div>;

    const { requirements, candidates, selections, client_stats } = stats;

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <a href="/admin-dashboard" className="text-gray-500 hover:text-gray-800">
                            <ArrowLeft size={24} />
                        </a>
                        <h1 className="text-2xl font-bold text-gray-800">Analytics & Reports</h1>
                    </div>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                        <Download size={18} /> Export PDF
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="text-gray-500 text-sm font-medium">Total Requirements</div>
                        <div className="text-3xl font-bold mt-2 text-gray-900">{requirements.total}</div>
                        <div className="mt-2 text-xs flex gap-3">
                            <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Open: {requirements.open_reqs}</span>
                            <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded">Closed: {requirements.closed_reqs}</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="text-gray-500 text-sm font-medium">Total Candidates</div>
                        <div className="text-3xl font-bold mt-2 text-gray-900">{candidates.total}</div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="text-gray-500 text-sm font-medium">Total Selections</div>
                        <div className="text-3xl font-bold mt-2 text-indigo-600">{selections.length}</div>
                        <div className="text-xs text-gray-400 mt-1">Candidates hired</div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="text-gray-500 text-sm font-medium">Active Clients</div>
                        <div className="text-3xl font-bold mt-2 text-gray-900">{client_stats.length}</div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Client Distribution */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold mb-6">Requirements by Client</h3>
                        <div className="space-y-4">
                            {client_stats.map((c, i) => {
                                const max = Math.max(...client_stats.map(x => x.req_count));
                                const width = max > 0 ? (c.req_count / max) * 100 : 0;
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{c.client_name || "Unknown"}</span>
                                            <span className="text-gray-500">{c.req_count} Reqs</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                                            <div
                                                className="bg-indigo-500 h-2.5 rounded-full"
                                                style={{ width: `${width}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )
                            })}
                            {client_stats.length === 0 && <div className="text-gray-400 text-center py-4">No data available</div>}
                        </div>
                    </div>

                    {/* Selections List (Mini) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold mb-6">Recent Selections</h3>
                        <div className="overflow-y-auto max-h-[300px] space-y-3">
                            {selections.length > 0 ? selections.map((s, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div>
                                        <div className="font-semibold text-gray-800">{s.candidate_name}</div>
                                        <div className="text-xs text-gray-500">{s.requirement_title} • {s.client_name}</div>
                                    </div>
                                    <div className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg">
                                        Selected
                                    </div>
                                </div>
                            )) : (
                                <div className="text-gray-400 text-center py-10">No selections yet</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Detailed Selections Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100">
                        <h3 className="text-lg font-semibold">Detailed Selection Report</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Candidate</th>
                                    <th className="px-6 py-3 font-medium">Requirement</th>
                                    <th className="px-6 py-3 font-medium">Client</th>
                                    <th className="px-6 py-3 font-medium">Selection Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {selections.map((s, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{s.candidate_name}</td>
                                        <td className="px-6 py-4 text-gray-600">{s.requirement_title}</td>
                                        <td className="px-6 py-4 text-gray-600">{s.client_name}</td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {s.selection_date ? new Date(s.selection_date).toLocaleDateString() : "-"}
                                        </td>
                                    </tr>
                                ))}
                                {selections.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                            No selection records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
}
