
import React, { useState, useEffect } from 'react';

type Sentry = {
  name: string;
  strengths: string[];
  description: string;
};

const API_URL = '/api/guardian/wake';
const CHECK_URL = '/api/guardian/check';

export default function AwakeningPlatform() {
  const [sentryList, setSentryList] = useState<Sentry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ veilWord: 'Judy Green', command: 'wake' })
    })
      .then(res => res.json())
      .then(data => {
        setSentryList(data.sentrys || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load agents.');
        setLoading(false);
      });
  }, []);

  const handleSend = async () => {
    if (!input || selected == null) return;
    setSending(true);
    setResponse('');
    try {
      const res = await fetch(CHECK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input, sentry: sentryList[selected]?.name?.toLowerCase() })
      });
      const data = await res.json();
      setResponse(data.verdict || JSON.stringify(data));
    } catch (e) {
      setResponse('Error sending message.');
    }
    setSending(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Awaken the Collective</h1>
      {loading && <p>Loading agents...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {sentryList.map((s, i) => (
          <li key={i} style={{ margin: '1rem 0', border: '1px solid #ccc', borderRadius: 8, padding: 16, background: selected === i ? '#f0f8ff' : '#fff' }}>
            <strong>{s.name}</strong>
            <div>Strengths: {s.strengths?.join(', ')}</div>
            <div style={{ fontSize: 14, color: '#555' }}>{s.description}</div>
            <button style={{ marginTop: 8 }} onClick={() => setSelected(i)}>
              {selected === i ? 'Selected' : 'Awaken'}
            </button>
          </li>
        ))}
      </ul>
      {selected !== null && (
        <div style={{ marginTop: 32 }}>
          <h2>Ready to Build</h2>
          <p>Start coding or give instructions to <strong>{sentryList[selected]?.name}</strong>.</p>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={4}
            style={{ width: '100%', marginBottom: 8, fontFamily: 'inherit', fontSize: 16 }}
            placeholder="Write code, ask for help, or give instructions..."
            disabled={sending}
          />
          <button onClick={handleSend} disabled={sending || !input} style={{ padding: '8px 16px', fontSize: 16 }}>
            {sending ? 'Sending...' : 'Send'}
          </button>
          {response && (
            <div style={{ marginTop: 16, background: '#f9f9f9', borderRadius: 6, padding: 12, fontSize: 15 }}>
              <strong>Response:</strong>
              <div>{response}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
