export const StatCard = ({ title, count, icon, colorClass }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
    <div className={`p-3 rounded-lg ${colorClass} text-white`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium uppercase">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{count}</h3>
    </div>
  </div>
);