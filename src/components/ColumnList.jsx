import Column from "./Column.jsx";

function ColumnList({columnsData, onEdit, onDelete}) {
    return (
      <div className="column-list">
          {columnsData.map((column) => (
              <Column key={column.id} columnData={column} onEdit={onEdit} onDelete={onDelete} />
          ))}
      </div>
    );
}

export default ColumnList;