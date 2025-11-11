import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { toast } from "react-toastify";
import { deleteCounselor, fetchCounselor } from "../slice/CounselorManagerSlice";
import CreateCounselor from "../form/CreateCounselor";
import DataTable from "react-data-table-component";

const CounselorManager = () => {
  const dispatch = useDispatch();
  const [counsellor, setCounsellor] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCounsellor, setEditingCounsellor] = useState(null);
  const [search, setSearch] = useState("");

  const loadCounsellors = async () => {
    const res = await dispatch(fetchCounselor());
    if (res?.meta?.requestStatus === "fulfilled") {
      setCounsellor(res.payload);
    }
  };

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
      toast.warn("⚠️ No blogs selected for deletion.");
      return;
    }
    const confirmed = window.confirm(
      idsToDelete.length > 1
        ? `Are you sure you want to delete ${idsToDelete.length} blogs?`
        : "Are you sure you want to delete this blog?"
    );
    if (!confirmed) return;
    try {
      const res = await dispatch(deleteCounselor(idsToDelete));
      if (deleteCounselor.fulfilled.match(res)) {
        toast.success("✅ Counsellor deleted successfully!");
        setSelectedIds([]);
        loadCounsellors();
      } else if (deleteCounselor.rejected.match(res)) {
        toast.error(
          "❌ Failed to delete Counsellor: " +
          (res.payload?.message || res.error?.message || "Unknown error")
        );
      }
    } catch (error) {
      toast.error("⚠️ Unexpected error: " + (error.message || "Something went wrong"));
    }
  };

  useEffect(() => {
    loadCounsellors();
  }, [dispatch]);

  // Filter by name/course
  const filteredData = counsellor.filter((ele) =>
    (ele?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (ele?.course || "").toLowerCase().includes(search.toLowerCase())
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
    { name: "Name", selector: row => row.name || "-----", sortable: true },
    { name: "Course", selector: row => row.course || "-----", sortable: true },
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
            {row?.experience
              ? row.experience.replace(/<[^>]+>/g, "")
              : "None"}
          </h6>
        </div>
      ),
    },
    {
      name: "Image",
      cell: row => (
        <a href={row?.imageURL} target="_blank" rel="noopener noreferrer">
          Click to View
        </a>
      ),
    },
    {
      name: "Created At",
      cell: row => (
        row?.createdAt
          ? new Date(row.createdAt).toLocaleString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour12: true,
            })
          : "-----"
      ),
    },
    {
      name: "Action",
      cell: row => (
        <Link
          onClick={() => {
            setEditingCounsellor(row);
            setShowModal(true);
          }}
          to="#"
          className="w-32-px h-32-px me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center"
        >
          <Icon icon="lucide:edit" />
        </Link>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div className="card basic-data-table">
      <div className="card-header" style={{ display: "flex", justifyContent: "space-between" }}>
        <h5 className="card-title mb-0">Testemonials Table</h5>
        <div>
          <button
            type="button"
            className="btn rounded-pill text-primary radius-8 px-4 py-2"
            onClick={() => setShowModal(true)}
          >
            Add Testemonials
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
            <CreateCounselor
              loadCounsellors={loadCounsellors}
              ele={editingCounsellor}
              handleClose={() => {
                setShowModal(false);
                setEditingCounsellor(null);
              }}
            />
          )}
        </div>
      </div>
      <div className="card-body overflow-x-auto">
        <input
          type="text"
          placeholder="Search by Name or Course"
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

export default CounselorManager;