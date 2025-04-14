import React from 'react';

const LoadingOverlay = ({message}:{message?:string}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-700 text-sm">{message?? `جاري تسجيل الدخول...`} </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;