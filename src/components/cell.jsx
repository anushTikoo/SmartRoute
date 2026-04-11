function Cell({ row, col, isStart, isFinish, isWall, isVisited, isInPath, weight, onClick }) {
  let cellClass = "w-6 h-6 border border-gray-300 flex items-center justify-center text-xs font-bold cursor-pointer select-none ";

  if (isStart) {
    cellClass += "bg-green-500 text-white";
  } else if (isFinish) {
    cellClass += "bg-red-500 text-white";
  } else if (isWall) {
    cellClass += "bg-gray-800";
  } else if (isInPath) {
    cellClass += "bg-yellow-400 text-black";
  } else if (isVisited) {
    cellClass += "bg-blue-400 text-white";
  } else {
    cellClass += "bg-white text-gray-700";
  }

  return (
    <div
      className={cellClass}
      onClick={() => onClick(row, col)}
      title={`Weight: ${weight}`}
    >
      {!isWall && !isStart && !isFinish && weight}
    </div>
  );
}

export default Cell;
