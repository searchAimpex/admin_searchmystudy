import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { deleteMbbsCourse, fetchMbbsCourse } from "../slice/MbbsCourse";
import CreateMbbsCourse from "../form/CreateMbbsCourse";
import DataTable from "react-data-table-component";

const MbbsCourseManager = () => {
  const dispatch = useDispatch();
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [course, setCourse] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [search, setSearch] = useState("");

  const loadCourse = async () => {
    setLoading(true);
    try {
      const res = await dispatch(fetchMbbsCourse());
      if (res?.meta?.requestStatus === "fulfilled") {
        setCourse(res.payload);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourse();
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
        ? `Are you sure you want to delete ${idsToDelete.length} courses?`
        : "Are you sure you want to delete this course?"
    );
    if (!confirmed) return;
    try {
      const res = await dispatch(deleteMbbsCourse(idsToDelete));
      if (deleteMbbsCourse.fulfilled.match(res)) {
        toast.success("✅ MBBS Course deleted successfully!");
        setSelectedIds([]);
        loadCourse();
      } else if (deleteMbbsCourse.rejected.match(res)) {
        toast.error(
          "❌ Failed to delete MBBS Course: " +
            (res.payload?.message || res.error?.message || "Unknown error")
        );
      }
    } catch (error) {
      toast.error("⚠️ Unexpected error: " + (error.message || "Something went wrong"));
    }
  };

  // Filter by course name
  const filteredData = course.filter((ele) =>
    ele?.ProgramName?.toLowerCase().includes(search.toLowerCase())
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
    { name: "Course Name", selector: row => row.ProgramName || "None", sortable: true },
    { name: "Country", selector: row => row.Country?.name || row.University?.Country?.name || "None", sortable: true },
    {
      name: "Total Fees",
      cell: row => `${row?.Fees?.totalAmount || "0000"} ${row?.Fees?.currency || ""}`,
    },
    {
      name: "Total Year/Sem",
      cell: row => `${row?.Fees?.breakdown?.length || 0} ${row?.Fees?.mode || ""}`,
    },
    {
      name: "Complete Fees",
      cell: row => `${row?.completeFees?.amount || ""} ${row?.completeFees?.currency || ""}`,
    },
    {
      name: "Intake",
      // width:"0px",
      cell: row => (
        <div
          className="custom-scrollbar"
          style={{
            width: "200px",
            // height: "50px",
            overflowY: "auto",
            overflowX: "hidden",
            whiteSpace: "normal",
          }}
        >
          {row?.Intake?.map((intake, index) => {
            const isExpired = new Date(intake?.end_date) < new Date();
            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "4px",
                }}
              >
                <span>{intake?.date}</span>
                {isExpired ? (
                  <span
                    style={{
                      backgroundColor: "#f800003b",
                      padding: "1px 6px",
                      marginLeft: "5px",
                      borderRadius: "10px",
                    }}
                  >
                    Closed
                  </span>
                ) : (
                  <span
                    style={{
                      backgroundColor: "#1bf8003b",
                      padding: "1px 6px",
                      marginLeft: "5px",
                      borderRadius: "5px",
                    }}
                  >
                    Open
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ),
    },
    {
      name: "University",
      cell: row => row.University?.name || row.University || "None",
      sortable: true,
    },
    { name: "Category", selector: row => row.Category || "None", sortable: true },
    { name: "Location", selector: row => row.Location || "None", sortable: true },
    {
      name: "Website URL",
      cell: row =>
        row.WebsiteURL ? (
          <a href={row.WebsiteURL} target="_blank" rel="noopener noreferrer">
            Click to Open
          </a>
        ) : "None",
    },
    {
      name: "Eligibility",
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
            {row?.Eligibility
              ? row.Eligibility.replace(/<[^>]+>/g, "")
              : "None"}
          </h6>
        </div>
      ),
    },
    {
      name: "Created At",
      cell: row => (
        <p>
          {row?.createdAt
            ? new Date(row.createdAt).toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour12: true,
              })
            : "None"}
        </p>
      ),
    },
    {
      name: "Action",
      cell: row => (
        <Link
          onClick={() => {
            setEditingCourse(row);
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
        <h5 className="card-title mb-0">Course Table</h5>
        <div>
          <button
            type="button"
            className="btn rounded-pill text-primary radius-8 px-4 py-2"
            onClick={() => setShowModal(true)}
          >
            Add Course
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
            <CreateMbbsCourse
              loadCourse={loadCourse}
              ele={editingCourse}
              handleClose={() => {
                setShowModal(false);
                // setEditingCourse(null);
              }}
            />
          )}
        </div>
      </div>
      <div className="card-body overflow-x-auto">
        <input
          type="text"
          placeholder="Search by Course Name"
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

export default MbbsCourseManager;