import React, { useEffect, useState } from "react";
import "datatables.net-dt/css/dataTables.dataTables.min.css";

import { Icon } from "@iconify/react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import TicketStatus from "../form/TicketStatus";
import {
  deleteCounselorCoursefinder,
  fetchCoursefinderCounselor,
} from "../slice/CounselorManagerSlice";

/* ================= HELPERS ================= */
const renderValue = (value) => {
  if (value === null || value === undefined || value === "" || value === "null") {
    return <span style={{ color: "red", fontWeight: 600 }}>EMPTY</span>;
  }
  return value;
};

/* ================= COMPONENT ================= */
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
    role: "",
    centerCode: "",
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

    const matchRole =
      !filters.role ||
      ele?.createdBy?.role
        ?.toLowerCase()
        .includes(filters.role.toLowerCase());

    const matchCenterCode =
      !filters.centerCode ||
      ele?.createdBy?.CounsellorCOde
        ?.toLowerCase()
        .includes(filters.centerCode.toLowerCase());

    return matchCounsellorCode && matchRole && matchCenterCode;
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

    if (res?.meta?.requestStatus === "fulfilled") {
      toast.success("Deleted successfully");
      setSelectedIds([]);
      loadCounsellors();
    } else {
      toast.error("Delete failed");
    }
  };

  /* ================= EXCEL DOWNLOAD ================= */
  const downloadExcel = () => {
    const data = filteredCounsellors.map((ele, index) => ({
      "#": index + 1,
      Owner: ele?.createdBy?.OwnerName || "",
      CounsellorName: ele?.name || "",
      CounsellorCode: ele?.CounsellorCOde || "",
      Role: ele?.createdBy?.role || "",
      Email: ele?.email || "",
      Password: ele?.passwordTracker || "",
      CenterCode: ele?.createdBy?.CounsellorCOde || "",
      CenterName: ele?.createdBy?.name || "",
      CreatedAt: ele?.createdAt || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Counsellors");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "Counsellor_List.xlsx");
  };

  /* ================= UI ================= */
  return (
    <div className="card basic-data-table">
      <style>{`
        table input[type="checkbox"] {
          display: inline-block !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
      `}</style>

      {/* HEADER */}
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Counselor Management</h5>

        <div className="d-flex gap-2">
          <button className="btn btn-success btn-sm" onClick={downloadExcel}>
            Download Excel
          </button>

          {selectedIds.length > 0 && (
            <button
              onClick={() => handleDelete()}
              className="btn btn-danger btn-sm"
            >
              Delete Selected ({selectedIds.length})
            </button>
          )}
        </div>
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
                setFilters({ ...filters, counsellorCode: e.target.value })
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
              <option value="partner">Partner</option>
              <option value="franchise">Franchise</option>
            </select>
          </div>

          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search Center Code"
              value={filters.centerCode}
              onChange={(e) =>
                setFilters({ ...filters, centerCode: e.target.value })
              }
            />
          </div>

          <div className="col-md-3">
            <button
              className="btn btn-secondary w-100"
              onClick={() =>
                setFilters({
                  counsellorCode: "",
                  role: "",
                  centerCode: "",
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
              <th>Counsellor Name</th>
              <th>Counsellor Code</th>
              <th>Role</th>
              <th>Email</th>
              <th>Password</th>
              <th>Center Code</th>
              <th>Center Name</th>
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
                <td>{renderValue(ele?.createdBy?.OwnerName)}</td>
                <td>{renderValue(ele?.name)}</td>
                <td>{renderValue(ele?.CounsellorCOde)}</td>
                <td>{renderValue(ele?.createdBy?.role)}</td>
                <td>{renderValue(ele?.email)}</td>
                <td>{renderValue(ele?.passwordTracker)}</td>
                <td>{renderValue(ele?.createdBy?.CounsellorCOde)}</td>
                <td>{renderValue(ele?.createdBy?.name)}</td>
                <td>{renderValue(ele?.createdAt)}</td>
                <td>
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => {
                      setEditingCounsellor(ele);
                      setShowModal(true);
                    }}
                  >
                    <Icon icon="lucide:edit" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
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
