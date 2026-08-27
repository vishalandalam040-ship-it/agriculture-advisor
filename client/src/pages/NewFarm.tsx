import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const NewFarm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    farm_name: '',
    location: '',
    area: '',
    area_unit: 'acre',
    soil_type: '',
    current_crop: '',
    irrigation_available: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const { error } = await supabase.from('farms').insert([
      {
        user_id: user.id,
        farm_name: formData.farm_name,
        location: formData.location,
        area: parseFloat(formData.area),
        area_unit: formData.area_unit,
        soil_type: formData.soil_type,
        current_crop: formData.current_crop,
        irrigation_available: formData.irrigation_available,
      }
    ]);

    setLoading(false);
    if (!error) {
      navigate('/farms');
    } else {
      alert('Error creating farm: ' + error.message);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Farm</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Farm Name *</label>
          <input required type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" 
            value={formData.farm_name} onChange={e => setFormData({...formData, farm_name: e.target.value})} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Location *</label>
          <input required type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" 
            value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Area *</label>
            <input required type="number" step="0.01" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" 
              value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Unit</label>
            <select className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              value={formData.area_unit} onChange={e => setFormData({...formData, area_unit: e.target.value})}>
              <option value="acre">Acres</option>
              <option value="hectare">Hectares</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Soil Type</label>
          <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" 
            value={formData.soil_type} onChange={e => setFormData({...formData, soil_type: e.target.value})} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Current Crop</label>
          <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" 
            value={formData.current_crop} onChange={e => setFormData({...formData, current_crop: e.target.value})} />
        </div>

        <div className="flex items-center">
          <input type="checkbox" id="irrigation" className="h-4 w-4 text-green-600 rounded border-gray-300"
            checked={formData.irrigation_available} onChange={e => setFormData({...formData, irrigation_available: e.target.checked})} />
          <label htmlFor="irrigation" className="ml-2 block text-sm text-gray-900">Irrigation Available</label>
        </div>

        <div className="pt-4 flex space-x-4">
          <button type="button" onClick={() => navigate('/farms')} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Farm'}
          </button>
        </div>
      </form>
    </div>
  );
};
