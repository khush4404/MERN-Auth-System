import React from "react";

const Spinner: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-lg bg-black/30 z-50">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 rounded-full border-4 border-blue-500 opacity-30 animate-ping"></div>
      </div>
    </div>
  );
};

export default Spinner;
