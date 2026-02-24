const ReportsPage = ({ tours }) => {
  return (
    <div>
      <h2 className="text-3xl font-bold">Báo Cáo</h2>
      <p>Tổng số tour: {tours.length}</p>
    </div>
  );
};

export default ReportsPage;
