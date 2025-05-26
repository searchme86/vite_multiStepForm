function DisplayDate() {
  const formatCurrentDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <>
      <span className="text-sm text-gray-500" style={{ marginLeft: 'auto' }}>
        작성 날짜: {formatCurrentDate()}
      </span>
    </>
  );
}

export default DisplayDate;
