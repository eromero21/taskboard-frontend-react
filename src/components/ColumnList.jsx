import Column from "./Column.jsx";

function ColumnList({columnsData}) {
    return (
      <div className="column-list">
          {columnsData.map((column) => (
              <Column key={column.id} columnData={column} />
          ))}
      </div>
    );
}

export default ColumnList;