import React from 'react';

// List of Malaysian states based on your dataset
const malaysiaStates = [
  "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan",
  "Pahang", "Perak", "Perlis", "Pulau Pinang", "Sabah",
  "Sarawak", "Selangor", "Terengganu", "W.P. Kuala Lumpur"
];

const Dropdown = ({ countries, selectedCountry, onSelectCountry, view }) => {
  // share the same look as your MalaysiaDashboard <select>
  const style = {
    padding: '6px 8px',
    borderRadius: 4,
    border: '1px solid #00AAFF',
    background: '#1a1a1a',
    color: 'white'
  };

  return (
    <select
      value={selectedCountry}
      onChange={e => onSelectCountry(e.target.value)}
      style={style}
    >
      {view === 'global'
        ? countries.map(country => (
            <option key={country} value={country}>
              {country}
            </option>
          ))
        : malaysiaStates.map(state => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
    </select>
  );
};

export default Dropdown;