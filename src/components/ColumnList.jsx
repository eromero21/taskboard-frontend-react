
function ColumnList({columnData}) {
    return (
      <div className="column-list">
          {columnData.map((column, i) => (
              <p key={column.id}>Column number {i}, Name: {column.name}</p>
          ))}
      </div>
    );
}

export default ColumnList;