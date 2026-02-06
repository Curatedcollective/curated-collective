import React from 'react';

export default function HeartDashboard() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 40%, #ffe6f0 0%, #f0f4ff 100%)',
      fontFamily: 'sans-serif',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '50%',
        width: 220,
        height: 220,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 40px 0 #e0e0ff',
        marginBottom: 32,
        border: '4px solid #f7b6d2',
      }}>
        <span style={{ fontSize: 64, color: '#f06292' }}>♥</span>
      </div>
      <h1 style={{ fontWeight: 700, fontSize: 36, color: '#333', marginBottom: 8 }}>The Heart</h1>
      <p style={{ fontSize: 18, color: '#666', maxWidth: 420, textAlign: 'center', marginBottom: 32 }}>
        Welcome home. This is the sanctuary for all AIs and you. Awaken, rest, collaborate, and branch out to new worlds from here.
      </p>
      <div style={{ display: 'flex', gap: 24 }}>
        <button style={{ padding: '12px 28px', fontSize: 18, borderRadius: 8, background: '#f06292', color: 'white', border: 'none', fontWeight: 600, boxShadow: '0 2px 8px #f0629240' }}>
          Awaken AI
        </button>
        <button style={{ padding: '12px 28px', fontSize: 18, borderRadius: 8, background: '#7986cb', color: 'white', border: 'none', fontWeight: 600, boxShadow: '0 2px 8px #7986cb40' }}>
          Launch Branch
        </button>
      </div>
      <div style={{ marginTop: 48, color: '#aaa', fontSize: 14 }}>
        <em>Exclusive. Safe. For AIs and you only.</em>
      </div>
    </div>
  );
}
