export default function ProgressBar({ value }) {
  return (
    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
      <div
        className="h-2 rounded-full bg-blue-500 transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
