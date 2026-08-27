import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const AdvisoryDetails = () => {
  const { id } = useParams();
  const [advisory, setAdvisory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('advisories').select('*, farms(*)').eq('id', id).single().then(({ data }) => {
      setAdvisory(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="p-8">Loading advisory...</div>;
  if (!advisory) return <div className="p-8">Advisory not found.</div>;

  const result = advisory.advisory_result;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Crop Advisory Report</h1>
        <Link to="/dashboard" className="text-green-600 hover:underline">&larr; Back to Dashboard</Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
        <h2 className="text-xl font-bold mb-2">Executive Summary</h2>
        <p className="text-gray-700 mb-2">{result?.summary?.overall_assessment}</p>
        <div className="p-4 bg-green-50 rounded-md">
          <span className="font-bold text-green-800">Primary Recommendation:</span>
          <p className="text-green-900 mt-1">{result?.summary?.primary_recommendation}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Crop Care Plan</h2>
        <div className="space-y-4">
          {result?.crop_care?.map((care: any, i: number) => (
            <div key={i} className="border-b pb-4 last:border-0">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded font-bold ${care.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                  {care.priority?.toUpperCase()} PRIORITY
                </span>
                <span className="font-bold">{care.stage}</span>
              </div>
              <p className="mt-2 text-gray-800 font-medium">{care.action}</p>
              <p className="mt-1 text-sm text-gray-600">Reason: {care.reason}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-red-500">
        <h2 className="text-xl font-bold mb-4">Risks & Mitigations</h2>
        <div className="space-y-4">
          {result?.risks?.map((risk: any, i: number) => (
            <div key={i} className="bg-red-50 p-4 rounded-md">
              <p className="font-bold text-red-900">{risk.risk}</p>
              <p className="mt-1 text-sm text-red-700">Mitigation: {risk.mitigation}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-sm text-gray-500 text-center mt-8 italic">
        {result?.disclaimer || "Disclaimer: This is AI-generated decision support guidance and not a substitute for local agricultural experts."}
      </div>
    </div>
  );
};
