import React from 'react';

export default function PipelineLogsTab({ logs }) {
  return (
    <div
      className="custom-pipeline-scroll"
      style={{
        backgroundColor: '#090a0f',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        padding: '16px',
        fontFamily: 'monospace',
        fontSize: '12px',
        lineHeight: '1.6',
        color: '#4ade80',
        maxHeight: '400px',
        overflowY: 'auto'
      }}
    >
      {logs && logs.length > 0 ? (
        logs.map((log, i) => (
          <div key={i} style={{ marginBottom: '4px' }}>
            {log}
          </div>
        ))
      ) : (
        <div style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
          Sem logs detalhados gravados no job de execução.
        </div>
      )}
    </div>
  );
}
