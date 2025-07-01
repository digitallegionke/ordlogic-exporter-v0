import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const groupBy = (arr, key) =>
  arr.reduce((acc, item) => {
    (acc[item[key]] = acc[item[key]] || []).push(item);
    return acc;
  }, {});

const SpecificationForm = () => {
  const [produceList, setProduceList] = useState([]);
  const [marketList, setMarketList] = useState([]);
  const [selectedProduce, setSelectedProduce] = useState('');
  const [varieties, setVarieties] = useState([]);
  const [selectedVariety, setSelectedVariety] = useState('');
  const [growingSeasons, setGrowingSeasons] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState('');
  const [specification, setSpecification] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch produce and markets on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: produceData } = await supabase.from('produce').select('*');
      const { data: marketData } = await supabase.from('markets').select('*');
      setProduceList(produceData || []);
      setMarketList(marketData || []);
    };
    fetchInitialData();
  }, []);

  // Fetch varieties when produce is selected
  useEffect(() => {
    if (selectedProduce) {
      const fetchVarieties = async () => {
        const res = await fetch(`/api/produce/${selectedProduce}/varieties`);
        const data = await res.json();
        setVarieties(data || []);
        if (data && data.length > 0) {
          setSelectedVariety(data[0].id);
          setGrowingSeasons(data[0].growing_seasons || []);
        } else {
          setSelectedVariety('');
          setGrowingSeasons([]);
        }
      };
      fetchVarieties();
    } else {
      setVarieties([]);
      setSelectedVariety('');
      setGrowingSeasons([]);
    }
  }, [selectedProduce]);

  // Set growing seasons when variety is selected
  useEffect(() => {
    if (selectedVariety && varieties.length > 0) {
      const variety = varieties.find(v => v.id === selectedVariety);
      setGrowingSeasons(variety?.growing_seasons || []);
    } else {
      setGrowingSeasons([]);
    }
  }, [selectedVariety, varieties]);

  // Fetch specification when produce, market, and variety are selected
  useEffect(() => {
    if (selectedProduce && selectedMarket && selectedVariety) {
      const fetchSpecification = async () => {
        setIsLoading(true);
        const params = new URLSearchParams({
          produce_id: selectedProduce,
          market_id: selectedMarket,
          variety_id: selectedVariety
        });
        const res = await fetch(`/api/specifications?${params.toString()}`);
        const data = await res.json();
        setSpecification(data);
        // Initialize form data with default or override values
        const initialFormData = {};
        (data.spec_fields || []).forEach(field => {
          // Check for override
          const override = (data.variety_overrides || []).find(vo => vo.variety_id === selectedVariety && vo.override_value);
          initialFormData[field.id] = override ? override.override_value : field.value || '';
        });
        setFormData(initialFormData);
        setIsLoading(false);
      };
      fetchSpecification();
    }
  }, [selectedProduce, selectedMarket, selectedVariety]);

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  // Group fields by category for display
  const groupedFields = specification?.spec_fields
    ? groupBy(specification.spec_fields, 'category')
    : {};

  return (
    <div className="specification-form max-w-2xl mx-auto p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">Export Crop Specification Form</h2>

      <div className="flex gap-4 mb-6">
        <select
          value={selectedProduce}
          onChange={e => setSelectedProduce(e.target.value)}
          disabled={isLoading}
          className="border rounded px-3 py-2"
        >
          <option value="">Select Produce</option>
          {produceList.map(produce => (
            <option key={produce.id} value={produce.id}>
              {produce.name} ({produce.variety})
            </option>
          ))}
        </select>
        <select
          value={selectedMarket}
          onChange={e => setSelectedMarket(e.target.value)}
          disabled={!selectedProduce || isLoading}
          className="border rounded px-3 py-2"
        >
          <option value="">Select Market</option>
          {marketList.map(market => (
            <option key={market.id} value={market.id}>
              {market.name}
            </option>
          ))}
        </select>
      </div>

      {/* Variety Dropdown */}
      {varieties.length > 0 && (
        <div className="mb-6">
          <label className="block font-medium mb-1">Variety</label>
          <select
            value={selectedVariety}
            onChange={e => setSelectedVariety(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="">Select Variety</option>
            {varieties.map(variety => (
              <option key={variety.id} value={variety.id}>
                {variety.name}
              </option>
            ))}
          </select>
          {growingSeasons.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-semibold">Growing Seasons:</span> {growingSeasons.join(', ')}
            </div>
          )}
        </div>
      )}

      {isLoading && <div className="text-gray-500">Loading specification...</div>}

      {specification && !isLoading && (
        <div className="space-y-6">
          <div className="mb-4">
            <h3 className="text-xl font-semibold">{specification.title} (v{specification.version})</h3>
            <p className="text-gray-500 text-sm">Effective: {specification.effective_date}</p>
          </div>

          {/* Render all spec field categories */}
          {Object.entries(groupedFields).map(([category, fields]) => (
            <div key={category} className="mb-4">
              <h4 className="font-bold text-primary mb-2">{category} Requirements</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map(field => (
                  <div key={field.id} className="flex flex-col">
                    <label className="font-medium mb-1">
                      {field.label} {field.is_required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      value={formData[field.id] || ''}
                      onChange={e => handleInputChange(field.id, e.target.value)}
                      placeholder={`${field.value} ${field.unit || ''}`}
                      className="border rounded px-3 py-2"
                    />
                    {field.unit && <span className="text-xs text-gray-400">{field.unit}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Packaging */}
          {specification.packaging && (
            <div className="mb-4">
              <h4 className="font-bold text-primary mb-2">Packaging Requirements</h4>
              <div className="bg-muted/40 rounded p-3">
                <p><strong>Box Type:</strong> {specification.packaging.box_type}</p>
                <p><strong>Labeling:</strong> {specification.packaging.labeling.join(', ')}</p>
                <p><strong>Materials:</strong> {specification.packaging.materials.join(', ')}</p>
                <p><strong>Weight:</strong> {specification.packaging.weight} {specification.packaging.weight_unit}</p>
              </div>
            </div>
          )}

          {/* Certifications */}
          {specification.certifications && specification.certifications.length > 0 && (
            <div className="mb-4">
              <h4 className="font-bold text-primary mb-2">Required Certifications</h4>
              <ul className="list-disc ml-6">
                {specification.certifications.map(cert => (
                  <li key={cert.id || cert.name}>
                    {cert.name} {cert.is_required && <span className="text-green-600 font-semibold">(Required)</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cold Chain */}
          {specification.cold_chain && (
            <div className="mb-4">
              <h4 className="font-bold text-primary mb-2">Cold Chain Requirements</h4>
              <div className="bg-muted/40 rounded p-3">
                {specification.cold_chain.temperature_min !== undefined && (
                  <p>
                    <strong>Temperature:</strong> {specification.cold_chain.temperature_min}
                    {specification.cold_chain.temperature_max !== undefined
                      ? `–${specification.cold_chain.temperature_max}`
                      : ''}
                    {specification.cold_chain.temperature_unit}
                  </p>
                )}
                {specification.cold_chain.requirements && (
                  <ul className="list-disc ml-6">
                    {specification.cold_chain.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="mt-6 bg-primary text-white px-6 py-2 rounded font-bold hover:bg-primary/90"
          >
            Save Specification
          </button>
        </div>
      )}
    </div>
  );
};

export default SpecificationForm; 