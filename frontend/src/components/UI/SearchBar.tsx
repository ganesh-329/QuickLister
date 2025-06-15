import React, { useState, useEffect, useRef, useCallback } from 'react';
import SearchService, { SearchResult, SearchSuggestion } from '../../services/searchService';

interface SearchBarProps {
  value: string;
  onChange: (query: string) => void;
  onLocationSelect: (place: any) => void;
  isMapsApiLoaded: boolean;
  onSearchSubmit?: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearchSubmit
}) => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasError, setHasError] = useState(false);
  const [lastSearchTime, setLastSearchTime] = useState(0);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(SearchService.getRecentSearches());
  }, []);

  // Optimized search function with rate limiting and error handling
  const performSearch = useCallback(async (query: string) => {
    const now = Date.now();
    
    // Rate limiting - don't search more than once per 500ms
    if (now - lastSearchTime < 500) {
      return;
    }
    
    setLastSearchTime(now);
    
    // Cancel previous search if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    setHasError(false);
    
    try {
      // Get suggestions immediately (local operation)
      const searchSuggestions = await SearchService.getSearchSuggestions(query);
      setSuggestions(searchSuggestions);
      
      // Only search for results if query is substantial
      if (query.length >= 2) {
        const results = await SearchService.quickSearch(query);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
      
      setShowDropdown(true);
    } catch (error: any) {
      console.warn('Search failed, using fallback:', error.message);
      
      // Graceful fallback - still show suggestions even if search fails
      if (!abortControllerRef.current?.signal.aborted) {
        const fallbackSuggestions = SearchService.getSearchSuggestions(query);
        setSuggestions(await fallbackSuggestions);
        setSearchResults([]);
        setHasError(true);
        setShowDropdown(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [lastSearchTime]);

  // Debounced search effect
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.trim().length === 0) {
      setSearchResults([]);
      setSuggestions([]);
      setHasError(false);
      return;
    }

    // Increased debounce time to reduce API calls
    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 600);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, performSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    }
    
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    const totalItems = suggestions.length + searchResults.length + (value ? 1 : 0) + recentSearches.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? totalItems - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        handleItemSelect();
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle item selection
  const handleItemSelect = (query?: string) => {
    const searchQuery = query || value;
    if (searchQuery.trim()) {
      SearchService.saveRecentSearch(searchQuery);
      setRecentSearches(SearchService.getRecentSearches());
      onSearchSubmit?.(searchQuery);
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  };

  // Handle input focus
  const handleFocus = () => {
    if (value.trim() || recentSearches.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    handleItemSelect(suggestion);
  };

  const handleResultClick = (result: SearchResult) => {
    onChange(result.title);
    handleItemSelect(result.title);
  };

  const handleRecentSearchClick = (search: string) => {
    onChange(search);
    handleItemSelect(search);
  };

  // Show dropdown when there's content to show
  const shouldShowDropdown = showDropdown && (
    value.trim().length > 0 || 
    recentSearches.length > 0 || 
    suggestions.length > 0 || 
    searchResults.length > 0
  );

  return (
    <div className="w-full relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="Search for jobs, services, or skills..."
          className="w-full px-4 py-2 pl-10 pr-4 text-gray-900 placeholder-gray-500 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
        
        {/* Search icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          ) : (
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>

      {/* Search results dropdown */}
      {shouldShowDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white shadow-lg rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
          {/* Error state */}
          {hasError && searchResults.length === 0 && value.length >= 2 && (
            <div className="p-4 text-center text-gray-500">
              <div className="text-sm">
                <svg className="h-8 w-8 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium">Search temporarily unavailable</p>
                <p className="text-xs mt-1">Showing popular suggestions instead</p>
              </div>
            </div>
          )}

          {/* Recent searches */}
          {value.trim().length === 0 && recentSearches.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-2 py-1 flex items-center justify-between">
                Recent Searches
                <button
                  onClick={() => {
                    SearchService.clearRecentSearches();
                    setRecentSearches([]);
                  }}
                  className="text-blue-500 hover:text-blue-700 text-xs font-normal normal-case"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={search}
                  onClick={() => handleRecentSearchClick(search)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2 transition-colors ${
                    selectedIndex === index ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                >
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {search}
                </button>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-2 py-1">
                {hasError && searchResults.length === 0 ? 'Popular Categories' : 'Suggestions'}
              </div>
              {suggestions.map((suggestion, index) => {
                const adjustedIndex = index + (value.trim().length === 0 ? recentSearches.length : 0);
                return (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2 transition-colors ${
                      selectedIndex === adjustedIndex ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {suggestion.text}
                    {suggestion.type === 'popular' && (
                      <span className="ml-auto text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded">Popular</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-2 py-1">
                Available Jobs
              </div>
              {searchResults.map((result, index) => {
                const adjustedIndex = index + suggestions.length + (value.trim().length === 0 ? recentSearches.length : 0);
                return (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded transition-colors ${
                      selectedIndex === adjustedIndex ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    <div className="font-medium text-gray-900">{result.title}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                      <span className="bg-gray-100 px-2 py-0.5 rounded">{result.category}</span>
                      {result.paymentRange && (
                        <span className="text-green-600 font-medium">{result.paymentRange}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* No results state */}
          {!isLoading && !hasError && value.length >= 2 && searchResults.length === 0 && suggestions.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <svg className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="font-medium">No results found</p>
              <p className="text-sm mt-1">Try searching for different keywords</p>
            </div>
          )}

          {/* Search button */}
          {value.trim() && (
            <div className="p-2 border-t border-gray-100">
              <button
                onClick={() => handleItemSelect()}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2 transition-colors ${
                  selectedIndex === suggestions.length + searchResults.length + (value.trim().length === 0 ? recentSearches.length : 0) ? 'bg-blue-50 text-blue-700' : ''
                }`}
              >
                <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search for "<span className="font-medium text-blue-600">{value}</span>"</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
