import React from 'react';

const CountryDetails = ({ countryData }) => {
  if (!countryData) {
    return <div>No data available for this country.</div>;
  }

  const { totalDamage = 0, totalAttacks = 0, mostCommonAttackType = 'N/A' } = countryData;

  return (
    <div>
      <h2>Details for {countryData.name}</h2>
      <p>Total Attacks: {totalAttacks}</p>
      <p>Total Damage Estimate (USD): ${totalDamage.toLocaleString()}</p>
      <p>Most Common Attack Type: {mostCommonAttackType}</p> {/* Display the most common attack type */}
    </div>
  );
};

export default CountryDetails;