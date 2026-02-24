import { Home, Package, Users, ShoppingCart, BarChart3 } from "lucide-react";

const Sidebar = ({ sidebarOpen, currentPage, setCurrentPage, currentUser }) => {
  const navItems = [
    { id: "home", label: "Trang Chủ", icon: Home },
    { id: "tours", label: "Tour", icon: Package },
    { id: "bookings", label: "Đặt Tour", icon: ShoppingCart },
    { id: "customers", label: "Khách Hàng", icon: Users },
    { id: "reports", label: "Báo Cáo", icon: BarChart3 },
  ];

  return (
    <div className={`${sidebarOpen ? "w-64" : "w-20"} bg-blue-900 text-white transition`}>
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                currentPage === item.id ? "bg-blue-700" : "hover:bg-blue-800"
              }`}
            >
              <Icon size={20} />
              {sidebarOpen && item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
