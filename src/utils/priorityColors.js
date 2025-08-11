// src/utils/priorityColors.js

export const getPriorityColor = (priority) => {
  switch (priority) {
    case "Aggressively Pursue":
      return "bg-red-500 text-white";
    case "Monitor":
      return "bg-yellow-500 text-white";
    default:
      return "bg-gray-300 text-black";
  }
};
