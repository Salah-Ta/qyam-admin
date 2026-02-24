import { useState } from "react";

export function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex mr-2">
      <button
        type="button"
        className="w-5 h-5 rounded-full bg-[#f0f2f5] hover:bg-[#e5e7eb] flex items-center justify-center text-[#535862] text-xs font-bold transition-colors"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
      >
        !
      </button>
      {show && (
        <div className="absolute top-full right-0 mt-1 w-64 bg-[#181d27] text-white text-xs rounded-lg p-3 shadow-lg z-50 [direction:rtl] leading-5">
          {text}
          <div className="absolute -top-1 right-3 w-2 h-2 bg-[#181d27] rotate-45" />
        </div>
      )}
    </span>
  );
}
