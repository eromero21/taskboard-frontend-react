import Column from "./Column.jsx";

function ColumnList({columnsData, onEdit}) {
    return (
      <div className="column-list">
          {columnsData.map((column) => (
              <Column key={column.id} columnData={column} onEdit={onEdit} />
          ))}
      </div>
    );
}

export default ColumnList;