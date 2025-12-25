import React from "react";
import "./InterestsHeader.css";

const InterestsHeader = ({ name }) => {
  return (
    <div className="interests-header">
      <h2 className="interests-header__title">{`${name}, What are your interests?`}</h2>
      <p className="interests-header__description">
        Select 3 categories and answer their questions to find the best match for you. Don't worry, you can select more categories later and answer questions to find more matches.
      </p>
    </div>
  );
};

export default InterestsHeader;