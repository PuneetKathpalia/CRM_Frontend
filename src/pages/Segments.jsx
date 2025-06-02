import { useState, useEffect } from "react";
import { API_BASE_URL as API_BASE } from '../config/api';

const Segments = () => {
  const [segmentName, setSegmentName] = useState("");
  const [rules, setRules] = useState({
    totalSpend: { operator: "gt", value: 5000 },
    visits: { operator: "lt", value: 3 },
    inactiveDays: 90,
  });
  const [segments, setSegments] = useState([]);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchSegments = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/segments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch segments");
        const data = await res.json();
        setSegments(data);
      } catch (err) {
        console.error("Error fetching segments:", err);
        alert("Failed to load segments.");
      } finally {
        // Assuming no separate loading state needed for just fetching the list initially
      }
    };

    if (token) {
      fetchSegments();
    }
  }, [token]);

  const handlePreview = async () => {
    try {
      setIsPreviewLoading(true);
      const res = await fetch(`${API_BASE}/api/segments/preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rules }),
      });
      const data = await res.json();
      setPreview(data);
    } catch (error) {
      console.error("Preview failed:", error);
      alert("Failed to preview segment. Please try again.");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!segmentName.trim()) {
      alert("Please enter a segment name");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/segments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: segmentName, rules }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to create segment");
      }
      
      const data = await res.json();
      alert("Segment created ✅");
      // Reset form after successful creation
      setSegmentName("");
      setRules({
        totalSpend: { operator: "gt", value: 5000 },
        visits: { operator: "lt", value: 3 },
        inactiveDays: 90,
      });
      setPreview(null);
    } catch (error) {
      console.error("Creation failed:", error);
      alert("Failed to create segment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSegment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this segment?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/segments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to delete segment");
      }

      setSegments(prev => prev.filter(segment => segment._id !== id));
      alert("✅ Segment deleted successfully!");
    } catch (err) {
      console.error("Error deleting segment:", err);
      alert(`❌ Failed to delete segment: ${err.message}`);
    }
  };

  return (
    <div className="section animate-fade-in">
      <div className="container">
        <h1 className="text-2xl font-bold mb-6 text-text-primary">🎯 Create Segment</h1>

        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4 text-text-primary">📊 Existing Segments</h2>
          {segments.length === 0 ? (
            <p className="text-text-secondary">No segments created yet.</p>
          ) : (
            <ul className="space-y-3">
              {segments.map((segment) => (
                <li key={segment._id} className="flex justify-between items-center bg-input-bg p-3 rounded-md border border-border-color">
                  <span className="text-text-primary font-medium">{segment.name}</span>
                  <button
                    onClick={() => handleDeleteSegment(segment._id)}
                    className="text-error-color hover:text-red-600 transition-colors"
                    title="Delete Segment"
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4 text-text-primary">Define Segment Rules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="segmentName" className="block mb-1 text-sm font-medium text-text-secondary">Segment Name</label>
              <input
                id="segmentName"
                type="text"
                className="w-full px-3 py-2 rounded-md bg-input-bg border border-border-color text-text-primary focus:outline-none focus:border-accent-color focus:ring-1 focus:ring-accent-color"
                value={segmentName}
                onChange={(e) => setSegmentName(e.target.value)}
                placeholder="e.g. VIP Customers"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="totalSpend" className="block mb-1 text-sm font-medium text-text-secondary">Total Spend &gt;</label>
              <input
                id="totalSpend"
                type="number"
                className="w-full px-3 py-2 rounded-md bg-input-bg border border-border-color text-text-primary focus:outline-none focus:border-accent-color focus:ring-1 focus:ring-accent-color"
                value={rules.totalSpend.value}
                onChange={(e) =>
                  setRules((prev) => ({
                    ...prev,
                    totalSpend: { ...prev.totalSpend, value: parseInt(e.target.value) },
                  }))
                }
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="visits" className="block mb-1 text-sm font-medium text-text-secondary">Visits &lt;</label>
              <input
                id="visits"
                type="number"
                className="w-full px-3 py-2 rounded-md bg-input-bg border border-border-color text-text-primary focus:outline-none focus:border-accent-color focus:ring-1 focus:ring-accent-color"
                value={rules.visits.value}
                onChange={(e) =>
                  setRules((prev) => ({
                    ...prev,
                    visits: { ...prev.visits, value: parseInt(e.target.value) },
                  }))
                }
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="inactiveDays" className="block mb-1 text-sm font-medium text-text-secondary">Inactive Days &gt;</label>
              <input
                id="inactiveDays"
                type="number"
                className="w-full px-3 py-2 rounded-md bg-input-bg border border-border-color text-text-primary focus:outline-none focus:border-accent-color focus:ring-1 focus:ring-accent-color"
                value={rules.inactiveDays}
                onChange={(e) =>
                  setRules((prev) => ({ ...prev, inactiveDays: parseInt(e.target.value) }))
                }
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handlePreview}
              disabled={isPreviewLoading || isLoading}
              className="px-4 py-2 bg-accent-color text-white rounded-md hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPreviewLoading ? "Previewing..." : "Preview Audience"}
            </button>
            <button
              onClick={handleCreate}
              disabled={isLoading || isPreviewLoading}
              className="px-4 py-2 bg-success-color text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating..." : "Create Segment"}
            </button>
          </div>
        </div>

        {preview && (
          <div className="card mt-6">
            <h2 className="text-xl font-semibold mb-4 text-text-primary">📋 Preview Result</h2>
            <p className="text-sm text-text-secondary mb-2">
              Total Matches: <strong className="text-text-primary">{preview.count}</strong>
            </p>
            {preview.sample?.length > 0 && (
              <ul className="mt-2 text-sm text-text-secondary list-disc list-inside space-y-1">
                {preview.sample.map((cust) => (
                  <li key={cust._id}>
                    {cust.name} ({cust.email})
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Segments;
