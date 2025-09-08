import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api';
import LeadForm from '../components/LeadForm';

export default function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [leads, setLeads] = useState([]);

  const load = async () => {
    const res = await API.get(`/customers/${id}`);
    setCustomer(res.data);
    const l = await API.get(`/leads?customer=${id}`);
    setLeads(l.data);
  };

  useEffect(() => { load(); }, [id]);

  const deleteLead = async (leadId) => {
    if (!window.confirm('Delete lead?')) return;
    await API.delete(`/leads/${leadId}`);
    load();
  };

  return (
    <div>
      {!customer ? <div>Loading...</div> : (
        <>
          <h2>{customer.name}</h2>
          <div>{customer.company} {customer.email} {customer.phone}</div>

          <LeadForm customerId={id} onSaved={load} />

          <h3>Leads</h3>
          <div className="list">
            {leads.map(l => (
              <div className="card" key={l._id}>
                <div><strong>{l.title}</strong> — {l.status}</div>
                <div>Value: {l.value}</div>
                <div>{l.notes}</div>
                <div>
                  <button onClick={() => deleteLead(l._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}