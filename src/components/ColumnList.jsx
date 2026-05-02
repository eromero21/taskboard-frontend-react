import Column from "./Column.jsx";

function ColumnList({columnsData, onOpenDetails, onEdit, onDelete}) {
    return (
      <div className="column-list">
          {columnsData.map((column) => (
              <Column
                  key={column.type}
                  columnData={column}
                  onOpenDetails={onOpenDetails}
                  onEdit={onEdit}
                  onDelete={onDelete}
              />
          ))}
      </div>
    );
}

export default ColumnList;
