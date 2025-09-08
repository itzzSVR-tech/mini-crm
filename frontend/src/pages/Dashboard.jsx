import { useEffect, useState } from 'react';
import API from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get('/dashboard').then((res) => setStats(res.data)).catch(() => {});
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="grid">
        <div className="card">Customers: {stats.customersCount}</div>
        <div className="card">Leads: {stats.leadsCount}</div>
        <div className="card">Total Value: {stats.totalValue}</div>
      </div>
      <div className="card">
        <h3>Lead Statuses</h3>
        <ul>
          {Object.entries(stats.statusCounts || {}).map(([k, v]) => (
            <li key={k}>{k}: {v}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}