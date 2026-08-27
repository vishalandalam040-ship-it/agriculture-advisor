import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const NewAdvisory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultFarmId = searchParams.get('farmId') || '';

  const [loading, setLoading] = useState(false);
  const [farms, setFarms] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    farm_id: defaultFarmId,
    crop: '',
    crop_variety: '',
    season: 'Spring',
    growth_stage: 'Seedling',
    farming_objective: 'Maximize Yield',
    weather_summary: '',
    observed_symptoms: '',
    pest_observations: '',
    disease_observations: '',
    additional_notes: '',
  });

  useEffect(() => {
    if (user) {
      supabase.from('farms').select('*').then(({ data }) => {
        if (data) setFarms(data);
        if (data && data.length > 0 && !formData.farm_id) {
          setFormData(prev => ({ ...prev, farm_id: data[0].id }));
        }
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(\`\${apiUrl}/api/advisories\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      });

      const json = await res.json();
      if (json.success) {
        navigate(`/advisories/${json.data.id}`);
      } else {
        alert('Error: ' + JSON.stringify(json.error));
      }
    } catch (err: any) {
      alert('Failed to generate advisory: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Generate AI Advisory</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Farm *</label>
          <select required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.farm_id} onChange={e => setFormData({...formData, farm_id: e.target.value})}>
            <option value="" disabled>Select a farm...</option>
            {farms.map(f => (
              <option key={f.id} value={f.id}>{f.farm_name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Crop *</label>
            <input required type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" placeholder="e.g. Wheat, Tomato"
              value={formData.crop} onChange={e => setFormData({...formData, crop: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Variety</label>
            <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" 
              value={formData.crop_variety} onChange={e => setFormData({...formData, crop_variety: e.target.value})} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Season *</label>
            <select required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              value={formData.season} onChange={e => setFormData({...formData, season: e.target.value})}>
              <option>Spring</option><option>Summer</option><option>Autumn</option><option>Winter</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Growth Stage *</label>
            <select required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              value={formData.growth_stage} onChange={e => setFormData({...formData, growth_stage: e.target.value})}>
              <option>Pre-planting</option><option>Seedling</option><option>Vegetative</option><option>Flowering</option><option>Fruiting</option><option>Harvest</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Objective *</label>
            <select required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              value={formData.farming_objective} onChange={e => setFormData({...formData, farming_objective: e.target.value})}>
              <option>Maximize Yield</option><option>Pest Control</option><option>Disease Management</option><option>Water Conservation</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Observed Symptoms / Issues</label>
          <textarea className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" rows={3} placeholder="e.g. Yellowing leaves, wilting..."
            value={formData.observed_symptoms} onChange={e => setFormData({...formData, observed_symptoms: e.target.value})} />
        </div>

        <div className="pt-4 flex space-x-4">
          <button type="button" onClick={() => navigate('/dashboard')} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={loading || farms.length === 0} className="flex-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 px-4 py-2 font-medium">
            {loading ? 'Analyzing with AI...' : 'Generate Advisory'}
          </button>
        </div>
      </form>
    </div>
  );
};
