import TourList from "../tours/TourList";

const ToursPage = ({ tours, hasPermission }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Danh Sách Tour</h2>
      <TourList tours={tours} hasPermission={hasPermission} />
    </div>
  );
};

export default ToursPage;
