// SatQuery AI - Secure Markdown Renderer Component
// Renders AI responses as proper sanitized Markdown (headings, lists, bold, italic, code blocks, tables).
// Prevents raw HTML execution (XSS-safe).

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

export default function MarkdownRenderer({ content, className = '' }) {
  if (!content || typeof content !== 'string') {
    return null;
  }

  return (
    <div className={`satquery-markdown ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          // Ensure links are safe: only allow http, https, mailto, anchor links
          a({ node, href, children, ...props }) {
            const isSafe = /^https?:\/\//i.test(href || '') || /^mailto:/i.test(href || '') || href?.startsWith('#');
            if (!isSafe) {
              return <span>{children}</span>;
            }
            return (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="satquery-md-link"
                {...props}
              >
                {children}
              </a>
            );
          },

          // Pre wrapper for code blocks
          pre({ node, children, ...props }) {
            return (
              <div className="satquery-pre-wrapper">
                {children}
              </div>
            );
          },

          // Safe code rendering: differentiates inline code vs code block
          code({ node, className: codeClassName, children, ...props }) {
            const match = /language-(\w+)/.exec(codeClassName || '');
            const isMultiline = String(children).includes('\n');
            const isBlock = match || isMultiline;

            if (isBlock) {
              return (
                <div className="satquery-code-block font-mono">
                  {match && (
                    <div className="satquery-code-header">
                      <span className="code-lang-tag">{match[1]}</span>
                    </div>
                  )}
                  <pre className="code-pre">
                    <code className={codeClassName} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              );
            }

            return (
              <code className="satquery-inline-code font-mono" {...props}>
                {children}
              </code>
            );
          },

          // Clean semantic table wrapper
          table({ node, children, ...props }) {
            return (
              <div className="satquery-table-wrapper">
                <table className="satquery-table" {...props}>
                  {children}
                </table>
              </div>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
