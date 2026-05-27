import React from 'react';

export default function VideoCard({ item, onChannelClick, onPersonClick, onTopicClick, onSeriesClick }) {
  const linkStyle = { color: '#007BFF', cursor: 'pointer', textDecoration: 'underline' };

  return (
    <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', background: '#fff' }}>
      <h2 style={{ marginTop: 0 }}>
        {item.type === 'podcast' ? '🎙️' : '🎥'} <a href={item.url} target="_blank" rel="noreferrer" style={{ color: '#333' }}>{item.title}</a>
      </h2>
      
      <p style={{ margin: '5px 0' }}>
        <strong>Channel:</strong>{' '}
        <span style={linkStyle} onClick={() => onChannelClick(item.author.name)}>
          {item.author.name}
        </span>
      </p>
      
      {item.guests && item.guests.length > 0 && (
        <p style={{ margin: '5px 0' }}>
          <strong>Guests: </strong> 
          {item.guests.map((guest, index) => (
            <span key={guest}>
              <span style={linkStyle} onClick={() => onPersonClick(guest)}>{guest}</span>
              {index < item.guests.length - 1 ? ', ' : ''}
            </span>
          ))}
        </p>
      )}

      {item.series && (
        <p style={{ margin: '5px 0' }}>
          <strong>Series: </strong>
          <span style={{...linkStyle, fontStyle: 'italic'}} onClick={() => onSeriesClick(item.series.name)}>
            {item.series.name}
          </span>
        </p>
      )}

      {item.topics && item.topics.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          {item.topics.map(topic => (
            <span 
              key={topic} 
              onClick={() => onTopicClick(topic)}
              style={{ fontSize: '0.85em', color: '#6f42c1', cursor: 'pointer', marginRight: '10px', textDecoration: 'underline' }}
            >
              #{topic}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}