import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import 'github-markdown-css';

interface Props {
  content: string;
}

const MarkdownRenderer: React.FC<Props> = ({ content }) => {
  return (
    <div className="markdown-body" style={{ 
      lineHeight: 1.7,
      fontSize: '16px',
      wordBreak: 'break-word'
    }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, className, children, ...props }) {
            return (
              <code
                className={className}
                style={{
                  background: 'rgba(0,0,0,0.05)',
                  padding: '3px 6px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace'
                }}
                {...props}
              >
                {children}
              </code>
            )
          },
          table({ node, children }) {
            return (
              <div style={{ overflowX: 'auto', margin: '12px 0' }}>
                <table style={{ 
                  borderCollapse: 'collapse',
                  minWidth: '100%'
                }}>
                  {children}
                </table>
              </div>
            )
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;