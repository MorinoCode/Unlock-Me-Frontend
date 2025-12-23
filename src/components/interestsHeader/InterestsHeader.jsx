import React from "react";

const InterestsHeader = ({ name }) => {
  return (
    <>
      <h2>{`${name}, What are your interests?`}</h2>
      <p className="interests-subtitle">
        Select 3 categories and answer their questions to find the best match for you. Don't worry, you can select more categories later and answer questions to find more matches.
      </p>
    </>
  );
};

export default InterestsHeader;