
import React from 'react';

interface TagProps {
  text: string;
}

const Tag: React.FC<TagProps> = ({ text }) => {
  return (
    <span className="inline-block bg-slate-200 rounded-full px-3 py-1 text-xs font-semibold text-slate-700">
      {text}
    </span>
  );
};

export default Tag;
