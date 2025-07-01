import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ProduceDropdown({ onSelect }) {
  const [produceList, setProduceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    async function fetchProduce() {
      const { data, error } = await supabase
        .from('produce')
        .select('*')
        .order('name');
      if (error) {
        console.error('Error fetching produce:', error);
      } else {
        setProduceList(data);
      }
      setLoading(false);
    }
    fetchProduce();
  }, []);

  const handleChange = (e) => {
    setSelected(e.target.value);
    if (onSelect) onSelect(e.target.value);
  };

  if (loading) return <div>Loading produce...</div>;

  return (
    <select value={selected} onChange={handleChange}>
      <option value="">Select Produce</option>
      {produceList.map((produce) => (
        <option key={produce.id} value={produce.id}>
          {produce.name} {produce.variety ? `(${produce.variety})` : ''}
        </option>
      ))}
    </select>
  );
} 