import React, { useEffect, useState } from "react";
import "datatables.net-dt/css/dataTables.dataTables.min.css";

import { Icon } from "@iconify/react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import TicketStatus from "../form/TicketStatus";
import {
  deleteCounselor,
  deleteCounselorCoursefinder,
  fetchCoursefinderCounselor,
  // deleteCoursefinderCounselor,
} from "../slice/CounselorManagerSlice";

/* ================= HELPERS ================= */
const renderValue = (value) => {
  if (value === null || value === undefined || value === "" || value === "null") {
    return <span style={{ color: "red", fontWeight: 600 }}>EMPTY</span>;
  }
  return value;
};

const renderLink = (url) => {
  if (!url) {
    return <span style={{ color: "red", fontWeight: 600 }}>EMPTY</span>;
  }
  return (
    <a href={url} target="_blank" rel="noreferrer">
      View
    </a>
  );
};

const CounselorManagement = () => {
  const dispatch = useDispatch();

  /* ================= REDUX ================= */
  const courseFinderCounsellor = useSelector(
    (state) => state.counsellors?.courseFinderCounsellor || []
  );

  /* ================= STATE ================= */
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCounsellor, setEditingCounsellor] = useState(null);

  /* ================= FILTER STATE ================= */
  const [filters, setFilters] = useState({
    counsellorCode: "",
    centerCode: "",
    role: "",
  });

  /* ================= FETCH ================= */
  const loadCounsellors = async () => {
    await dispatch(fetchCoursefinderCounselor());
  };

  useEffect(() => {
    loadCounsellors();
  }, []);

  /* ================= FILTER LOGIC ================= */
  const filteredCounsellors = courseFinderCounsellor.filter((ele) => {
    const matchCounsellorCode =
      !filters.counsellorCode ||
      ele?.CounsellorCOde
        ?.toLowerCase()
        .includes(filters.counsellorCode.toLowerCase());

    const matchCenterCode =
      !filters.centerCode ||
      ele?.CenterCode
        ?.toLowerCase()
        .includes(filters.centerCode.toLowerCase());

    const matchRole =
      !filters.role || ele?.role === filters.role;

    return matchCounsellorCode && matchCenterCode && matchRole;
  });

  /* ================= CHECKBOX ================= */
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(filteredCounsellors.map((c) => c._id));
    } else {
      setSelectedIds([]);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const idsToDelete = id ? [id] : selectedIds;

    if (!idsToDelete.length) {
      toast.warn("No counselor selected");
      return;
    }

    const confirm = window.confirm(
      idsToDelete.length > 1
        ? `Delete ${idsToDelete.length} counselors?`
        : "Delete this counselor?"
    );

    if (!confirm) return;
    const res = await dispatch(deleteCounselorCoursefinder(idsToDelete));
    console.log(res,"::::::::::::::::::::::::::::::::::;")
    // if (deleteCoursefinderCounselor.fulfilled.match(res)) {
    //   toast.success("Deleted successfully");
    //   setSelectedIds([]);
    //   loadCounsellors();
    // } else {
    //   toast.error("Delete failed");
    // }
  };

  /* ================= UI ================= */
  return (
    <div className="card basic-data-table">
      {/* Checkbox visibility fix */}
      <style>{`
        table input[type="checkbox"] {
          display: inline-block !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
      `}</style>

      <div className="card-header d-flex justify-content-between">
        <h5 className="card-title mb-0">Counselor Management</h5>

        {selectedIds.length > 0 && (
          <button
            onClick={() => handleDelete()}
            className="btn btn-danger btn-sm"
          >
            Delete Selected ({selectedIds.length})
          </button>
        )}
      </div>

      <div className="card-body overflow-x-auto">
        {/* ================= FILTER UI ================= */}
        <div className="row mb-3">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search Counsellor Code"
              value={filters.counsellorCode}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  counsellorCode: e.target.value,
                })
              }
            />
          </div>

          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search Center Code"
              value={filters.centerCode}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  centerCode: e.target.value,
                })
              }
            />
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={filters.role}
              onChange={(e) =>
                setFilters({ ...filters, role: e.target.value })
              }
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="counsellor">Counsellor</option>
              <option value="partner">Partner</option>
              <option value="franchise">Franchise</option>
            </select>
          </div>

          <div className="col-md-3">
            <button
              className="btn btn-secondary w-100"
              onClick={() =>
                setFilters({
                  counsellorCode: "",
                  centerCode: "",
                  role: "",
                })
              }
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <table className="table bordered-table mb-0">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  className="form-check-input"
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th>#</th>
              <th>Owner</th>
              <th>Institution</th>
              <th>Name</th>
              <th>DOB</th>
              <th>Center</th>
              <th>Role</th>
              <th>Contact</th>
              <th>Whatsapp</th>
              <th>Email</th>
              <th>Password</th>
              <th>Account</th>
              <th>Code</th>
              <th>Back Aadhar</th>
              <th>Logo</th>
              <th>Profile</th>
              <th>Visit Office</th>
              <th>Cancelled Check</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredCounsellors.map((ele, ind) => (
              <tr key={ele._id}>
                <td>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectedIds.includes(ele._id)}
                    onChange={() => handleCheckboxChange(ele._id)}
                  />
                </td>
                <td>{ind + 1}</td>
                <td>{renderValue(ele?.OwnerName)}</td>
                <td>{renderValue(ele?.InsitutionName)}</td>
                <td>{renderValue(ele?.name)}</td>
                <td>{renderValue(ele?.DateOfBirth)}</td>
                <td>{renderValue(ele?.CenterCode)}</td>
                <td>{renderValue(ele?.role)}</td>
                <td>{renderValue(ele?.ContactNumber)}</td>
                <td>{renderValue(ele?.WhatappNumber)}</td>
                <td>{renderValue(ele?.email)}</td>
                <td>{renderValue(ele?.passwordTracker)}</td>
                <td>{renderValue(ele?.accountedDetails)}</td>
                <td>{renderValue(ele?.CounsellorCOde)}</td>
                <td>{renderLink(ele?.BackAdhar)}</td>
                <td>{renderLink(ele?.Logo)}</td>
                <td>{renderLink(ele?.ProfilePhoto)}</td>
                <td>{renderLink(ele?.VistOffice)}</td>
                <td>{renderLink(ele?.CancelledCheck)}</td>
                <td>{renderValue(ele?.createdAt)}</td>
                <td className="d-flex gap-2">
                  <button
                    onClick={() => {
                      setEditingCounsellor(ele);
                      setShowModal(true);
                    }}
                    className="btn btn-sm btn-success"
                  >
                    <Icon icon="lucide:edit" />
                  </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <TicketStatus
          ele={editingCounsellor}
          fetchData={loadCounsellors}
          handleClose={() => {
            setShowModal(false);
            setEditingCounsellor(null);
          }}
        />
      )}
    </div>
  );
};

export default CounselorManagement;
