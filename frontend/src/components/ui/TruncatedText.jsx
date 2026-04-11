import { useState } from 'react';

export const TruncatedText = ({ text, limit = 100, className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = text?.length > limit;

  if (!text) return null;

  return (
    <div className={`space-y-1 ${className}`}>
      <p className="text-sm text-muted-foreground leading-relaxed transition-all">
        {isExpanded ? text : `${text.substring(0, limit)}${shouldTruncate ? '...' : ''}`}
      </p>
      {shouldTruncate && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tighter"
        >
          {isExpanded ? 'Show Less' : 'Read More'}
        </button>
      )}
    </div>
  );
};
