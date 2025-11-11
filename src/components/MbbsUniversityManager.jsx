import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { deleteMbbsUniversity, fetchMbbsUniversity } from "../slice/mbbsUniversity";
import CreateMbbsUniversity from "../form/CreateMbbsUniversity";
import DataTable from "react-data-table-component";

const MbbsUniversityManager = () => {
  const dispatch = useDispatch();
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [university, setUniversity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState(null);
  const [search, setSearch] = useState("");

  const loadUniversity = async () => {
    setLoading(true);
    try {
      const res = await dispatch(fetchMbbsUniversity());
      if (res?.meta?.requestStatus === "fulfilled") {
        setUniversity(res.payload);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUniversity();
  }, [dispatch]);

  const handleCheckboxChange = (id) => {
    setSelectedIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id)
        : [...prevSelected, id]
    );
  };

  const handleDelete = async (id) => {
    const idsToDelete = id ? [id] : selectedIds;
    if (idsToDelete.length === 0) {
      toast.warn("⚠️ No items selected for deletion.");
      return;
    }
    const confirmed = window.confirm(
      idsToDelete.length > 1
        ? `Are you sure you want to delete ${idsToDelete.length} universities?`
        : "Are you sure you want to delete this university?"
    );
    if (!confirmed) return;
    try {
      const res = await dispatch(deleteMbbsUniversity(idsToDelete));
      if (deleteMbbsUniversity.fulfilled.match(res)) {
        toast.success("✅ Mbbs University deleted successfully!");
        setSelectedIds([]);
        loadUniversity();
      } else if (deleteMbbsUniversity.rejected.match(res)) {
        toast.error(
          "❌ Failed to delete Mbbs University: " +
            (res.payload?.message || res.error?.message || "Unknown error")
        );
      }
    } catch (error) {
      toast.error("⚠️ Unexpected error: " + (error.message || "Something went wrong"));
    }
  };

  // Filter by university name
  const filteredData = university.filter((ele) =>
    ele?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      name: "S.L",
      cell: (row, idx) => (
        <div className="form-check style-check d-flex align-items-center">
          <input
            type="checkbox"
            className="form-check-input"
            checked={selectedIds.includes(row._id)}
            onChange={() => handleCheckboxChange(row._id)}
          />
          <label className="form-check-label">{idx + 1}</label>
        </div>
      ),
      width: "80px",
    },
    { name: "Name", selector: row => row.name, sortable: true },
    { name: "Country", selector: row => row.Country?.name, sortable: true },
    {
      name: "Image",
      cell: row => (
        <a href={row.heroURL} target="_blank" rel="noopener noreferrer">
          Click to View
        </a>
      ),
    },
    {
      name: "Banner",
      cell: row => (
        <a href={row.bannerURL} target="_blank" rel="noopener noreferrer">
          Click to View
        </a>
      ),
    },
    {
      name: "Logo",
      cell: row => (
        <a href={row.logo} target="_blank" rel="noopener noreferrer">
          Click to View
        </a>
      ),
    },
    {
      name: "Created Date",
      cell: row => (
        <span className="text-success-main px-24 py-4 rounded-pill fw-medium text-sm">
          {new Date(row?.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            weekday: "short",
          })}
        </span>
      ),
    },
    {
      name: "Action",
      cell: row => (
        <>
          <Link
            onClick={() => {
              setEditingUniversity(row);
              setShowModal(true);
            }}
            to="#"
            className="w-32-px h-32-px me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center"
          >
            <Icon icon="lucide:edit" />
          </Link>
          <Link
            onClick={() => handleDelete(row._id)}
            to="#"
            className="w-32-px h-32-px me-8 bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center"
          >
            <Icon icon="mingcute:delete-2-line" />
          </Link>
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div className="card basic-data-table">
      <div className="card-header" style={{ display: "flex", justifyContent: "space-between" }}>
        <h5 className="card-title mb-0">University Table</h5>
        <div>
          <button
            type="button"
            className="btn rounded-pill text-primary radius-8 px-4 py-2"
            onClick={() => setShowModal(true)}
          >
            Add University
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
            <CreateMbbsUniversity
              loadUniversity={loadUniversity}
              ele={editingUniversity}
              handleClose={() => {
                setShowModal(false);
                setEditingUniversity(null);
              }}
            />
          )}
        </div>
      </div>
      <div className="card-body overflow-x-auto">
        <input
          type="text"
          placeholder="Search by University Name"
          className="form-control mb-3"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          highlightOnHover
          responsive
        />
      </div>
    </div>
  );
};

export default MbbsUniversityManager;