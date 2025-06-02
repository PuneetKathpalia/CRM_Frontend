import { useEffect, useState } from "react";
import { API_BASE_URL as API_BASE } from '../config/api';
import { FiUsers, FiLayers, FiMail, FiCheckCircle, FiXCircle } from "react-icons/fi";

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    customers: 0,
    segments: 0,
    campaigns: 0,
    messagesSent: 0,
    messagesFailed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found in localStorage");
      return;
    }

    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch dashboard metrics");
        }

        const data = await res.json();
        setMetrics(data);
      } catch (err) {
        console.error("❌ Failed to fetch dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();

    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const MetricCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-secondary-bg rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text-secondary text-sm mb-2">{title}</p>
          <h3 className="text-text-primary text-2xl font-semibold">{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-semibold text-text-primary mb-8">
        Dashboard Overview
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-color"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            title="Total Customers"
            value={metrics.customers}
            icon={FiUsers}
            color="text-info-color"
          />
          <MetricCard
            title="Active Segments"
            value={metrics.segments}
            icon={FiLayers}
            color="text-warning-color"
          />
          <MetricCard
            title="Total Campaigns"
            value={metrics.campaigns}
            icon={FiMail}
            color="text-accent-color"
          />
          <MetricCard
            title="Messages Sent"
            value={metrics.messagesSent}
            icon={FiCheckCircle}
            color="text-success-color"
          />
          <MetricCard
            title="Messages Failed"
            value={metrics.messagesFailed}
            icon={FiXCircle}
            color="text-error-color"
          />
        </div>
      )}

      <div className="text-center text-sm text-text-secondary py-4 mt-10">
        Created by Puneet Kathpalia
      </div>
    </div>
  );
};

export default Dashboard;
