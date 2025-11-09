import React from "react";

const Loader = () => {
  return (
    <>
      <div className="relative w-32 h-1.5 rounded-full bg-black/20 overflow-hidden">
        <div className="absolute top-0 left-0 h-full bg-blue-600 rounded-full animate-moving" />
      </div>
      <span className="visually-hidden">Loading...</span>
    </>
  );
};

export default Loader;
