import React, { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
  deletePartner,
  fetchPartner,
  updateStatus,
} from "../slice/PartnerSlice";

import CreatePartner from "../form/CreatePartner";

const PartnerManager = () => {
  const dispatch = useDispatch();
  const partners = useSelector((state) => state.partner.partner || []);

  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);

  // 🔹 FILTER STATES
  const [statusFilter, setStatusFilter] = useState("");
  const [centerCodeFilter, setCenterCodeFilter] = useState("");

  // 🔹 PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // ================= FETCH =================
  useEffect(() => {
    dispatch(fetchPartner());
  }, [dispatch]);

  // ================= FILTER LOGIC =================
  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      const statusMatch =
        statusFilter === "" ? true : String(p.status) === statusFilter;

      const centerMatch =
        centerCodeFilter === ""
          ? true
          : p.CenterCode?.toLowerCase().includes(
              centerCodeFilter.toLowerCase()
            );

      return statusMatch && centerMatch;
    });
  }, [partners, statusFilter, centerCodeFilter]);

  // ================= PAGINATION LOGIC =================
  const totalPages = Math.ceil(filteredPartners.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRows = filteredPartners.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // ================= CHECKBOX =================
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ================= DELETE =================
  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      toast.warning("Please select at least one partner");
      return;
    }

    if (!window.confirm("Are you sure you want to delete?")) return;

    try {
      await dispatch(deletePartner(selectedIds)).unwrap();
      toast.success("Deleted successfully");
      setSelectedIds([]);
      dispatch(fetchPartner());
    } catch {
      toast.error("Delete failed");
    }
  };

  // ================= STATUS UPDATE =================
  const statusHandler = async (id, status) => {
    try {
      await dispatch(updateStatus({ id, status })).unwrap();
      toast.success("Status updated");
      dispatch(fetchPartner());
    } catch {
      toast.error("Failed to update status");
    }
  };

  // ================= EXCEL DOWNLOAD =================
  const downloadExcel = () => {
    if (!filteredPartners.length) {
      toast.warning("No data to download");
      return;
    }

    const data = filteredPartners.map((p) => ({
      "Center Name": p.name,
      "Owner Name": p.OwnerName,
      "Center Code": p.CenterCode,
      Email: p.email,
      Status: p.status ? "Active" : "Inactive",
      City: p.city,
      "Created At": new Date(p.createdAt).toLocaleDateString("en-IN"),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Partners");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), "partners.xlsx");
  };

  return (
    <div className="card">
      {/* ================= HEADER ================= */}
      <div className="card-header d-flex justify-content-between">
        <h5 className="mb-0">Partner Table</h5>

        <div>
          <button
            className="btn btn-primary mx-1"
            onClick={() => setShowModal(true)}
          >
            Add Partner
          </button>

          <button className="btn btn-danger mx-1" onClick={handleDelete}>
            Delete Selected
          </button>

          <button className="btn btn-success mx-1" onClick={downloadExcel}>
            Download Excel
          </button>
        </div>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="card-body">
        <div className="d-flex gap-3 mb-3">
          <select
            className="form-select w-auto"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <input
            type="text"
            className="form-control w-auto"
            placeholder="Search Center Code"
            value={centerCodeFilter}
            onChange={(e) => {
              setCenterCodeFilter(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* ================= TABLE ================= */}
        <div className="table-responsive">
          <table className="table bordered-table mb-0">
            <thead>
              <tr>
                <th>Check</th>
                <th>Center Name</th>
                <th>Owner Name</th>
                <th>Center Code</th>
                <th>Email</th>
                <th>Status</th>
                <th>Contact Number</th>
                <th>Password</th>
                <th>City</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {currentRows.length === 0 && (
                <tr>
                  <td colSpan="10" className="text-center text-danger">
                    No Data Found
                  </td>
                </tr>
              )}

              {currentRows.map((ele) => (
                <tr key={ele._id}>
                  <td>
                    <input

                      type="checkbox"
                         className="form-check-input"
                      checked={selectedIds.includes(ele._id)}
                      onChange={() => handleCheckboxChange(ele._id)}
                    />
                  </td>

                  <td>{ele.name}</td>
                  <td>{ele.OwnerName}</td>
                  <td>{ele.CenterCode}</td>
                  <td>{ele.email}</td>

                  <td>
                    <select
                    className="form-select form-select-sm"
                      value={String(ele.status)}
                      onChange={(e) =>
                        statusHandler(ele._id, e.target.value === "true")
                      }
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </td>
                  <td>
                    {ele?.ContactNumber}
                  </td>

                  <td>{ele.passwordTracker || "Null"}</td>
                  <td>{ele.city}</td>
                  <td>
                    {new Date(ele.createdAt).toLocaleDateString("en-IN")}
                  </td>

                  <td>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => {
                        setEditingPartner(ele);
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

        {/* ================= PAGINATION ================= */}
        {totalPages > 1 && (
          <div className="mt-3">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`btn btn-sm mx-1 ${
                  currentPage === i + 1
                    ? "btn-primary"
                    : "btn-outline-primary"
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <CreatePartner
          fetchData={() => dispatch(fetchPartner())}
          ele={editingPartner}
          handleClose={() => {
            setShowModal(false);
            setEditingPartner(null);
          }}
        />
      )}
    </div>
  );
};

export default PartnerManager;
