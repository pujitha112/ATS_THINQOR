import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function CandidateApplicationUI() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth || {});

  // -------------------------------
  // FORM STATES
  // -------------------------------
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    skills: "",
    education: "",
    experience: "",
    ctc: "",
    ectc: "",
  });

  const [resume, setResume] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [editCandidateId, setEditCandidateId] = useState(null);
  const [message, setMessage] = useState("");

  const [requirementsOptions, setRequirementsOptions] = useState([]);
  const [requirementsLoading, setRequirementsLoading] = useState(false);

  const recruiterIdFromQuery = searchParams.get("recruiterId");
  const createdByUserId = recruiterIdFromQuery
    ? parseInt(recruiterIdFromQuery)
    : user?.id || null;

  // -------------------------------
  // FETCH CANDIDATES LIST
  // -------------------------------
  const fetchCandidates = async () => {
    try {
      const params = new URLSearchParams();
      if (user?.id) {
        params.append("user_id", user.id);
        params.append("user_role", user.role || "");
      }

      const res = await fetch(`http://localhost:5000/get-candidates?${params}`);
      if (!res.ok) throw new Error("Failed fetching candidates");
      const data = await res.json();
      setCandidates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch candidates error:", err);
      setCandidates([]);
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchRequirements();
  }, [user]);

  const fetchRequirements = async () => {
    setRequirementsLoading(true);
    try {
      let data = [];
      // If Recruiter, fetch ONLY assigned requirements
      if (user?.role === "RECRUITER" || user?.role === "recruiter") {
        const res = await fetch(`http://localhost:5000/users/${user.id}/details`);
        const userDetails = await res.json();
        const assigned = userDetails.assigned_requirements || [];

        // Map to ensure we have the correct ID (requirement_id)
        data = assigned.map((r) => ({
          ...r,
          id: r.requirement_id || r.id,
        }));
      } else {
        // Admin/DM: Fetch ALL requirements
        const res = await fetch("http://localhost:5000/get-requirements");
        data = await res.json();
      }

      setRequirementsOptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch requirements:", err);
      setRequirementsOptions([]);
    } finally {
      setRequirementsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    setResume(e.target.files?.[0] || null);
  };

  // -------------------------------
  // ADD / UPDATE CANDIDATE
  // -------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v ?? ""));
    if (resume) data.append("resume", resume);

    if (!editCandidateId && createdByUserId) {
      data.append("created_by", createdByUserId);
    }

    const url = editCandidateId
      ? `http://localhost:5000/update-candidate/${editCandidateId}`
      : "http://localhost:5000/submit-candidate";
    const method = editCandidateId ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, body: data });
      const result = await res.json();

    const method = editCandidateId ? "PUT" : "POST";

        const fromState = window.history.state?.usr?.from;
        if (fromState === "/recruiter-dashboard") {
          setTimeout(() => navigate("/recruiter-dashboard"), 1200);
        }
      } else {
        setMessage(result.message || "Failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server offline. Check backend.");
    }
  };

  // -------------------------------
  // EDIT CANDIDATE
  // -------------------------------
  const handleEdit = (candidate) => {
    setEditCandidateId(candidate.id);
    setFormData({
      name: candidate.name || "",
      email: candidate.email || "",
      phone: candidate.phone || "",
      skills: candidate.skills || "",
      education: candidate.education || "",
      experience: candidate.experience || "",
      ctc: candidate.ctc || "",
      ectc: candidate.ectc || "",
    });
    setMessage("Editing candidate...");
  };

  // -------------------------------
  // DELETE CANDIDATE
  // -------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this candidate?")) return;

    try {
      const res = await fetch(`http://localhost:5000/delete-candidate/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (res.ok) {
        setMessage(result.message || "Deleted");
        fetchCandidates();
      } else {
        setMessage(result.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error.");
    }
  };

  // -------------------------------
  // RESET FORM
  // -------------------------------
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      skills: "",
      education: "",
      experience: "",
      ctc: "",
      ectc: "",
    });
    setResume(null);
    setEditCandidateId(null);
  };

  // ----------------------------------------------------
  // SCREENING (AI)
  // ----------------------------------------------------
  const [screenCandidate, setScreenCandidate] = useState(null);
  const [selectedRequirementId, setSelectedRequirementId] = useState("");
  const [requirementSearch, setRequirementSearch] = useState("");
  const [screenError, setScreenError] = useState("");
  const [showScreenModal, setShowScreenModal] = useState(false);
  const [screenLoading, setScreenLoading] = useState(false);
  const [screeningResult, setScreeningResult] = useState(null);

  // ----------------------------------------------------
  // TRACKER SECTION
  // ----------------------------------------------------
  const [trackerModalOpen, setTrackerModalOpen] = useState(false);
  const [trackerData, setTrackerData] = useState([]);
  const [trackerLoading, setTrackerLoading] = useState(false);
  const [trackCandidate, setTrackCandidate] = useState(null);

  const handleTrack = async (candidate) => {
    setTrackCandidate(candidate);
    setTrackerLoading(true);
    setTrackerModalOpen(true);
    try {
      const res = await fetch(`http://localhost:5000/api/candidate-tracker/${candidate.id}`);
      const data = await res.json();
      setTrackerData(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load tracker data");
    } finally {
      setTrackerLoading(false);
    }
  };

  const updateStageStatus = async (candidateId, requirementId, stageId, status, decision) => {
    console.log("🔄 Updating stage status:", { candidateId, requirementId, stageId, status, decision });

    try {
      const res = await fetch("http://localhost:5000/api/update-stage-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: candidateId,
          requirement_id: requirementId,
          stage_id: stageId,
          status,
          decision
        })
      });

      const responseData = await res.json();
      console.log("📥 Response:", responseData);

      if (res.ok) {
        console.log("✅ Status updated successfully, refreshing tracker data...");
        // Refresh data
        const refreshRes = await fetch(`http://localhost:5000/api/candidate-tracker/${candidateId}`);
        const data = await refreshRes.json();
        setTrackerData(data);
        console.log("✅ Tracker data refreshed");
      } else {
        console.error("❌ Update failed:", responseData);
        alert(`Failed to update status: ${responseData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("❌ Error updating status:", err);
      alert("Error updating status: " + err.message);
    }
  };

  const filteredRequirements = useMemo(() => {
    if (!requirementSearch) return requirementsOptions || [];
    return (requirementsOptions || []).filter((req) =>
      `${req.title} ${req.location} ${req.client_id || ""}`
        .toLowerCase()
        .includes(requirementSearch.toLowerCase())
    );
  }, [requirementsOptions, requirementSearch]);

  // fetch requirements when modal opens (if not already loaded)
  useEffect(() => {
    if (showScreenModal && requirementsOptions.length === 0) {
      fetchRequirements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showScreenModal]);

  const openScreenModal = (candidate) => {
    setScreenCandidate(candidate);
    setSelectedRequirementId("");
    setRequirementSearch("");
    setScreenError("");
    setShowScreenModal(true);
  };

  const handleScreenCandidate = async () => {
    if (!screenCandidate || !selectedRequirementId) {
      setScreenError("Please select a requirement to compare against.");
      return;
    }

    setScreenLoading(true);
    setScreenError("");

    try {
      const response = await fetch("http://localhost:5000/api/screen-candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: screenCandidate.id,
          requirement_id: selectedRequirementId,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setScreenError(data.error || "AI screening failed");
      } else {
        setScreeningResult(data.result || data);
        setShowScreenModal(false);
      }
    } catch (error) {
      console.error(error);
      setScreenError("Server error. Check backend.");
    } finally {
      setScreenLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white shadow-lg rounded-2xl space-y-10">

      <div>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
          {editCandidateId ? "✏ Edit Candidate" : "🧾 Candidate Application"}
        </h2>

        {message && (
          <p className="text-center text-green-600 font-medium">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                type="text"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                type="tel"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Skills</label>
              <input
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                type="text"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-400"
              />
            </div>

          <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
          <InputField label="Email" name="email" value={formData.email} onChange={handleChange} type="email" required />
          <InputField label="Phone" name="phone" value={formData.phone} onChange={handleChange} type="tel" />
          <InputField label="Skills" name="skills" value={formData.skills} onChange={handleChange} />

          <InputField label="Current CTC (LPA)" name="ctc" value={formData.ctc} onChange={handleChange} type="number" />
          <InputField label="Expected CTC (LPA)" name="ectc" value={formData.ectc} onChange={handleChange} type="number" />
        </div>

        <TextAreaField label="Education Summary" name="education" value={formData.education} onChange={handleChange} />
        <TextAreaField label="Experience Summary" name="experience" value={formData.experience} onChange={handleChange} />

        {/* Resume Upload */}
        <div>
          <label className="block text-sm font-medium mb-1">Upload Resume</label>
          <div className="border-dashed border-2 border-gray-300 rounded-lg p-6 text-center">
            <input type="file" id="resume" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
            <label htmlFor="resume" className="cursor-pointer text-green-600 hover:underline">
              {editCandidateId ? "Upload new resume (optional)" : "Click to upload resume"}
            </label>
            {resume && <p className="text-sm text-gray-700 mt-2">{resume.name}</p>}
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
            {editCandidateId ? "Update Candidate" : "Submit Application"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="border border-gray-300 px-6 py-2 rounded-lg"
          >
            Clear
          </button>
        </div>
      </form>

      {/* ---------------------- CANDIDATE LIST ---------------------- */}
      <h3 className="text-xl font-semibold mb-4">Candidate List</h3>

      {candidates.length === 0 ? (
        <p className="text-gray-500">No candidates found.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-green-100 text-left">
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Phone</th>
              <th className="p-3 border">Skills</th>
              <th className="p-3 border">CTC</th>
              <th className="p-3 border">ECTC</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {candidates.map((candidate) => (
              <tr key={candidate.id} className="hover:bg-gray-50">
                <td className="p-3 border">{candidate.name}</td>
                <td className="p-3 border">{candidate.email}</td>
                <td className="p-3 border">{candidate.phone}</td>
                <td className="p-3 border">{candidate.skills}</td>
                <td className="p-3 border">{candidate.ctc}</td>
                <td className="p-3 border">{candidate.ectc}</td>
                <td className="p-3 border flex gap-2">

                  <button onClick={() => handleEdit(candidate)} className="bg-blue-500 text-white px-3 py-1 rounded">
                    Edit
                  </button>

                  <button onClick={() => handleDelete(candidate.id)} className="bg-red-500 text-white px-3 py-1 rounded">
                    Delete
                  </button>

                  <button onClick={() => openScreenModal(candidate)} className="bg-green-600 text-white px-3 py-1 rounded">
                    Screen
                  </button>

                </td>
              </tr>
            </thead>

            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50">
                  <td className="p-3 border">{candidate.name}</td>
                  <td className="p-3 border">{candidate.email}</td>
                  <td className="p-3 border">{candidate.phone}</td>
                  <td className="p-3 border">{candidate.skills}</td>
                  <td className="p-3 border">{candidate.ctc}</td>
                  <td className="p-3 border">{candidate.ectc}</td>
                  <td className="p-3 border flex gap-2">
                    <button
                      onClick={() => handleEdit(candidate)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(candidate.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>

                    <button
                      onClick={() => openScreenModal(candidate)}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Screen
                    </button>

                    <button
                      onClick={() => handleTrack(candidate)}
                      className="bg-purple-600 text-white px-3 py-1 rounded"
                    >
                      Track
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ---------------------- SCREENING MODAL ---------------------- */}
      {showScreenModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 relative">
            <button
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              onClick={() => {
                setShowScreenModal(false);
                setScreenError("");
              }}
            >
              ✕
            </button>

            <h3 className="text-xl font-semibold mb-2">
              Select Requirement for {screenCandidate?.name}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Choose which requirement you want to compare this candidate against.
            </p>

            <input
              type="text"
              value={requirementSearch}
              onChange={(e) => setRequirementSearch(e.target.value)}
              placeholder="Search by title, client, location..."
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />

            <div className="max-h-56 overflow-y-auto space-y-2 border rounded-lg p-2">
              {requirementsLoading ? (
                <p className="text-center text-gray-500 py-4">Loading requirements...</p>
              ) : filteredRequirements.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  No matching requirements found.
                </p>
              ) : (
                filteredRequirements.map((req) => (
                  <button
                    key={req.id}
                    type="button"
                    onClick={() => setSelectedRequirementId(req.id)}
                    className={`w-full text-left border rounded-lg px-3 py-2 transition ${selectedRequirementId === req.id
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-400"
                      }`}
                  >
                    <div className="flex justify-between text-sm font-medium">
                      <span>{req.title}</span>
                      <span className="text-gray-500">{req.location || "--"}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      ID: {req.id} • Skills: {req.skills_required || "--"}
                    </p>
                  </button>
                ))
              )}
            </div>

      {/* ---------------------- SCREENING RESULT MODAL ---------------------- */}
      {screeningResult && (
        <ScreeningResultModal
          screeningResult={screeningResult}
          setScreeningResult={setScreeningResult}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------
   SMALL INPUT COMPONENTS
------------------------------------------------------------ */
function InputField({ label, name, value, onChange, type = "text", required }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        required={required}
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-400"
      />
    </div>
  );
}

function TextAreaField({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows="3"
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-400"
      />
    </div>
  );
}

/* ------------------------------------------------------------
   SCREENING MODAL
------------------------------------------------------------ */
function ScreeningModal({
  screenCandidate,
  requirementSearch,
  setRequirementSearch,
  filteredRequirements,
  requirementsLoading,
  selectedRequirementId,
  setSelectedRequirementId,
  screenError,
  setShowScreenModal,
  handleScreenCandidate,
  screenLoading,
}) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 relative">
        <button
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          onClick={() => setShowScreenModal(false)}
        >
          ✕
        </button>

        <h3 className="text-xl font-semibold mb-2">Select Requirement for {screenCandidate?.name}</h3>
        <p className="text-sm text-gray-500 mb-4">Choose which requirement you want to compare this candidate against.</p>

        <input
          type="text"
          value={requirementSearch}
          onChange={(e) => setRequirementSearch(e.target.value)}
          placeholder="Search by title, client, location..."
          className="w-full border rounded-lg px-3 py-2 mb-3"
        />

        <div className="max-h-56 overflow-y-auto space-y-2 border rounded-lg p-2">
          {requirementsLoading ? (
            <p className="text-center text-gray-500 py-4">Loading requirements...</p>
          ) : filteredRequirements.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No matching requirements found.</p>
          ) : (
            filteredRequirements.map((req) => (
              <button
                key={req.id}
                type="button"
                onClick={() => setSelectedRequirementId(req.id)}
                className={`w-full text-left border rounded-lg px-3 py-2 transition ${
                  selectedRequirementId === req.id ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <div className="flex justify-between text-sm font-medium">
                  <span>{req.title}</span>
                  <span className="text-gray-500">{req.location || "--"}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">ID: {req.id} • Skills: {req.skills_required || "--"}</p>
              </button>
            ))
          )}
        </div>

      {/* Screening Result Modal */}
      {screeningResult && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              onClick={() => setScreeningResult(null)}
            >
              ✕
            </button>

            <h3 className="text-2xl font-semibold mb-4 text-center">
              🤖 AI Screening Result
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">AI Score</p>
                <p className="text-3xl font-bold text-gray-800">
                  {screeningResult.score}/100
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Recommendation</p>
                <span
                  className={`px-4 py-1 rounded-full text-sm font-semibold ${screeningResult.recommend === "SHORTLISTED"
                    ? "bg-green-100 text-green-700"
                    : screeningResult.recommend === "REJECTED"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                    }`}
                >
                  {screeningResult.recommend}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">📌 Rationale</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {screeningResult.rationale?.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {screeningResult.red_flags?.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">⚠ Red Flags</p>
                  <ul className="list-disc list-inside text-red-600 space-y-1">
                    {screeningResult.red_flags.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Recommendation</p>
            <span className={`px-4 py-1 rounded-full text-sm font-semibold ${
              screeningResult.recommend === "SHORTLISTED"
                ? "bg-green-100 text-green-700"
                : screeningResult.recommend === "REJECTED"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}>{screeningResult.recommend}</span>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">📌 Rationale</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {screeningResult.rationale?.map((item, idx) => (<li key={idx}>{item}</li>))}
            </ul>
          </div>

          {screeningResult.red_flags?.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-1">⚠ Red Flags</p>
              <ul className="list-disc list-inside text-red-600 space-y-1">
                {screeningResult.red_flags.map((item, idx) => (<li key={idx}>{item}</li>))}
              </ul>
            </div>
          )}
        </div>
      )}
      {/* Tracker Modal */}
      {trackerModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 text-xl"
              onClick={() => setTrackerModalOpen(false)}
            >
              ✕
            </button>

            <h3 className="text-2xl font-bold mb-6 text-gray-800">Candidate Tracker</h3>

            {trackerLoading ? (
              <p className="text-center py-10 text-gray-500">Loading tracker details...</p>
            ) : trackerData.length === 0 ? (
              <p className="text-center py-10 text-gray-500">
                No active tracking found for this candidate. Screen them against a requirement first.
              </p>
            ) : (
              <div className="space-y-8">
                {trackerData.map((item, idx) => (
                  <div key={idx} className="border rounded-xl p-6 bg-gray-50 shadow-sm">
                    <div className="flex justify-between items-start mb-4 border-b pb-4">
                      <div>
                        <h4 className="text-xl font-semibold text-indigo-700">{item.requirement.title}</h4>
                        <p className="text-sm text-gray-600">
                          {item.requirement.client_name} • {item.requirement.no_of_rounds} Rounds
                        </p>
                      </div>
                      <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                        ID: {item.requirement.id}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-200">
                          <tr>
                            <th className="px-4 py-3 rounded-l-lg">Stage</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Decision</th>
                            <th className="px-4 py-3 rounded-r-lg">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.stages.map((stage) => (
                            <tr key={stage.stage_id} className="bg-white border-b hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-900">
                                {stage.stage_name}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                  ${stage.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                    stage.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                      stage.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-700'}`}>
                                  {stage.status}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {stage.decision}
                              </td>
                              <td className="px-4 py-3">
                                <select
                                  className="border rounded px-2 py-1 text-xs"
                                  value={stage.status}
                                  onChange={(e) => updateStageStatus(
                                    trackCandidate.id,
                                    item.requirement.id,
                                    stage.stage_id,
                                    e.target.value,
                                    stage.decision
                                  )}
                                >
                                  <option value="PENDING">Pending</option>
                                  <option value="IN_PROGRESS">In Progress</option>
                                  <option value="COMPLETED">Completed</option>
                                  <option value="REJECTED">Rejected</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
