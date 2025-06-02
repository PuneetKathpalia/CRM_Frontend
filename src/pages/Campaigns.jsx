import { useEffect, useState } from "react";
import { API_BASE_URL as API_BASE } from '../config/api';
import { FiTrash2, FiSend, FiPlusCircle, FiMessageSquare } from "react-icons/fi";

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [segmentLoading, setSegmentLoading] = useState(true);
  const [campaignName, setCampaignName] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  // Fetch segments separately
  useEffect(() => {
    const fetchSegments = async () => {
      try {
        setSegmentLoading(true);
        const segmentsRes = await fetch(`${API_BASE}/api/segments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!segmentsRes.ok) {
          throw new Error("Failed to fetch segments");
        }
        
        const segmentsData = await segmentsRes.json();
        setSegments(segmentsData);
      } catch (err) {
        console.error("Failed to fetch segments:", err);
        alert("Failed to load segments. Please refresh the page.");
      } finally {
        setSegmentLoading(false);
      }
    };

    if (token) {
      fetchSegments();
    }
  }, [token]);

  // Fetch campaigns separately
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const campaignsRes = await fetch(`${API_BASE}/api/campaigns?populate=segmentId`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!campaignsRes.ok) {
          throw new Error("Failed to fetch campaigns");
        }
        
        const campaignsData = await campaignsRes.json();
        setCampaigns(campaignsData);
      } catch (err) {
        console.error("Failed to fetch campaigns:", err);
        alert("Failed to load campaigns. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCampaigns();
    }
  }, [token]);

  const handleLaunchCampaign = async () => {
    if (!campaignName || !selectedSegment || !message) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/campaigns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: campaignName,
          segmentId: selectedSegment,
          message,
        }),
      });

      if (!res.ok) throw new Error("Failed to create campaign");
      
      const newCampaign = await res.json();
      const segment = segments.find(s => s._id === selectedSegment);
      newCampaign.segmentId = segment;
      
      setCampaigns([...campaigns, newCampaign]);
      setCampaignName("");
      setSelectedSegment("");
      setMessage("");
      alert("Campaign created successfully!");
    } catch (err) {
      alert("Failed to create campaign. Please try again.");
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/campaigns/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to delete campaign");
      }

      setCampaigns(prev => prev.filter(campaign => campaign._id !== id));
      alert("✅ Campaign deleted successfully!");
    } catch (err) {
      console.error("Error deleting campaign:", err);
      alert(`❌ Failed to delete campaign: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 py-12 px-4 sm:px-6 lg:px-8 font-sans flex justify-center">
      <div className="max-w-7xl w-full">
        <h1 className="text-5xl font-extrabold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 flex items-center gap-4">
          <FiSend className="text-purple-400" /> Campaigns
        </h1>

        {/* Launch New Campaign Form */}
        <div className="bg-gray-800/60 rounded-3xl shadow-2xl p-8 mb-10 border border-gray-700 backdrop-blur-lg">
          <h2 className="text-3xl font-bold mb-8 text-gray-50 flex items-center gap-3">
            <FiPlusCircle className="text-green-400" /> Launch New Campaign
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block mb-3 text-sm font-medium text-gray-300">Campaign Name</label>
              <input
                type="text"
                className="w-full px-5 py-3 rounded-xl bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                placeholder="Enter the campaign name"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-3 text-sm font-medium text-gray-300">Select Segment</label>
              <select
                className="w-full px-5 py-3 rounded-xl bg-gray-700 border border-gray-600 text-gray-100 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value)}
                disabled={segmentLoading}
              >
                <option value="">-- Select a Segment --</option>
                {segmentLoading ? (
                  <option value="" disabled>Loading segments...</option>
                ) : segments.length === 0 ? (
                  <option value="" disabled>No segments available</option>
                ) : (
                  segments.map((segment) => (
                    <option key={segment._id} value={segment._id}>
                      {segment.name}
                    </option>
                  ))
                )}
              </select>
              {segmentLoading && (
                <p className="mt-2 text-sm text-gray-400">Loading segments...</p>
              )}
            </div>
          </div>
          <div className="mt-8">
            <label className="block mb-3 text-sm font-medium text-gray-300">Message</label>
            <textarea
              className="w-full px-5 py-3 rounded-xl bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 h-40 resize-y"
              placeholder="Enter your campaign message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>
          <div className="flex flex-col sm:flex-row gap-5 mt-8">
            <button
              onClick={handleLaunchCampaign}
              className="flex-1 px-7 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 flex items-center justify-center gap-3"
            >
              <FiSend /> Launch Campaign
            </button>
          </div>
        </div>

        {/* Existing Campaigns List */}
        <div className="bg-gray-800/60 rounded-3xl shadow-2xl p-8 border border-gray-700 backdrop-blur-lg">
          <h2 className="text-3xl font-bold mb-8 text-gray-50 flex items-center gap-3">
            <FiMessageSquare className="text-blue-400" /> Existing Campaigns
          </h2>
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto"></div>
              <p className="mt-6 text-gray-400 text-lg">Loading campaigns...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <p className="text-center py-10 text-gray-400 text-lg">No campaigns found. Launch your first campaign above!</p>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow-lg">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Campaign Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Segment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Message</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Launch Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {campaigns.map((campaign) => (
                    <tr key={campaign._id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{campaign.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{campaign.segmentId?.name || 'N/A'}</td>
                      <td className="px-6 py-4 max-w-xs truncate text-sm text-gray-300">{campaign.message}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(campaign.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${campaign.status === 'SENT' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteCampaign(campaign._id)}
                          className="text-red-400 hover:text-red-300 ml-4 transition-colors"
                          title="Delete Campaign"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Campaigns;