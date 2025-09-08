import { useState } from 'react';
import API from '../api';

export default function LeadForm({ customerId, onSaved }) {
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('open');
  const [notes, setNotes] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    await API.post('/leads', { title, value: Number(value || 0), status, notes, customer: customerId });
    setTitle(''); setValue(''); setStatus('open'); setNotes('');
    if (onSaved) onSaved();
  };

  return (
    <form onSubmit={onSubmit} className="card form-inline">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lead title" required />
      <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Value" />
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="open">open</option>
        <option value="contacted">contacted</option>
        <option value="won">won</option>
        <option value="lost">lost</option>
      </select>
      <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" />
      <button type="submit">Add Lead</button>
    </form>
  );
}