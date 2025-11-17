import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="mb-6 text-gray-600">{icon}</div>}

      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>

      {description && <p className="text-gray-400 max-w-md mb-8">{description}</p>}

      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

// Predefined empty states
export const NoContentFound: React.FC<{ onBrowse?: () => void }> = ({ onBrowse }) => (
  <EmptyState
    icon={
      <svg
        className="w-24 h-24"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>
    }
    title="No content found"
    description="Start exploring our vast collection of movies and series"
    action={onBrowse ? { label: 'Browse Content', onClick: onBrowse } : undefined}
  />
);

export const LibraryEmpty: React.FC<{ onBrowse: () => void }> = ({ onBrowse }) => (
  <EmptyState
    icon={
      <svg
        className="w-24 h-24"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    }
    title="Your library is empty"
    description="Purchase content to start building your collection"
    action={{ label: 'Explore Content', onClick: onBrowse }}
  />
);

export const SearchNoResults: React.FC = () => (
  <EmptyState
    icon={
      <svg
        className="w-24 h-24"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    }
    title="No results found"
    description="Try adjusting your search or filters to find what you're looking for"
  />
);

export const NoContinueWatching: React.FC = () => (
  <EmptyState
    icon={
      <svg
        className="w-20 h-20"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    }
    title="Start watching something!"
    description="Your continue watching list will appear here"
  />
);
