import React, { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import JSZip from "jszip";

import {
  deletePartner,
  fetchPartner,
  updateStatus,
} from "../slice/PartnerSlice";

import CreatePartner from "../form/CreatePartner";
import Switch from "../form/Switch";

const PartnerManager = () => {
  const dispatch = useDispatch();
  const partners = useSelector((state) => state.partner.partner || []);

  /* ================= STATE ================= */
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);

  const [filters, setFilters] = useState({
    centerCode: "",
    status: "",
  });

  /* ================= PAGINATION ================= */
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  /* ================= FETCH ================= */
  useEffect(() => {
    dispatch(fetchPartner());
  }, [dispatch]);

  /* ================= FILTER HANDLER ================= */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
    setCurrentPage(1);
  };

  /* ================= FILTER LOGIC ================= */
  const filteredPartners = useMemo(() => {
    return partners.filter((ele) => {
      if (!ele) return false;

      const centerOk = filters.centerCode.trim()
        ? ele.CenterCode?.toLowerCase().includes(
            filters.centerCode.trim().toLowerCase()
          )
        : true;

      const statusOk =
        filters.status !== ""
          ? String(ele.status) === filters.status
          : true;

      return centerOk && statusOk;
    });
  }, [partners, filters]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredPartners.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRows = filteredPartners.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  /* ================= CHECKBOX ================= */
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!selectedIds.length) {
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

  /* ================= STATUS ================= */
  const statusHandler = async (id, status) => {
    try {
      await dispatch(updateStatus({ id, status })).unwrap();
      toast.success("Status updated");
      dispatch(fetchPartner());
    } catch {
      toast.error("Status update failed");
    }
  };

  /* ================= ZIP DOWNLOAD ================= */
  const downloadDocumentsAsZip = async (ele) => {
    const zip = new JSZip();

    const documents = [
      { name: "FrontAdhar", url: ele?.FrontAdhar },
      { name: "BackAdhar", url: ele?.BackAdhar },
      { name: "PanCard", url: ele?.PanCard },
      { name: "OwnerPhoto", url: ele?.OwnerPhoto },
      { name: "OfficePhoto", url: ele?.OfficePhoto },
      { name: "CancelledCheck", url: ele?.CancelledCheck },
      { name: "Logo", url: ele?.Logo },
      { name: "MOU", url: ele?.mou },
    ];

    try {
      let hasFiles = false;

      for (const doc of documents) {
        if (!doc.url) continue;

        const res = await fetch(doc.url);
        const blob = await res.blob();
        const ext = doc.url.split(".").pop().split("?")[0];

        zip.file(`${doc.name}.${ext}`, blob);
        hasFiles = true;
      }

      if (!hasFiles) {
        toast.warning("No documents available");
        return;
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `${ele.CenterCode || "documents"}.zip`);
    } catch (err) {
      toast.error("Download failed");
    }
  };

  /* ================= EXCEL ================= */
  const downloadExcel = () => {
    if (!filteredPartners.length) {
      toast.warning("No data available");
      return;
    }

    const data = filteredPartners.map((p, i) => ({
      "S.No": i + 1,
      "Center Name": p.InsitutionName,
      "Owner Name": p.OwnerName,
      "Center Code": p.CenterCode,
      Email: p.email,
      Status: p.status ? "Active" : "Inactive",
      City: p.city,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Partners");

    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), "partners.xlsx");
  };

  return (
    <div className="card">
      {/* HEADER */}
      <div className="card-header d-flex justify-content-between">
        <h5>Partner Table</h5>
        <div>
          <button className="btn btn-primary mx-1" onClick={() => setShowModal(true)}>
            Add Partner
          </button>
          <button className="btn btn-danger mx-1" onClick={handleDelete}>
            Delete
          </button>
          <button className="btn btn-success mx-1" onClick={downloadExcel}>
            Excel
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="card-body">
        {/* FILTERS */}
        <div className="row mb-3">
          <div className="col-md-4">
            <input
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
        </div>

        <p className="text-muted">
          Showing {filteredPartners.length} / {partners.length}
        </p>

        {/* TABLE */}
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>#</th>
                <th>Center</th>
                <th>Owner</th>
                <th>Code</th>
                <th>Email</th>
                <th>Password</th>
                <th>Status</th>
                <th>Docs</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {currentRows.length ? (
                currentRows.map((ele) => (
                  <tr key={ele._id}>
                    <td>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedIds.includes(ele._id)}
                        onChange={() => handleCheckboxChange(ele._id)}
                      />
                    </td>
                    <td>{ele.InsitutionName}</td>
                    <td>{ele.OwnerName}</td>
                    <td>{ele.CenterCode}</td>
                    <td>{ele.email}</td>
                    <td>{ele.passwordTracker || "—"}</td>
                    <td>
                      <Switch statusHandler={statusHandler} ele={ele} />
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => downloadDocumentsAsZip(ele)}
                      >
                        ↓
                      </button>
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
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center text-muted py-4">
                    ❌ No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION (Optional UI later) */}
        <p className="text-muted mt-2">
          Page {currentPage} of {totalPages || 1}
        </p>
      </div>

      {/* MODAL */}
      {showModal && (
        <CreatePartner
          ele={editingPartner}
          fetchData={() => dispatch(fetchPartner())}
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
