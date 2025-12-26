import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Breadcrumbs({ items }) {
  return (
    <nav className="flex items-center gap-2 text-sm mb-6">
      <Link
        to={createPageUrl('Dashboard')}
        className="flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Home</span>
      </Link>
      {items?.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          {item.url ? (
            <Link
              to={item.url}
              className="text-slate-600 hover:text-blue-600 transition-colors font-medium"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 font-bold">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}