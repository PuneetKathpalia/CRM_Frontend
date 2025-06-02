import { useEffect, useState } from "react";
import { API_BASE_URL as API_BASE } from '../config/api';
import { FiUser, FiMail, FiPhone, FiDollarSign, FiTrendingUp, FiTag, FiSave, FiTrash2, FiMessageSquare, FiBookOpen, FiArrowDown } from "react-icons/fi";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [totalSpend, setTotalSpend] = useState("");
  const [visits, setVisits] = useState("");
  const [tags, setTags] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [campaignGoal, setCampaignGoal] = useState("");
  const [generatedMessages, setGeneratedMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // State for scroll indicator
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const fetchCustomers = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/customers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch customers");
        }

        const data = await res.json();
        setCustomers(data);
      } catch (err) {
        console.error("❌ Failed to fetch customers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [token]);

  // Effect and handler for scroll indicator
  useEffect(() => {
    const handleScroll = () => {
      const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 10; // -10 for a small buffer
      setShowScrollIndicator(!isAtBottom && document.body.offsetHeight > window.innerHeight);
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Re-run if dependencies change, none needed here for basic scroll

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setTotalSpend("");
    setVisits("");
    setTags("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert("Authentication token not found. Please log in.");
      return;
    }
    if (!name || !email) {
      alert("Name and Email are required fields.");
      return;
    }

    try {
      const customerData = {
        name,
        email,
        phone,
        totalSpend: parseFloat(totalSpend) || 0,
        visits: parseInt(visits) || 0,
        tags: tags ? tags.split(",").map((tag) => tag.trim()).filter(tag => tag !== '') : [],
      };

      const res = await fetch(`${API_BASE}/api/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(customerData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to save customer");
      }
      
      setCustomers(prev => [...prev, data]);
      alert("✅ Customer added successfully!");
      resetForm();
    } catch (err) {
      console.error("Error saving customer:", err);
      alert(`❌ Failed to save customer: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/customers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to delete customer");
      }

      setCustomers(prev => prev.filter(c => c._id !== id));
      alert("✅ Customer deleted successfully!");
    } catch (err) {
      console.error("Error deleting customer:", err);
      alert(`❌ Failed to delete customer: ${err.message}`);
    }
  };

  const generateMessages = async () => {
    if (!selectedCustomer || !campaignGoal) {
      alert("Please select a customer and enter a campaign goal");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`${API_BASE}/api/generate-messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer: selectedCustomer,
          goal: campaignGoal,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate messages");
      }

      const data = await response.json();
      setGeneratedMessages(data.messages);
    } catch (err) {
      console.error("Error generating messages:", err);
      alert("Failed to generate messages. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 text-center pb-2 border-b border-gray-700 w-full">👥 Customers</h1>

        {/* Add Customer Form */}
        <div className="bg-gray-800/60 rounded-3xl shadow-2xl p-8 mb-12 border border-gray-700 backdrop-blur-lg w-full max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-gray-50 text-center">
            Add New Customer
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Input Fields */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">
                  <FiUser className="inline mr-2" /> Name *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 ml-0.5 rounded-md bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
                  placeholder="Please enter the name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">
                  <FiMail className="inline mr-2" /> Email *
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
                  placeholder="Please enter the email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">
                  <FiPhone className="inline mr-2" /> Phone
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
                  placeholder="Please enter the phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">
                  <FiDollarSign className="inline mr-2" /> Total Spend
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
                  placeholder="0.00"
                  value={totalSpend}
                  onChange={(e) => setTotalSpend(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">
                  <FiTrendingUp className="inline mr-2" /> Total Visits
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
                  placeholder="0"
                  value={visits}
                  onChange={(e) => setVisits(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">
                  <FiTag className="inline mr-2" /> Tags
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
                  placeholder="Eg: vip, regular, new, etc."
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-center mt-6">
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500/50 flex items-center justify-center gap-2 font-semibold shadow-md"
              >
                <FiSave /> Save Customer
              </button>
            </div>
          </form>
        </div>

        {/* Smart Message Generator Panel */}
        <div className="bg-gray-800/60 rounded-3xl shadow-2xl p-8 mb-12 border border-gray-700 backdrop-blur-lg w-full max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-gray-50 text-center">
            <FiMessageSquare className="inline mr-2" /> Smart Message Generator
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Select Customer
              </label>
              <select
                className="w-full px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
                value={selectedCustomer?._id || ""}
                onChange={(e) => {
                  const customer = customers.find(c => c._id === e.target.value);
                  setSelectedCustomer(customer);
                }}
              >
                <option value="">Select a customer...</option>
                {customers.map(customer => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name} ({customer.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Campaign Goal
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
                placeholder="e.g., win back inactive users, promote new product, thank loyal customers"
                value={campaignGoal}
                onChange={(e) => setCampaignGoal(e.target.value)}
              />
            </div>

            <button
              onClick={generateMessages}
              disabled={isGenerating || !selectedCustomer || !campaignGoal}
              className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                "Generate Messages"
              )}
            </button>

            {generatedMessages.length > 0 && (
              <div className="mt-10 space-y-6">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 pb-4">Generated Messages:</h3>
                {generatedMessages.map((message, index) => (
                  <div
                    key={index}
                    className="p-7 bg-gray-800 rounded-xl border border-gray-700 shadow-xl transition-all duration-300 hover:border-purple-600 hover:shadow-purple-500/30 space-y-4"
                  >
                    {/* Subject */}
                    <div>
                      <p className="text-purple-300 font-semibold text-lg border-b border-gray-700 pb-3 mb-3">{message.subject}</p>
                    </div>
                    {/* Body */}
                    <div>
                      <p className="text-gray-300 whitespace-pre-wrap text-base leading-relaxed">{message.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Customers List */}
        <div className="bg-gray-800/60 rounded-3xl shadow-2xl p-8 border border-gray-700 backdrop-blur-lg w-full max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-gray-50 text-center">📋 Customer List</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading customers...</p>
            </div>
          ) : customers.length === 0 ? (
            <p className="text-center py-8 text-gray-400">No customers found. Add your first customer above!</p>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow-lg">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Total Spend</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Visits</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Tags</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {customers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-100 text-sm font-medium text-center">{customer.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm text-center">{customer.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm text-center">{customer.phone || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm text-center">₹{customer.totalSpend || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm text-center">{customer.visits || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <div className="flex flex-wrap gap-2 justify-center">
                          {customer.tags?.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => handleDelete(customer._id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete"
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

      {/* Scroll Down Indicator */}
      {showScrollIndicator && (
        <div 
          className="fixed bottom-8 right-8 bg-purple-600/50 p-3 rounded-full cursor-pointer shadow-lg transition-opacity duration-300 hover:bg-purple-700/70 animate-bounce"
          onClick={scrollToBottom}
          title="Scroll Down"
        >
          <FiArrowDown size={24} className="text-white" />
        </div>
      )}
    </div>
  );
};

export default Customers;
