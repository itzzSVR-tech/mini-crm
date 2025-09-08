import React, { useEffect, useState } from 'react';
import API from '../api';

export default function CustomerForm({ onSaved, editing, setEditing }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');

  useEffect(() => {
    if (editing) {
      setName(editing.name || '');
      setEmail(editing.email || '');
      setPhone(editing.phone || '');
      setCompany(editing.company || '');
    }
  }, [editing]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, email, phone, company };
    if (editing) {
      await API.put(`/customers/${editing._id}`, payload);
      setEditing(null);
    } else {
      await API.post('/customers', payload);
    }
    setName(''); setEmail(''); setPhone(''); setCompany('');
    onSaved();
  };

  return (
    <form onSubmit={onSubmit} className="card form-inline">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
      <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
      <button type="submit">{editing ? 'Update' : 'Add'}</button>
    </form>
  );
}