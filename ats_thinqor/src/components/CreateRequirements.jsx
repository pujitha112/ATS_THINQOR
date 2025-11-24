import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createRequirement, fetchClients } from "../auth/authSlice";

export default function CreateRequirements() {
  const dispatch = useDispatch();
  const [jdText, setJdText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const { user, clients } = useSelector((state) => state.auth);

  // Requirement form
  const [form, setForm] = useState({
    client_id: "",
    title: "",
    description: "",
    location: "",
    skills_required: "",
    experience_required: "",
    ctc_range: "",
  });

  // OPTIONAL auto-data from AI
  const [autoData, setAutoData] = useState(null);

  // ---------------- AI AUTOFILL ----------------
  async function handleAutoFill() {
    if (!jdText.trim()) {
      alert("Please enter a job description first");
      return;
    }

    setAiLoading(true);
    setAiError(null);

    try {
      const res = await fetch("http://127.0.0.1:5000/api/ai/jd-to-requirement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd_text: jdText }),
      });

      const data = await res.json();

      if (data.error) {
        setAiError(data.error);
        return alert("AI Error: " + data.error);
      }

      if (data.suggested_requirement) {
        setAutoData(data.suggested_requirement);

        setForm(prev => ({
          ...prev,
          title: data.suggested_requirement.title || prev.title,
          location: data.suggested_requirement.location || prev.location,
          skills_required: data.suggested_requirement.skills_required || prev.skills_required,
          experience_required: data.suggested_requirement.experience_required || prev.experience_required,
          ctc_range: data.suggested_requirement.ctc_range || prev.ctc_range,
          description: data.suggested_requirement.description || prev.description,
        }));

        alert("AI Auto-fill complete!");
      }
    } catch (err) {
      setAiError(err.message);
      alert("Error: " + err.message);
    } finally {
      setAiLoading(false);
    }
  }

  // Only admin and DM can create requirements
  const canCreate = ["ADMIN", "DELIVERY_MANAGER"].includes(user?.role);

  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  if (!canCreate) {
    return (
      <div className="flex justify-center mt-20 text-red-600 font-semibold">
        ❌ You are not allowed to create requirements
      </div>
    );
  }

  // ---------------- FORM HANDLERS ----------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      created_by: user?.id,
    };

    dispatch(createRequirement(payload))
      .unwrap()
      .then(() => {
        alert("Requirement Created Successfully!");

        setForm({
          client_id: "",
          title: "",
          description: "",
          location: "",
          skills_required: "",
          experience_required: "",
          ctc_range: "",
        });
      })
      .catch(() => alert("Error creating requirement"));
  };

  // ---------------- UI ----------------
  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-indigo-700 mb-6">
        Create New Requirement
      </h2>

      {/* AI Autofill */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <label className="block text-sm font-medium mb-2">
          📝 Paste Job Description (AI Auto-fill)
        </label>

        <div className="flex gap-2">
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the job description..."
            className="flex-1 border p-3 rounded h-32 resize-none"
          />

          <button
            type="button"
            onClick={handleAutoFill}
            disabled={aiLoading}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            {aiLoading ? "⏳ Processing..." : "✨ AI Fill"}
          </button>
        </div>

        {aiError && <p className="text-red-600 mt-2">{aiError}</p>}
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">

        {/* Client Dropdown */}
        <select
          name="client_id"
          value={form.client_id}
          onChange={handleChange}
          className="border p-2 rounded col-span-2"
          required
        >
          <option value="">Select Client</option>
          {clients?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input name="title" placeholder="Job Title" className="border p-2 rounded"
          value={form.title} onChange={handleChange} required />

        <input name="location" placeholder="Location" className="border p-2 rounded"
          value={form.location} onChange={handleChange} required />

        <input name="experience_required" placeholder="Experience (years)" className="border p-2 rounded"
          value={form.experience_required} onChange={handleChange} />

        <input name="skills_required" placeholder="Skills (comma separated)" className="border p-2 rounded"
          value={form.skills_required} onChange={handleChange} />

        <input name="ctc_range" placeholder="CTC Range" className="border p-2 rounded"
          value={form.ctc_range} onChange={handleChange} />

        {/* Description */}
        <textarea
          name="description"
          placeholder="Job Description"
          rows={4}
          className="border p-3 rounded col-span-2"
          value={form.description}
          onChange={handleChange}
        />

        <button className="bg-indigo-600 text-white py-2 rounded-lg col-span-2 hover:bg-indigo-700">
          Create Requirement
        </button>
      </form>
    </div>
  );
}
