import React, { useEffect, useState } from "react";
import $ from "jquery";
import "datatables.net-dt";

import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  deleteTestemonial,
  fetchTestemonial,
} from "../slice/testemonialsManagementSlice";
import { toast } from "react-toastify";
import CreateTestemonial from "../form/CreateTestemonials";

const CounsellorManager = () => {
  const dispatch = useDispatch();
  const [counsellor, setCounsellor] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCounsellor, setEditingCounsellor] = useState(null);


  const loadCounsellors = async () => {
    const res = await dispatch(fetchTestemonial());
    console.log(res, "-----------------------------------");
    if (res?.meta?.requestStatus === "fulfilled") {
      setCounsellor(res.payload);
    }
  };


  useEffect(() => {
    loadCounsellors();
  }, [dispatch]);

  // ✅ Initialize DataTable
  useEffect(() => {
    if (counsellor?.length > 0) {
      if ($.fn.DataTable.isDataTable("#dataTable")) {
        $("#dataTable").DataTable().destroy();
      }
      $("#dataTable").DataTable({
        paging: true,
        searching: true,
        pageLength: 5,
        lengthMenu: [5, 10, 20, 50],
        columnDefs: [
          { targets: [1], searchable: true }, // Name searchable
          { targets: "_all", searchable: false },
        ],
      });
    }
  }, [counsellor]);

  // ✅ Checkbox (single)
  const handleCheckboxChange = (id) => {
    setSelectedIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id)
        : [...prevSelected, id]
    );
  };

  // ✅ Master checkbox (all select/unselect)
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(counsellor.map((c) => c._id));
    } else {
      setSelectedIds([]);
    }
  };
  // Delete single OR multiple blogs
  const handleDelete = async (id) => {
    const idsToDelete = id ? [id] : selectedIds;
    if (idsToDelete.length === 0) {
      toast.warn("⚠️ No blogs selected for deletion.");
      return;
    }

    const confirmed = window.confirm(
      idsToDelete.length > 1
        ? `Are you sure you want to delete ${idsToDelete.length} blogs?`
        : "Are you sure you want to delete this blog?"
    );
    if (!confirmed) return;

    try {
      const res = await dispatch(deleteTestemonial(idsToDelete));
      // console.log(res);

      if (deleteTestemonial.fulfilled.match(res)) {
        toast.success("✅ Counsellor deleted successfully!");
        setSelectedIds([]); // clear selection
        loadCounsellors();
      } else if (deleteCounsellor.rejected.match(res)) {
        toast.error(
          "❌ Failed to delete Counsellor: " +
          (res.payload?.message || res.error?.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("⚠️ Unexpected error: " + (error.message || "Something went wrong"));
    }
  };


  return (
    <div className="card basic-data-table">
      <div
        className="card-header"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <h5 className="card-title mb-0">Counsellors Table</h5>
        <div>
          <button
            type="button"
            className="btn rounded-pill text-primary radius-8 px-4 py-2"
            onClick={() => setShowModal(true)}
          >
            Add Counselor
          </button>

          {selectedIds.length > 0 && (
            <button
              className="btn rounded-pill text-danger radius-8 px-4 py-2"
              onClick={() => handleDelete()}
            >
              Delete Selected ({selectedIds.length})
            </button>
          )}

          {showModal && (
            <CreateTestemonial
              loadCounsellors={loadCounsellors}
              ele={editingCounsellor}
              handleClose={() => {
                setShowModal(false);
                setEditingCounsellor(null);
              }}
            />
          )}
        </div>
      </div>

      <div className="card-body overflow-x-auto">
        <table id="dataTable" className="table bordered-table mb-0">
          <thead>
            <tr>
              <th scope="col">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    selectedIds.length === counsellor.length &&
                    counsellor.length > 0
                  }
                />
                <label className="form-check-label">S.L</label>
              </th>
              <th scope="col">Name</th>
              <th scope="col">Experience</th>
              <th scope="col">Degree</th>
              <th scope="col">Location</th>
              <th scope="col">Rating</th>
              <th scope="col">Description</th>
              <th scope="col">Click to View</th>
              <th scope="col">Created At</th>
              <th scope="col">Action</th>             
            </tr>
          </thead>
          <tbody>
            {counsellor.map((ele, ind) => (
              <tr key={ele._id || ind}>
                <td>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectedIds.includes(ele._id)}
                    onChange={() => handleCheckboxChange(ele._id)}
                  />
                  {/* <label className="form-check-label">{ind + 1}</label> */}
                </td>
                <td>{ele?.name}</td>
                <td>{ele?.experience}</td>
                <td>{ele?.degree}</td>
                <td>{ele?.location}</td>
                <td>{ele?.rating}</td>
                <td>
                  <div
                    className="custom-scrollbar"
                    style={{
                      width: "300px",
                      height: "50px",
                      overflowY: "auto",
                      overflowX: "hidden",
                      whiteSpace: "normal",
                    }}
                  >
                    <h6 className="text-md mb-0 fw-medium flex-grow-1">
                      {ele?.description.slice(0, 300)}
                    </h6>
                  </div>
                </td>
                <td>
                  <a href={ele?.imageURL} target="_blank" rel="noopener noreferrer">
                    Click to View
                  </a>
                </td>
                <td>{new Date(ele?.createdAt).toLocaleDateString()}</td>
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
                  <Link
                    onClick={() => handleDelete(ele?._id)}
                    to="#"
                    className="w-32-px h-32-px bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center"
                  >
                    <Icon icon="mingcute:delete-2-line" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CounsellorManager;
