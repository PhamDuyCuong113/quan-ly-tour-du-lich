const HomePage = ({ tours, customers, bookings }) => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">Tours: {tours.length}</div>
        <div className="bg-white p-6 rounded-xl shadow">Customers: {customers.length}</div>
        <div className="bg-white p-6 rounded-xl shadow">Bookings: {bookings.length}</div>
      </div>
    </div>
  );
};

export default HomePage;
