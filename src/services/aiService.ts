import type { ResumeData, AISettings } from '../types';

const GOOGLE_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const CEREBRAS_API_URL = 'https://api.cerebras.ai/v1/chat/completions';

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

async function callAI(prompt: string, settings: AISettings): Promise<string> {
    if (settings.provider === 'google') {
        if (!settings.googleApiKey) throw new Error('Google API key is required');
        return callGoogleAI(prompt, settings);
    } else {
        if (!settings.cerebrasApiKey) throw new Error('Cerebras API key is required');
        return callCerebrasAI(prompt, settings);
    }
}

function extractJSON(text: string): string {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) return jsonMatch[1].trim();

    // Try to find raw JSON
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
        return text.slice(jsonStart, jsonEnd + 1);
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

export async function generateTailoredResume(
    resumeData: string,
    jobDescription: string,
    settings: AISettings
): Promise<ResumeData> {
    const prompt = `You are an expert resume optimizer. Given the resume data and job description below, create an optimized version that:
1. Subtly rephrases experience bullets to align with job requirements
2. Emphasizes relevant skills from the JD
3. Naturally incorporates important keywords from JD into existing content
4. Maintains truthfulness - only modify phrasing, don't add fake experience
5. Returns the same JSON structure but with optimized content

Resume Data:
${resumeData}

Job Description:
${jobDescription}

Return ONLY a valid JSON object (no markdown, no explanation) with this structure:
{
  "fullName": "string",
  "title": "string",
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

export async function extractATSKeywords(
    jobDescription: string,
    settings: AISettings
): Promise<string[]> {
    const prompt = `Analyze this job description and identify 10-15 technical keywords, skills, and important terms that an ATS (Applicant Tracking System) would scan for. Return ONLY a JSON array of strings, nothing else.

Job Description:
${jobDescription}

Return format: ["keyword1", "keyword2", "keyword3", ...]`;

    const response = await callAI(prompt, settings);
    const jsonStr = extractJSON(response);

    try {
        const keywords = JSON.parse(jsonStr);
        return Array.isArray(keywords) ? keywords : [];
    } catch (e) {
        console.error('Failed to parse keywords:', jsonStr);
        return [];
    }
}
