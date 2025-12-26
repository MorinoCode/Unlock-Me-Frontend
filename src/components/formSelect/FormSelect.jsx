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
    <div className="form-select">
      <select
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className="form-select__field" 
      >
        <option className="form-select__option" value="">{defaultText}</option>
        {options.map((opt) => (
          <option className="form-select__option" key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="form-select__error">{error}</span>}
    </div>
  );
};

export default FormSelect;