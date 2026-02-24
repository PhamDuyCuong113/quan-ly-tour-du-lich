import TourCard from "./TourCard";

const TourList = ({ tours, hasPermission }) => {
  return (
    <div className="grid grid-cols-3 gap-6">
      {tours.map((tour) => (
        <TourCard key={tour.id} tour={tour} hasPermission={hasPermission} />
      ))}
    </div>
  );
};

export default TourList;
