'use client';

import { useState, useRef, useEffect } from 'react';
import { searchAirports, formatAirportOption, type Airport } from '@/lib/airportSearch';

interface AirportAutocompleteProps {
  name: string;
  placeholder: string;
  required?: boolean;
  value: string;
  onChange: (iata: string, displayValue: string) => void;
  icon?: React.ReactNode;
}

export default function AirportAutocomplete({
  name,
  placeholder,
  required = false,
  value,
  onChange,
  icon,
}: AirportAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Airport[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setInputValue(query);

    // Search airports
    if (query.length >= 2) {
      const results = searchAirports(query);
      setSuggestions(results);
      setShowDropdown(results.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }

    // Update parent with IATA code if it's a valid 3-letter code
    if (query.length === 3) {
      onChange(query.toUpperCase(), query);
    }
  };

  // Handle airport selection
  const selectAirport = (airport: Airport) => {
    const displayValue = formatAirportOption(airport);
    setInputValue(displayValue);
    onChange(airport.iata, displayValue);
    setSuggestions([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectAirport(suggestions[selectedIndex]);
        } else if (suggestions.length > 0) {
          // Auto-select first suggestion if no specific selection
          selectAirport(suggestions[0]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowDropdown(true);
            }
          }}
          placeholder={placeholder}
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
          required={required}
          autoComplete="off"
        />
      </div>

      {/* Dropdown suggestions */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-y-auto"
        >
          {suggestions.map((airport, index) => (
            <button
              key={airport.iata}
              type="button"
              onClick={() => selectAirport(airport)}
              className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors ${index === selectedIndex ? 'bg-blue-100' : ''
                } ${index === 0 ? 'rounded-t-xl' : ''} ${index === suggestions.length - 1 ? 'rounded-b-xl' : ''
                }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">
                    {airport.city}
                    <span className="ml-2 text-xs font-normal text-slate-500">
                      {airport.country}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600">{airport.name}</div>
                </div>
                <div className="ml-4 px-2 py-1 bg-blue-100 text-blue-700 text-sm font-mono font-semibold rounded">
                  {airport.iata}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
