"use client";

import { FaArrowUpFromBracket } from "react-icons/fa6";

export const ButtonTop = () => {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-12 right-12 z-50 bg-indigo-600 rounded-full p-3 shadow-lg cursor-pointer transition-transform duration-300 hover:scale-110"
    >
      <FaArrowUpFromBracket />
    </button>
  );
};
