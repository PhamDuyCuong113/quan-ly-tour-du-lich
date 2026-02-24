import { Menu, Shield } from "lucide-react";

const Topbar = ({ sidebarOpen, setSidebarOpen, currentUser }) => {
  return (
    <div className="bg-white border-b p-4 flex justify-between">
      <button onClick={() => setSidebarOpen(!sidebarOpen)}>
        <Menu />
      </button>
      <div className="flex items-center gap-2 text-blue-600">
        <Shield />
        <span className="capitalize">{currentUser.role}</span>
      </div>
    </div>
  );
};

export default Topbar;
