import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import { advisoryRequestSchema } from './schemas';
import { getAdvisory } from './gemini';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({ limit: '1mb' }));

const limiter = rateLimit({
    windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS || '100')
});
app.use(limiter);

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Middleware to verify user token
const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, error: 'Unauthorized' });
    
    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    
    (req as any).user = user;
    next();
};

app.post('/api/advisories', requireAuth, async (req, res) => {
    try {
        const user = (req as any).user;
        const parsed = advisoryRequestSchema.parse(req.body);
        
        // Check farm ownership
        const { data: farm, error: farmError } = await supabase
            .from('farms')
            .select('*')
            .eq('id', parsed.farm_id)
            .eq('user_id', user.id)
            .single();
            
        if (farmError || !farm) {
            return res.status(403).json({ success: false, error: { message: "Farm not found or unauthorized" }});
        }
        
        // Construct prompt
        const prompt = `
You are an agricultural decision-support assistant.
Provide a structured JSON advisory based on the following:
Farm Area: ${farm.area} ${farm.area_unit}, Soil: ${farm.soil_type || 'Unknown'}, pH: ${farm.soil_ph || 'Unknown'}, Irrigation: ${farm.irrigation_available ? 'Yes' : 'No'}
Crop: ${parsed.crop}, Variety: ${parsed.crop_variety || 'Unknown'}, Season: ${parsed.season}, Stage: ${parsed.growth_stage}
Objective: ${parsed.farming_objective}
Weather: ${parsed.weather_summary || 'None provided'}
Symptoms: ${parsed.observed_symptoms || 'None provided'}
Pests: ${parsed.pest_observations || 'None provided'}

Return a JSON with this structure:
{
  "summary": { "overall_assessment": "string", "primary_recommendation": "string", "confidence": "high|medium|low" },
  "crop_care": [{"stage": "string", "action": "string", "reason": "string", "priority": "high|medium|low"}],
  "risks": [{"risk": "string", "severity": "high|medium|low", "mitigation": "string"}],
  "disclaimer": "This is AI-generated advice. Consult a professional."
}
        `;
        
        const aiResponse = await getAdvisory(prompt);
        
        // Save to DB
        const { data: advisory, error: saveError } = await supabase
            .from('advisories')
            .insert({
                user_id: user.id,
                farm_id: farm.id,
                crop: parsed.crop,
                crop_variety: parsed.crop_variety,
                season: parsed.season,
                growth_stage: parsed.growth_stage,
                farming_objective: parsed.farming_objective,
                advisory_result: aiResponse,
                ai_model: process.env.GEMINI_MODEL || 'gemini-1.5-pro'
            })
            .select()
            .single();
            
        if (saveError) {
             console.error("Save error:", saveError);
             return res.status(500).json({ success: false, error: 'Database save failed' });
        }
        
        res.json({ success: true, data: advisory });
    } catch (err: any) {
        console.error("API Error:", err);
        res.status(400).json({ success: false, error: { message: err.message || "Invalid request" } });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
