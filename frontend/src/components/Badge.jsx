const variants = {
  // Status
  'Pending': 'bg-yellow-100 text-yellow-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Completed': 'bg-green-100 text-green-700',
  'Not Started': 'bg-gray-100 text-gray-700',
  // Priority
  'Low': 'bg-green-100 text-green-700',
  'Medium': 'bg-yellow-100 text-yellow-700',
  'High': 'bg-red-100 text-red-700',
  // Type
  'Bug': 'bg-red-100 text-red-700',
  'Feature': 'bg-blue-100 text-blue-700',
  'Enhancement': 'bg-purple-100 text-purple-700',
};

export default function Badge({ value }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${variants[value] || 'bg-gray-100 text-gray-700'}`}>
      {value}
    </span>
  );
}
