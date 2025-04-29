import React from 'react';

const TableOverlay = ({ tables, floorPlan, onTableSelect, bookedTableIds = [], selectedTable }) => {
  const isBooked = (tableId) => bookedTableIds.includes(tableId);

  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  return (
    <div className="floor-plan-wrapper">
      <div className="floor-plan-container">
        <img src={floorPlan} alt="Floor Plan" className="floor-plan-img" />

        {tables.map((table) => {
          const isSelected = selectedTable?.id === table.id;
          const statusClass = isSelected
            ? 'selected'
            : isBooked(table.id)
              ? 'occupied'
              : 'available';

          return (
            <div
              key={table.id}
              className={`table-marker ${statusClass}`}
              style={{
                top: `${table.y_position}px`,
                left: `${table.x_position}px`,
              }}
              onClick={() => {
                if (!isLoggedIn) {
                  alert("🚫 Please log in to select a table.");
                  return;
                }
                if (!isBooked(table.id)) onTableSelect(table);
              }}
              title={`Table ${table.number} - ${table.capacity} seats`}
            >
              <span>{table.number}</span>
              <small>{table.capacity} seats</small>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TableOverlay;
