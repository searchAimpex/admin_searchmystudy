import React, { use, useEffect, useState } from "react";
import $ from "jquery";
import "datatables.net-dt";
const statusStyles = {
  open: {
    bg: "#adf6ad",
    text: "#256029",
  },
  progress: {
    bg: "#fff3b0",
    text: "#7a5d00",
  },
  resolved: {
    bg: "#b7e4ff",
    text: "#004e7c",
  },
  closed: {
    bg: "#ffb0b0",
    text: "#7a1f1f",
  },
};

import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { deleteTestemonial, fetchTestemonial } from "../slice/testemonialsManagementSlice";
// import CreateCounsellor from "../form/CreateCounsellor";
import { toast } from "react-toastify";
import CreateTestemonial from "../form/CreateTestemonials";
import { deletePopup, fetchPopup } from "../slice/popupManagement";
import Popup from "../form/Popup";
import { FetchTicket } from "../slice/ticket";
import { useSelector } from "react-redux";
import TicketStatus from "../form/TicketStatus";

const TicketManagement = () => {
  const dispatch = useDispatch();

  const counsellor = useSelector((state) => state.ticket.ticket);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingCounsellor, setEditingCounsellor] = useState(null);

  // Fetch Counsellor
  const loadCounsellors = async () => {
    const res = await dispatch(fetchPopup());
    const res1 = await dispatch(FetchTicket());
    console.log(res1, "-----------------------------------");

  };

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


        

          {showModal && <TicketStatus fetchData={loadCounsellors} loadCounsellors={loadCounsellors} ele={editingCounsellor} handleClose={() => {
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
                <th scope="col">Category</th>
                <th>Status</th>
                <th>Created By</th>
                  <th>Priority</th>
                <th scope="col">Image</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {counsellor?.map((ele, ind) => (
                <tr key={ele._id || ind}>
                  <td>
                    <div
                     className="form-check style-check d-flex align-items-center"
                     >
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
                    {ele?.category}
                  </td>
                 
                  <td


                  >
                   <p
  style={{
    backgroundColor: statusStyles[ele?.status]?.bg || "#e5e7eb",
    color: statusStyles[ele?.status]?.text || "#374151",
  }}
  className="px-3 py-1 rounded-md text-sm font-medium inline-block capitalize"
>
  {ele?.status}
</p>


                  </td>
                   <td>
                    {ele?.createdBy?.name}
                  </td>
                   <td>
                    {ele?.priority}
                  </td>
                  <td>
                    <a target="_blank" href={ele?.attachments[0]}>Click To View</a>
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

export default TicketManagement