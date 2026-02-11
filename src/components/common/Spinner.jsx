import React from 'react';

const Spinner = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16 align-middle"></div>
      {/* 
         Note: The 'loader' class typically needs accompanying CSS for animation. 
         If your project uses Tailwind entirely, you might need a custom animation in tailwind.config.js 
         or a style tag here. For safety/portability, I'll add a style tag.
      */}
      <style>{`
        .loader {
          border-top-color: #3498db; /* Blue */
          -webkit-animation: spinner 1.5s linear infinite;
          animation: spinner 1.5s linear infinite;
        }
        @keyframes spinner {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Spinner;
