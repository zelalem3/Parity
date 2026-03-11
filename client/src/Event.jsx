import React from 'react';

export function Events({ events }) {
  // Guard clause: if there are no events, show a friendly message
  if (!events || events.length === 0) {
    return (
      <section className="events-section">
        <h3>System Logs</h3>
        <p style={{ color: '#888' }}>No activity recorded yet.</p>
      </section>
    );
  }

  return (
    <section className="events-section" style={{ marginTop: '20px', borderTop: '1px solid #ccc' }}>
      <h2>Activity Feed</h2>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {events.map((event, index) => (
          <li 
            key={`${index}-${event.substring(0, 5)}`} // Better key than just index
            style={{ 
              padding: '8px', 
              borderBottom: '1px solid #eee',
              fontFamily: 'monospace',
              fontSize: '0.9rem'
            }}
          >
            <span style={{ color: '#007bff' }}>[Event]</span> {event}
          </li>
        ))}
      </ul>
    </section>
  );
}