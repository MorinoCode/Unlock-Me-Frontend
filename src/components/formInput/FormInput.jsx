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
    <div className="form-input">
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className="form-input__field" 
        autoFocus={autoFocus}
      />
      {error && <span className="form-input__error">{error}</span>}
    </div>
  );
};

export default FormInput;