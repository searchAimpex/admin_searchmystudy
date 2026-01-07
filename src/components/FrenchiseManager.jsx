import React, { useEffect, useState } from "react";
import $ from "jquery";
import "datatables.net-dt";

import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

// Excel export
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Redux
import {
  deletePartner,
  fetchFrenchise,
  updateStatus,
} from "../slice/PartnerSlice";

// Form
import CreateFrenchise from "../form/CreateFrenchise";

const FrenchiseManager = () => {
  const dispatch = useDispatch();

  const webinars = useSelector((state) => state.partner.frenchise || []);

  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingWebinar, setEditingWebinar] = useState(null);

  /* ================= FILTER STATE ================= */
  const [filters, setFilters] = useState({
    centerCode: "",
    status: "",
  });

  /* ================= FETCH ================= */
  const fetchData = async () => {
    await dispatch(fetchFrenchise());
  };

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  /* ================= FILTER HANDLER ================= */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= FILTERED DATA (SAFE) ================= */
  const filteredWebinars = webinars.filter((ele) => {
    if (!ele) return false;

    const centerMatch = filters.centerCode
      ? (ele.CenterCode || "")
          .toLowerCase()
          .includes(filters.centerCode.toLowerCase())
      : true;

    const statusMatch =
      filters.status !== ""
        ? String(ele.status) === filters.status
        : true;

    return centerMatch && statusMatch;
  });
console.log(filteredWebinars)
  /* ================= DATATABLE ================= */
  useEffect(() => {
    if (filteredWebinars.length > 0) {
      if ($.fn.DataTable.isDataTable("#dataTable")) {
        $("#dataTable").DataTable().destroy();
      }

      $("#dataTable").DataTable({
        paging: true,
        searching: false, // React filters only
        pageLength: 5,
        lengthMenu: [5, 10, 20, 50],
        destroy: true,
      });
    }
  }, [filteredWebinars]);

  /* ================= EXCEL DOWNLOAD ================= */
  const handleDownloadExcel = () => {
    if (filteredWebinars.length === 0) {
      toast.warning("No data available to download");
      return;
    }

    const excelData = filteredWebinars.map((ele, index) => ({
      "S.No": index + 1,
      "Center Name": ele?.name || "",
      "Owner Name": ele?.OwnerName || "",
      "Center Code": ele?.CenterCode || "",
      "Email": ele?.email || "",
      "Status": ele?.status ? "Active" : "Inactive",
      "Password": ele?.passwordTracker || "",
      "City": ele?.city || "",
      "Created At": ele?.createdAt
        ? new Date(ele.createdAt).toLocaleDateString("en-IN")
        : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Frenchise");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `frenchise_${Date.now()}.xlsx`);
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      toast.warning("Please select at least one record");
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selectedIds.length} selected Frenchise(s)?`
    );
    if (!confirmed) return;

    try {
      await dispatch(deletePartner(selectedIds));
      toast.success("Selected Frenchise(s) deleted successfully");
      setSelectedIds([]);
      fetchData();
    } catch (err) {
      toast.error("Error deleting records");
    }
  };

  /* ================= STATUS UPDATE ================= */
  const statusHandler = async (id, status) => {
    try {
      await dispatch(updateStatus({ id, status }));
      toast.success("Status updated");
      fetchData();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  /* ================= JSX ================= */
  return (
    <div className="card basic-data-table">
      {/* ================= HEADER ================= */}
      <div className="card-header d-flex justify-content-between">
        <h5 className="card-title mb-0">Frenchise Table</h5>

        <div>
          <button
            className="mx-2 btn rounded-pill text-success px-4 py-2"
            onClick={handleDownloadExcel}
          >
            Download Excel
          </button>

          <button
            className="mx-2 btn rounded-pill text-primary px-4 py-2"
            onClick={() => setShowModal(true)}
          >
            Add Frenchise
          </button>

          <button
            className="mx-2 btn rounded-pill text-danger px-4 py-2"
            onClick={handleDelete}
          >
            Delete Selected
          </button>
        </div>
      </div>

      <div className="card-body overflow-x-auto">
        {/* ================= FILTERS ================= */}
        <div className="mb-3 p-3 bg-light rounded">
          <div className="row g-2">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Filter by Center Code"
                name="centerCode"
                value={filters.centerCode}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-md-4">
              <select
                className="form-select form-select-sm"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div className="col-md-4">
              <button
                className="btn btn-sm btn-outline-secondary w-100"
                onClick={() =>
                  setFilters({ centerCode: "", status: "" })
                }
              >
                Clear Filters
              </button>
            </div>
          </div>

          <p className="small text-muted mt-2">
            Showing {filteredWebinars.length} / {webinars.length}
          </p>
        </div>

        {/* ================= TABLE ================= */}
        <table id="dataTable" className="table bordered-table mb-0">
          <thead>
            <tr>
              <th>#</th>
              <th>Center Name</th>
              <th>Owner Name</th>
              <th>Center Code</th>
              <th>Email</th>
              <th>Status</th>
              <th>Contact Number</th>
              <th>Password</th>
              <th>City</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredWebinars.map((ele, ind) => (
              <tr key={ele._id}>
                <td>
                  <input
                    type="checkbox"
                       className="form-check-input"
                    checked={selectedIds.includes(ele._id)}
                    onChange={() =>
                      setSelectedIds((prev) =>
                        prev.includes(ele._id)
                          ? prev.filter((x) => x !== ele._id)
                          : [...prev, ele._id]
                      )
                    }
                  />
                </td>

                <td>{ele?.name}</td>
                <td>{ele?.OwnerName}</td>
                <td>{ele?.CenterCode}</td>
                <td>{ele?.email}</td>

                <td>
                  <select
                    value={String(ele?.status)}
                    onChange={(e) =>
                      statusHandler(ele._id, e.target.value === "true")
                    }
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </td>
                <td>{ele?.ContactNumber}</td>

                <td>{ele?.passwordTracker || "Null"}</td>
                <td>{ele?.city}</td>

                <td>
                  {ele?.createdAt
                    ? new Date(ele.createdAt).toLocaleDateString("en-IN")
                    : "—"}
                </td>

                <td>
                  <Link
                    to="#"
                    className="btn btn-sm btn-success"
                    onClick={() => {
                      setEditingWebinar(ele);
                      setShowModal(true);
                    }}
                  >
                    <Icon icon="lucide:edit" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showModal && (
          <CreateFrenchise
            ele={editingWebinar}
            fetchData={fetchData}
            handleClose={() => {
              setShowModal(false);
              setEditingWebinar(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default FrenchiseManager;
