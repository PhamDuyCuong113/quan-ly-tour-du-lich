const BookingTable = ({ bookings }) => {
  return (
    <table className="w-full bg-white rounded-xl shadow">
      <thead>
        <tr>
          <th>Mã</th>
          <th>Khách</th>
          <th>Tour</th>
          <th>Tổng</th>
        </tr>
      </thead>
      <tbody>
        {bookings.map((b) => (
          <tr key={b.id}>
            <td>{b.id}</td>
            <td>{b.customerName}</td>
            <td>{b.tourName}</td>
            <td>{b.total?.toLocaleString()} đ</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default BookingTable;
