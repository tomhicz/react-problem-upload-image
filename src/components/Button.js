import React from "react";

const Button = ({ text, action }) => {
  return (
    <button
      onClick={action}
      className="bg-white hover:bg-sky-600 hover:text-white rounded-xl shadow-lg"
    >
      {text}
    </button>
  );
};

export default Button;
