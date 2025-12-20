import React, { useEffect, useState } from "react";
import $ from "jquery";
import "datatables.net-dt";

import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { deleteTestemonial, fetchTestemonial } from "../slice/testemonialsManagementSlice";
// import CreateCounsellor from "../form/CreateCounsellor";
import { toast } from "react-toastify";
import CreateTestemonial from "../form/CreateTestemonials";
import { deletePopup, fetchPopup } from "../slice/popupManagement";
import Popup from "../form/Popup";

const PopupManagement = () => {
  const dispatch = useDispatch();
  const [counsellor, setCounsellor] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingCounsellor, setEditingCounsellor] = useState(null);

  // Fetch Counsellor
  const loadCounsellors = async () => {
    const res = await dispatch(fetchPopup());
    // console.log(res, "-----------------------------------");
    if (res?.meta?.requestStatus === "fulfilled") {
      setCounsellor(res.payload);
    }
  };

  // console.log(counsellor, "-----------------------------------");

    // Handle checkbox (select blogs)
    const handleCheckboxChange = (id) => {
      setSelectedIds((prevSelected) => {
        if (prevSelected.includes(id)) {
          return prevSelected.filter((item) => item !== id);
        } else {
          return [...prevSelected, id];
        }
      });
    };

  // Delete single OR multiple blogs
  const handleDelete = async (id) => {
    const idsToDelete = id ? [id] : selectedIds;
    if (idsToDelete.length === 0) {
      toast.warn("⚠️ No popup selected for deletion.");
      return;
    }

    const confirmed = window.confirm(
      idsToDelete.length > 1
        ? `Are you sure you want to delete ${idsToDelete.length} popup?`
        : "Are you sure you want to delete this popup?"
    );
    if (!confirmed) return;

    try {
      const res = await dispatch(deletePopup(idsToDelete));
      // console.log(res);

      if (deletePopup.fulfilled.match(res)) {
        toast.success("✅ Popup deleted successfully!");
        setSelectedIds([]); // clear selection
        loadCounsellors();
      } else if (deletePopup.rejected.match(res)) {
        toast.error(
          "❌ Failed to delete Popup: " +
          (res.payload?.message || res.error?.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("⚠️ Unexpected error: " + (error.message || "Something went wrong"));
    }
  };

  useEffect(() => {
    loadCounsellors();
  }, [dispatch]);

  return (
    <div className="card basic-data-table">
      <div className="card-header" style={{ display: "flex", justifyContent: "space-between" }}>
        <h5 className="card-title mb-0">Popup Table</h5>
        <div>
        

          {selectedIds.length > 0 && (
            <button
              className="btn rounded-pill text-danger radius-8 px-4 py-2"
              onClick={() => handleDelete()}
            >
              Delete Selected ({selectedIds.length})
            </button>
          )}   <button
            type="button"
            className="btn rounded-pill text-primary radius-8 px-4 py-2"
            onClick={() => setShowModal(true)}
          >
            Add University
          </button>


          {showModal && <Popup loadCounsellors={loadCounsellors} ele={editingCounsellor} handleClose={() => {
            setShowModal(false);
            setEditingCounsellor();
          }} />}
        </div>
      </div>
      <div className="card-body overflow-x-auto">
        <>
          <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 4px;
              }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #888;
            border-radius: 4px;
            border: 2px solid #f1f1f1;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background-color: #555;
              }
              `}</style>

          <table
            id="dataTable"
            className="table bordered-table  mb-0"
            data-page-length={10}
          // style={{overflowX:"auto"}}
          >
            <thead>
              <tr>
                <th scope="col"><div className="form-check style-check d-flex align-items-center">
                      <input className="form-check-input" type="checkbox" />
                      <label className="form-check-label">S.L</label>
                    </div>
                </th>
                <th scope="col">Title</th>
                <th scope="col">Target</th>

                <th scope="col">Image</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {counsellor.map((ele, ind) => (
                <tr key={ele._id || ind}>
                  <td>
                  <div className="form-check style-check d-flex align-items-center">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedIds.includes(ele._id)}
                          onChange={() => handleCheckboxChange(ele._id)}
                        />
                        <label className="form-check-label">{ind + 1}</label>
                      </div>
                  </td>
                  <td>
                    {ele?.title}
                  </td>
                    <td>
                    {ele?.target}
                  </td>
                    <td>
                      <a target="_blank" href={ele?.imageURL}>Click To View</a>
                  </td>
                    
                  <td>
                    <Link
                      onClick={() => {
                        setEditingCounsellor(ele);
                        setShowModal(true);
                      }}
                      to="#"
                      className="w-32-px h-32-px me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center"
                    >
                      <Icon icon="lucide:edit" />
                    </Link>
             
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      </div>
    </div>
  )
}

export default PopupManagement