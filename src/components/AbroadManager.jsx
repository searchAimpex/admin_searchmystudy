import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import { deleteAbroadStudy, fetchAbroadStudy } from "../slice/AbroadSlice";
import CreateCountry from "../form/CreateCountry";
import { toast } from "react-toastify";
import DataTable from "react-data-table-component";

const AbroadManager = () => {
  const dispatch = useDispatch();
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [studyAbroad, setStudyAbroad] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);
  const [search, setSearch] = useState("");

  const loadAbroadStudy = async () => {
    setLoading(true);
    try {
      const res = await dispatch(fetchAbroadStudy());
      if (res?.meta?.requestStatus === "fulfilled") {
        setStudyAbroad(res.payload);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAbroadStudy();
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
        ? `Are you sure you want to delete ${idsToDelete.length} blogs?`
        : "Are you sure you want to delete this blog?"
    );
    if (!confirmed) return;
    try {
      const res = await dispatch(deleteAbroadStudy(idsToDelete));
      if (deleteAbroadStudy.fulfilled.match(res)) {
        toast.success("✅ StudyAbroad deleted successfully!");
        setSelectedIds([]);
        loadAbroadStudy();
      } else if (deleteAbroadStudy.rejected.match(res)) {
        toast.error(
          "❌ Failed to delete Abroad: " +
            (res.payload?.message || res.error?.message || "Unknown error")
        );
      }
    } catch (error) {
      toast.error("⚠️ Unexpected error: " + (error.message || "Something went wrong"));
    }
  };

  // Filter by name
  const filteredData = studyAbroad.filter((ele) =>
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
    {
      name: "Description",
      cell: row => (
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
            {row?.description?.slice(0, 300)}
          </h6>
        </div>
      ),
    },
    {
      name: "MBBS",
      selector: row => (row.mbbsAbroad === true ? "Yes" : "No"),
      width: "80px",
    },
    {
      name: "Flag",
      cell: row => (
        <a href={row.flagURL} target="_blank" rel="noopener noreferrer">
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
      name: "Created At",
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
              setEditingCountry(row);
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
        <h5 className="card-title mb-0">Country Table</h5>
        <div>
          <button
            type="button"
            className="btn rounded-pill text-primary radius-8 px-4 py-2"
            onClick={() => setShowModal(true)}
          >
            Add Country
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
            <CreateCountry
              loadAbroadStudy={loadAbroadStudy}
              ele={editingCountry}
              handleClose={() => {
                setShowModal(false);
                setEditingCountry(null);
              }}
            />
          )}
        </div>
      </div>
      <div className="card-body overflow-x-auto">
        <input
          type="text"
          placeholder="Search by Country Name"
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

export default AbroadManager;