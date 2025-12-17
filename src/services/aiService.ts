import type { ResumeData, AISettings } from '../types';

const GOOGLE_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const CEREBRAS_API_URL = 'https://api.cerebras.ai/v1/chat/completions';
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

async function callGoogleAI(prompt: string, settings: AISettings): Promise<string> {
    const response = await fetch(
        `${GOOGLE_API_URL}/${settings.googleModel}:generateContent?key=${settings.googleApiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 8192,
                },
            }),
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Google AI API error: ${error}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callCerebrasAI(prompt: string, settings: AISettings): Promise<string> {
    const response = await fetch(CEREBRAS_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.cerebrasApiKey}`,
        },
        body: JSON.stringify({
            model: settings.cerebrasModel,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 8192,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Cerebras API error: ${error}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

async function callMistralAI(prompt: string, settings: AISettings): Promise<string> {
    const response = await fetch(MISTRAL_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.mistralApiKey}`,
        },
        body: JSON.stringify({
            model: settings.mistralModel,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 8192,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Mistral API error: ${error}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

export async function callAI(prompt: string, settings: AISettings): Promise<string> {
    if (settings.provider === 'google') {
        if (!settings.googleApiKey) throw new Error('Google API key is required');
        return callGoogleAI(prompt, settings);
    } else if (settings.provider === 'cerebras') {
        if (!settings.cerebrasApiKey) throw new Error('Cerebras API key is required');
        return callCerebrasAI(prompt, settings);
    } else {
        if (!settings.mistralApiKey) throw new Error('Mistral API key is required');
        return callMistralAI(prompt, settings);
    }
}

export function extractJSON(text: string): string {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) return jsonMatch[1].trim();

    // Try to find raw JSON
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
        return text.slice(jsonStart, jsonEnd + 1);
    }

    // Try array format
    const arrayStart = text.indexOf('[');
    const arrayEnd = text.lastIndexOf(']');
    if (arrayStart !== -1 && arrayEnd !== -1 && (jsonStart === -1 || arrayStart < jsonStart)) {
        return text.slice(arrayStart, arrayEnd + 1);
    }

    return text;
}

export async function generateBaseResume(
    resumeData: string,
    settings: AISettings
): Promise<ResumeData> {
    const prompt = `Extract and structure the following resume information into a clean format. Return ONLY a valid JSON object (no markdown, no explanation) with these exact keys:
{
  "fullName": "string",
  "title": "string",
  "email": "string",
  "phone": "string",
  "linkedin": "string (URL)",
  "github": "string (URL)",
  "portfolio": "string (URL)",
  "location": "string",
  "summary": "string (professional summary paragraph)",
  "experiences": [
    {
      "jobTitle": "string",
      "company": "string",
      "duration": "string (e.g., 'Apr 2024 - Present')",
      "duties": ["string (bullet point)", "string", ...]
    }
  ],
  "skills": {
    "languages": "string (comma-separated)",
    "databases": "string (comma-separated)",
    "mlAi": "string (comma-separated)",
    "visualization": "string (comma-separated)",
    "frameworks": "string (comma-separated)",
    "bigData": "string (comma-separated)"
  },
  "projects": [
    {
      "title": "string",
      "description": "string"
    }
  ],
  "certifications": ["string", "string", ...]
}

Here's the resume data to extract from:
${resumeData}

Return ONLY the JSON object, nothing else.`;

    const response = await callAI(prompt, settings);
    const jsonStr = extractJSON(response);

    try {
        return JSON.parse(jsonStr) as ResumeData;
    } catch (e) {
        console.error('Failed to parse JSON:', jsonStr);
        throw new Error('Failed to parse AI response as JSON. Please try again.');
    }
}

export interface TailoredResumeResult {
    resume: ResumeData;
    changes: string[];
    companyName: string;
    jobTitle: string;
    alignmentScore: number;
    alignmentDetails: {
        matchingPoints: string[];
        missingPoints: string[];
    };
}

export async function generateTailoredResume(
    resumeData: string,
    jobDescription: string,
    settings: AISettings
): Promise<TailoredResumeResult> {
    const prompt = `You are an expert resume optimizer. Given the resume data and job description below, create an optimized version AND calculate how well the resume aligns with the job.

IMPORTANT: Return a JSON object with this EXACT structure:
{
  "companyName": "string (extract from JD)",
  "jobTitle": "string (extract from JD)", 
  "alignmentScore": number (0-100, how well the resume matches the job requirements),
  "alignmentDetails": {
    "matchingPoints": ["3-5 specific strengths that match job requirements"],
    "missingPoints": ["2-4 gaps or areas where the resume could be stronger for this role"]
  },
  "changes": ["string describing change 1", "string describing change 2", ...],
  "resume": {
    "fullName": "string",
    "title": "string (optimized for job)",
    "email": "string",
    "phone": "string",
    "linkedin": "string",
    "github": "string",
    "portfolio": "string",
    "location": "string",
    "summary": "string (optimized for the job)",
    "experiences": [{"jobTitle": "string", "company": "string", "duration": "string", "duties": ["string"]}],
    "skills": {"languages": "string", "databases": "string", "mlAi": "string", "visualization": "string", "frameworks": "string", "bigData": "string"},
    "projects": [{"title": "string", "description": "string"}],
    "certifications": ["string"]
  }
}

Alignment Score Guidelines:
- 90-100%: Perfect match - candidate has all required skills and experience
- 70-89%: Strong match - most requirements met, minor gaps
- 50-69%: Moderate match - some relevant experience but notable gaps
- Below 50%: Weak match - significant skill/experience gaps

The "changes" array should list 3-5 specific changes you made.

Resume Data:
${resumeData}

Job Description:
${jobDescription}

Return ONLY the JSON object, nothing else.`;

    const response = await callAI(prompt, settings);
    const jsonStr = extractJSON(response);

    try {
        const result = JSON.parse(jsonStr);
        return {
            resume: result.resume,
            changes: result.changes || [],
            companyName: result.companyName || 'Unknown Company',
            jobTitle: result.jobTitle || 'Position',
            alignmentScore: result.alignmentScore || 0,
            alignmentDetails: result.alignmentDetails || { matchingPoints: [], missingPoints: [] }
        };
    } catch (e) {
        console.error('Failed to parse JSON:', jsonStr);
        throw new Error('Failed to parse AI response as JSON. Please try again.');
    }
}

export async function extractATSKeywords(
    jobDescription: string,
    settings: AISettings
): Promise<string[]> {
    const prompt = `Analyze this job description and identify 8-10 of the MOST IMPORTANT keywords that an ATS (Applicant Tracking System) would scan for.

Focus only on:
- Critical technical skills and tools
- Must-have qualifications
- Key industry terms

Return ONLY a JSON array of 8-10 strings, nothing else. Keep it focused - quality over quantity.

Job Description:
${jobDescription}

Return format: ["keyword1", "keyword2", ...]`;

    const response = await callAI(prompt, settings);
    const jsonStr = extractJSON(response);

    try {
        const keywords = JSON.parse(jsonStr);
        // Cap at 10 keywords to prevent keyword stuffing
        return Array.isArray(keywords) ? keywords.slice(0, 10) : [];
    } catch (e) {
        console.error('Failed to parse keywords:', jsonStr);
        return [];
    }
}

export async function extractJobInfo(
    jobDescription: string,
    settings: AISettings
): Promise<{ companyName: string; jobTitle: string }> {
    const prompt = `Extract the company name and job title from this job description. Return ONLY a JSON object:
{"companyName": "string", "jobTitle": "string"}

If you can't find them, use "Company" and "Position" as defaults.

Job Description:
${jobDescription}

Return ONLY the JSON object.`;

    try {
        const response = await callAI(prompt, settings);
        const jsonStr = extractJSON(response);
        const result = JSON.parse(jsonStr);
        return {
            companyName: result.companyName || 'Company',
            jobTitle: result.jobTitle || 'Position'
        };
    } catch (e) {
        return { companyName: 'Company', jobTitle: 'Position' };
    }
}

export interface FixedResumeResult {
    resume: ResumeData;
    fixes: string[];
}

export async function fixResumeWeaknesses(
    resumeData: ResumeData,
    weaknesses: string[],
    improvements: string[],
    settings: AISettings
): Promise<FixedResumeResult> {
    const prompt = `You are an expert resume optimizer. Fix ALL the weaknesses and implement ALL the improvements listed below.

Current Resume:
${JSON.stringify(resumeData, null, 2)}

WEAKNESSES TO FIX:
${weaknesses.map((w, i) => `${i + 1}. ${w}`).join('\n')}

IMPROVEMENTS TO IMPLEMENT:
${improvements.map((imp, i) => `${i + 1}. ${imp}`).join('\n')}

IMPORTANT: Return a JSON object with:
{
  "fixes": ["Description of fix 1", "Description of fix 2", ...],
  "resume": {
    "fullName": "string",
    "title": "string",
    "email": "string",
    "phone": "string",
    "linkedin": "string",
    "github": "string",
    "portfolio": "string",
    "location": "string",
    "summary": "string (improved)",
    "experiences": [{"jobTitle": "string", "company": "string", "duration": "string", "duties": ["string"]}],
    "skills": {"languages": "string", "databases": "string", "mlAi": "string", "visualization": "string", "frameworks": "string", "bigData": "string"},
    "projects": [{"title": "string", "description": "string"}],
    "certifications": ["string"]
  }
}

The "fixes" array should describe EACH fix you made corresponding to the weaknesses and improvements.
Make meaningful improvements - don't just copy the original. Actually improve the content!

Return ONLY the JSON object.`;

    const response = await callAI(prompt, settings);
    const jsonStr = extractJSON(response);

    try {
        const result = JSON.parse(jsonStr);
        return {
            resume: result.resume,
            fixes: result.fixes || []
        };
    } catch (e) {
        console.error('Failed to parse JSON:', jsonStr);
        throw new Error('Failed to fix resume. Please try again.');
    }
}
