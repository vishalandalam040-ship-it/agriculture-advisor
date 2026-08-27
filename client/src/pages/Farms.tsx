import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export const Farms = () => {
  const { user } = useAuth();
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFarms();
    }
  }, [user]);

  const loadFarms = async () => {
    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setFarms(data);
    }
    setLoading(false);
  };

  const deleteFarm = async (id: string) => {
    if (!confirm('Are you sure you want to delete this farm?')) return;
    await supabase.from('farms').delete().eq('id', id);
    loadFarms();
  };

  if (loading) return <div className="p-8">Loading farms...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Farms</h1>
        <Link to="/farms/new" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
          Add Farm
        </Link>
      </div>

      {farms.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">You haven't added any farms yet.</p>
          <Link to="/farms/new" className="text-green-600 font-medium hover:underline">Create your first farm</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <div key={farm.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-2">{farm.farm_name}</h2>
              <p className="text-gray-600 mb-4">{farm.location}</p>
              <div className="text-sm text-gray-500 mb-4 space-y-1">
                <p>Area: {farm.area} {farm.area_unit}</p>
                <p>Crop: {farm.current_crop || 'None'}</p>
                <p>Irrigation: {farm.irrigation_available ? 'Yes' : 'No'}</p>
              </div>
              <div className="flex justify-between mt-4">
                <button onClick={() => deleteFarm(farm.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">
                  Delete
                </button>
                <Link to={`/advisory/new?farmId=${farm.id}`} className="text-green-600 hover:text-green-800 text-sm font-medium">
                  Get Advisory &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
