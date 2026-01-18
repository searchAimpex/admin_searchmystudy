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

  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);

  /* ================= FILTER STATE ================= */
  const [filters, setFilters] = useState({
    status: "",
    centerCode: "",
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
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  /* ================= FILTER LOGIC ================= */
  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      const statusMatch =
        filters.status === "" ? true : String(p.status) === filters.status;

      const centerMatch =
        filters.centerCode.trim() === ""
          ? true
          : p.CenterCode?.toLowerCase().includes(
              filters.centerCode.trim().toLowerCase()
            );

      return statusMatch && centerMatch;
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

  /* ================= STATUS UPDATE ================= */
  const statusHandler = async (id, status) => {
    try {
      await dispatch(updateStatus({ id, status })).unwrap();
      toast.success("Status updated");
      dispatch(fetchPartner());
    } catch {
      toast.error("Failed to update status");
    }
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

        const response = await fetch(doc.url);
        const blob = await response.blob();
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
      toast.error("Failed to download documents");
    }
  };

  /* ================= EXCEL DOWNLOAD ================= */
  const downloadExcel = () => {
    if (!filteredPartners.length) {
      toast.warning("No data to download");
      return;
    }

    const data = filteredPartners.map((p) => ({
      "Center Name": p.InsitutionName,
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
      <div className="card-header d-flex justify-content-between">
        <h5 className="mb-0">Partner Table</h5>

        <div>
          <button className="btn btn-primary mx-1" onClick={() => setShowModal(true)}>
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

      <div className="card-body">
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
                <th>Contact</th>
                <th>Password</th>
                <th>City</th>
                <th>Created</th>
                <th>Download DOCs</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {currentRows.map((ele) => (
                <tr key={ele._id}>
                  <td>
                    <input
                      type="checkbox"
                       className='form-check-input'
                      checked={selectedIds.includes(ele._id)}
                      onChange={() => handleCheckboxChange(ele._id)}
                    />
                  </td>
                  <td>{ele.InsitutionName}</td>
                  <td>{ele.OwnerName}</td>
                  <td>{ele.CenterCode}</td>
                  <td>{ele.email}</td>
                  <td>
                    <Switch statusHandler={statusHandler} ele={ele} />
                  </td>
                  <td>{ele.ContactNumber}</td>
                  <td>{ele.passwordTracker || "Null"}</td>
                  <td>{ele.city}</td>
                  <td>{new Date(ele.createdAt).toLocaleDateString("en-IN")}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
