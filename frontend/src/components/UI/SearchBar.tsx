import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (query: string) => void;
  onLocationSelect: (place: any) => void;
  isMapsApiLoaded: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onLocationSelect,
  isMapsApiLoaded
}) => {
  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search for jobs, services, or locations..."
          className="w-full px-4 py-2 pl-10 pr-12 text-gray-900 placeholder-gray-500 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {/* Search icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Location icon */}
        <button
          type="button"
          onClick={() => {
            if (isMapsApiLoaded) {
              // Show location picker (to be implemented)
            }
          }}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Results list would go here when implemented */}
      {value && (
        <div className="absolute z-50 w-full mt-1 bg-white shadow-lg rounded-lg border border-gray-200">
          {/* Location and job suggestions would be rendered here */}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
