import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "./FormInput.css";

const FormInput = ({
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  autoFocus = false,
  autoComplete,
  autoCapitalize,
  autoCorrect,
  maxLength,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";
  const inputType = isPasswordField && showPassword ? "text" : type;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="form-input">
      <div className="form-input__wrapper">
        <input
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`form-input__field ${
            isPasswordField ? "form-input__field--password" : ""
          }`}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          maxLength={maxLength}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          {...rest}
        />
        {isPasswordField && (
          <button
            type="button"
            className="form-input__toggle-password"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={0}
          >
            {showPassword ? (
              <EyeOff size={20} className="form-input__eye-icon" />
            ) : (
              <Eye size={20} className="form-input__eye-icon" />
            )}
          </button>
        )}
      </div>
      {error && (
        <span className="form-input__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default FormInput;
