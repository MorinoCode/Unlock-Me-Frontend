import React from "react";
import "./FormInput.css";

const FormInput = ({ 
  name, 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  onBlur, 
  error, 
  autoFocus = false 
}) => {
  return (
    <div className="input-wrapper">
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className="signup-input" 
        autoFocus={autoFocus}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export default FormInput;