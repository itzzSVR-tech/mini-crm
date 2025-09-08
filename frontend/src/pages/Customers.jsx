import { useEffect, useState } from 'react';
import API from '../api';
import { Link } from 'react-router-dom';
import CustomerForm from '../components/CustomerForm';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = () => API.get('/customers').then((r) => setCustomers(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const onDelete = async (id) => {
    if (!window.confirm('Delete customer?')) return;
    await API.delete(`/customers/${id}`);
    load();
  };

  return (
    <div>
      <h2>Customers</h2>
      <CustomerForm onSaved={load} editing={editing} setEditing={setEditing} />
      <div className="list">
        {customers.map(c => (
          <div className="card" key={c._id}>
            <h4>{c.name}</h4>
            <div>{c.company}</div>
            <div>{c.email} {c.phone}</div>
            <div>
              <Link to={`/customers/${c._id}`}>View</Link>
              <button onClick={() => setEditing(c)}>Edit</button>
              <button onClick={() => onDelete(c._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}