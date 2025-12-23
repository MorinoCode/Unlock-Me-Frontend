import React from "react";
import "./FormSelect.css";

const FormSelect = ({ 
  name, 
  value, 
  onChange, 
  onBlur, 
  error, 
  options, 
  defaultText 
}) => {
  return (
    <div className="select-wrapper">
      <select
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className="signup-input" 
      >
        <option value="">{defaultText}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export default FormSelect;