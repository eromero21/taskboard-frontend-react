import Column from "./Column.jsx";

function ColumnList({columnsData, onEdit, onDelete}) {
    return (
      <div className="column-list">
          {columnsData.map((column) => (
              <Column key={column.type} columnData={column} onEdit={onEdit} onDelete={onDelete} />
          ))}
      </div>
    );
}

export default ColumnList;