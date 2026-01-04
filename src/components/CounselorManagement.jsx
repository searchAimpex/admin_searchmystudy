import React, { useEffect, useState, useMemo } from "react";
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
import CreateCounselor from "../form/CreateCounselor";
import Createtestemonial from "../form/CreateTestemonials";
import CreateCounsellorCoursefinder from "../form/CreateCounsellorCoursefinder";

/* ================= HELPERS ================= */
const renderValue = (value) => {
  if (value === null || value === undefined || value === "" || value === "null") {
    return <span style={{ color: "red", fontWeight: 600 }}>EMPTY</span>;
  }
  return value;
};

const normalize = (val) =>
  val ? val.toString().toLowerCase().trim() : "";

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

  /* ================= FILTER LOGIC (FULLY FIXED) ================= */
  const filteredCounsellors = useMemo(() => {
    return courseFinderCounsellor.filter((ele) => {
      const counsellorCode = normalize(ele?.CounsellorCOde);
      const role = normalize(ele?.createdBy?.role);
      const centerCode = normalize(ele?.createdBy?.CenterCode);

      const fCounsellorCode = normalize(filters.counsellorCode);
      const fRole = normalize(filters.role);
      const fCenterCode = normalize(filters.centerCode);

      const matchCounsellorCode =
        !fCounsellorCode || counsellorCode.includes(fCounsellorCode);

      const matchRole = !fRole || role === fRole;

      const matchCenterCode =
        !fCenterCode || centerCode.includes(fCenterCode);

      return matchCounsellorCode && matchRole && matchCenterCode;
    });
  }, [courseFinderCounsellor, filters]);

  /* ================= CHECKBOX ================= */
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedIds(
      checked ? filteredCounsellors.map((c) => c._id) : []
    );
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const idsToDelete = id ? [id] : selectedIds;

    if (!idsToDelete.length) {
      toast.warn("No counselor selected");
      return;
    }

    if (
      !window.confirm(
        idsToDelete.length > 1
          ? `Delete ${idsToDelete.length} counselors?`
          : "Delete this counselor?"
      )
    )
      return;

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
      CenterCode: ele?.createdBy?.CenterCode || "",
      CenterName: ele?.createdBy?.name || "",
      CreatedAt: ele?.createdAt || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Counsellors");

    const blob = new Blob(
      [
        XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        }),
      ],
      {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    );

    saveAs(blob, "Counsellor_List.xlsx");
  };

  /* ================= UI ================= */
  return (
    <div className="card basic-data-table">
      <div className="card-header d-flex justify-content-between">
        <h5>Counselor Management</h5>

        <div className="d-flex gap-2">
          <button className="btn btn-success btn-sm" onClick={downloadExcel}>
            Download Excel
          </button>

          {selectedIds.length > 0 && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => handleDelete()}
            >
              Delete Selected ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* FILTERS */}
      <div className="row p-3 g-2">
        <div className="col-md-3">
          <input
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
              setFilters({ counsellorCode: "", role: "", centerCode: "" })
            }
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="card-body overflow-x-auto">
        <table className="table bordered-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th>#</th>
              <th>Owner</th>
              <th>Name</th>
              <th>Code</th>
              <th>Role</th>
              <th>Email</th>
              <th>Password</th>
              <th>Center Name</th>
              <th>Center Code</th>
              <th>Contact</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredCounsellors.map((ele, i) => (
              <tr key={ele._id}>
                <td>
                  <input
                    type="checkbox"
                      className="form-check-input"
                    checked={selectedIds.includes(ele._id)}
                    onChange={() => handleCheckboxChange(ele._id)}
                  />
                </td>
                <td>{i + 1}</td>
                <td>{renderValue(ele?.createdBy?.OwnerName)}</td>
                <td>{renderValue(ele?.name)}</td>
                <td>{renderValue(ele?.CounsellorCOde)}</td>
                <td>{renderValue(ele?.createdBy?.role)}</td>
                <td>{renderValue(ele?.email)}</td>
                <td>{renderValue(ele?.passwordTracker)}</td>
                <td>{renderValue(ele?.createdBy?.name)}</td>
                <td>{renderValue(ele?.createdBy?.CenterCode)}</td>
                <td>{renderValue(ele?.WhatappNumber)}</td>
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

      {showModal && (
        <CreateCounsellorCoursefinder
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
