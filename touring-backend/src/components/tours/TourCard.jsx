const TourCard = ({ tour, hasPermission }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <img src={tour.image} alt={tour.name} className="h-40 w-full object-cover rounded" />
      <h3 className="font-bold mt-2">{tour.name}</h3>
      <p>{tour.price?.toLocaleString()} đ</p>

      {hasPermission("edit") ? (
        <button className="bg-blue-600 text-white px-4 py-2 mt-2 rounded">Sửa</button>
      ) : (
        <button className="bg-green-600 text-white px-4 py-2 mt-2 rounded">Đặt ngay</button>
      )}
    </div>
  );
};

export default TourCard;
