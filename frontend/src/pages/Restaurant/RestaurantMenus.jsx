import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar";

const RestaurantMenus = () => {
  const { id } = useParams();
  const [menuData, setMenuData] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState(null);

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/dashboard/menu/public/?restaurant_id=${id}`)
      .then((res) => setMenuData(res.data))
      .catch((err) => console.error("Error fetching menu:", err));
  }, [id]);

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h2>{menuData?.restaurant_name || "Menu"}</h2>

        {!menuData ? (
          <p>Loading...</p>
        ) : menuData.sections.length === 0 ? (
          <p>No menu sections found for this restaurant.</p>
        ) : (
          <div className="mb-5">
            {/* Sections */}
            <h5 className="mt-3">Sections</h5>
            <div className="d-flex flex-wrap gap-3 mb-4">
              {menuData.sections.map((section) => (
                <button
                  key={section.section_id}
                  className={`btn ${selectedSectionId === section.section_id ? "btn-dark" : "btn-outline-dark"}`}
                  onClick={() =>
                    setSelectedSectionId(
                      selectedSectionId === section.section_id ? null : section.section_id
                    )
                  }
                >
                  {section.section_name}
                </button>
              ))}
            </div>

            {/* Menu Items */}
            {menuData.sections.map(
              (section) =>
                section.section_id === selectedSectionId &&
                section.items.length > 0 && (
                  <div key={section.section_id} className="row">
                    {section.items.map((item) => (
                      <div key={item.id} className="col-md-4 mb-4">
                        <div className="card h-100 shadow-sm">
                          {item.photo && (
                            <img
                              src={`http://127.0.0.1:8000${item.photo}`}
                              alt={item.name}
                              className="card-img-top"
                              style={{ height: "200px", objectFit: "cover" }}
                            />
                          )}
                          <div className="card-body">
                            <h5>{item.name}</h5>
                            <p>{item.description}</p>
                            <p>
                              <strong>Price:</strong> Rs {item.price}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default RestaurantMenus;
