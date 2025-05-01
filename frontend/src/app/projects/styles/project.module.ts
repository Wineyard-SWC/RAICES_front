export const cardStyles = {
  wrapper: "border-2 border-[#694969] rounded-2xl p-4 shadow-md bg-white space-y-3",
  header: "flex justify-between items-start",
  title: "text-2xl font-bold text-black truncate",
  menu: "text-gray-500 text-lg",
  badge: "text-sm px-2 py-1 rounded-full font-semibold",
  description: "text-lg text-[#694969]",
  progressLabel: "text-lg font-medium text-black mb-1",
  progressBarContainer: "w-full bg-gray-200 rounded-full h-3",
  progressBar: "h-3 rounded-full bg-[#4A2B4A]",
  progressPercent: "text-right text-m mt-1 text-black font-medium",
  infoRow: "grid grid-cols-2 gap-10 text-black border-t pt-2 text-lg text-black",
  infoBlock: "flex items-center gap-2",
  infoLabel: "text-sm",
  infoValue: "font-medium",
  footer: "grid grid-cols-2 gap-10 text-black border-t pt-2 text-lg text-black",
  footerItem: "flex items-center gap-2",
  footerValue: "font-semibold",
};
  
export const statusColor = {
  Active: "bg-green-200 text-green-800",
  Completed: "bg-blue-200 text-blue-800",
  "On Hold": "bg-yellow-200 text-yellow-800",
};
  
export const priorityColor = {
  High: "bg-red-200 text-red-800",
  Medium: "bg-yellow-200 text-yellow-800",
  Low: "bg-green-200 text-green-800",
};