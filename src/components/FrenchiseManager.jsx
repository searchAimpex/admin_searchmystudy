import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import JSZip from "jszip";

import {
  deletePartner,
  fetchFrenchise,
  updateStatus,
} from "../slice/PartnerSlice";

import CreateFrenchise from "../form/CreateFrenchise";
import Switch from "../form/Switch";

const FrenchiseManager = () => {
  const dispatch = useDispatch();
  const webinars = useSelector((state) => state.partner.frenchise || []);

  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingWebinar, setEditingWebinar] = useState(null);

  const [filters, setFilters] = useState({
    centerCode: "",
    status: "",
  });

  useEffect(() => {
    dispatch(fetchFrenchise());
  }, [dispatch]);

  /* ================= FILTER ================= */
  const filteredWebinars = webinars.filter((ele) => {
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

  /* ================= HANDLERS ================= */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
  };

  const handleDelete = async () => {
    if (!selectedIds.length) {
      toast.warning("Select at least one");
      return;
    }

    await dispatch(deletePartner(selectedIds));
    toast.success("Deleted");
    setSelectedIds([]);
    dispatch(fetchFrenchise());
  };

  const statusHandler = async (id, status) => {
    await dispatch(updateStatus({ id, status }));
    toast.success("Status updated");
    dispatch(fetchFrenchise());
  };

  /* ================= ZIP DOWNLOAD ================= */
  const downloadDocumentsAsZip = async (ele) => {
    const zip = new JSZip();

    const documents = [
      { name: "BackAdhar", url: ele?.BackAdhar },
      { name: "CancelledCheck", url: ele?.CancelledCheck },
      { name: "FrontAdhar", url: ele?.FrontAdhar },
      { name: "Logo", url: ele?.Logo },
      { name: "OfficePhoto", url: ele?.OfficePhoto },
      { name: "PanCard", url: ele?.PanCard },
      { name: "OwnerPhoto", url: ele?.OwnerPhoto },
      { name: "MOU", url: ele?.mou },
      { name: "Profile", url: ele?.Profile },
      { name: "PhotoRegistration", url: ele?.Photoregistration },
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
      console.error(err);
      toast.error("Document download failed");
    }
  };

  /* ================= EXCEL ================= */
  const handleDownloadExcel = () => {
    if (!filteredWebinars.length) {
      toast.warning("No data");
      return;
    }

    const data = filteredWebinars.map((e, i) => ({
      "S.No": i + 1,
      "Center Code": e.CenterCode,
      Name: e.InsitutionName,
      Owner: e.OwnerName,
      Email: e.email,
      Status: e.status ? "Active" : "Inactive",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Frenchise");

    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), "frenchise.xlsx");
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between">
        <h5>Frenchise Table</h5>
        <div>
          <button onClick={handleDownloadExcel} className="btn btn-success mx-1">
            Excel
          </button>
          <button onClick={() => setShowModal(true)} className="btn btn-primary mx-1">
            Add
          </button>
          <button onClick={handleDelete} className="btn btn-danger mx-1">
            Delete
          </button>
        </div>
      </div>

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
          Showing {filteredWebinars.length} / {webinars.length}
        </p>

        {/* TABLE */}
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
            {filteredWebinars.length ? (
              filteredWebinars.map((e) => (
                <tr key={e._id}>
                  <td>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedIds.includes(e._id)}
                      onChange={() =>
                        setSelectedIds((p) =>
                          p.includes(e._id)
                            ? p.filter((x) => x !== e._id)
                            : [...p, e._id]
                        )
                      }
                    />
                  </td>
                  <td>{e.InsitutionName}</td>
                  <td>{e.OwnerName}</td>
                  <td>{e.CenterCode}</td>
                  <td>{e.email}</td>
                  <td>{e.passwordTracker}</td>
                  <td>
                    <Switch statusHandler={statusHandler} ele={e} />
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => downloadDocumentsAsZip(e)}
                    >
                      ↓
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => {
                        setEditingWebinar(e);
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

        {showModal && (
          <CreateFrenchise
            ele={editingWebinar}
            fetchData={() => dispatch(fetchFrenchise())}
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
