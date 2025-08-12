import React from 'react';
import ReactSlider from 'react-slider';

const TimeSlider = ({ value, onChange }) => {
  return (
    <ReactSlider
      className="time-slider"
      thumbClassName="time-slider-thumb"
      trackClassName="time-slider-track"
      value={value}
      onChange={onChange}
      min={2020}
      max={2024}
    />
  );
};

export default TimeSlider;