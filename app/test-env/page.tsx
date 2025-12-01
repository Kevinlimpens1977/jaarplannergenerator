'use client';

export default function TestEnvPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Environment Variables Test</h1>
      <div>
        <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>
        <br />
        {url || '❌ NOT FOUND'}
      </div>
      <br />
      <div>
        <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>
        <br />
        {key ? `✅ Found (${key.length} characters)` : '❌ NOT FOUND'}
      </div>
      <br />
      <div>
        <strong>Key preview (first 50 chars):</strong>
        <br />
        {key?.substring(0, 50) || 'N/A'}
      </div>
    </div>
  );
}
