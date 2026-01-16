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

  // Existing filters
  const [search, setSearch] = useState("");
  const [universitySearch, setUniversitySearch] = useState("");
  const [countrySearch, setCountrySearch] = useState("");

  // NEW filters
  const [programLevelSearch, setProgramLevelSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

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
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const handleDelete = async (id) => {
    const idsToDelete = id ? [id] : selectedIds;
    if (!idsToDelete.length) {
      toast.warn("⚠️ No items selected for deletion.");
      return;
    }

    if (
      !window.confirm(
        idsToDelete.length > 1
          ? `Are you sure you want to delete ${idsToDelete.length} courses?`
          : "Are you sure you want to delete this course?"
      )
    )
      return;

    try {
      const res = await dispatch(deleteMbbsCourse(idsToDelete));
      if (deleteMbbsCourse.fulfilled.match(res)) {
        toast.success("✅ MBBS Course deleted successfully!");
        setSelectedIds([]);
        loadCourse();
      }
    } catch (error) {
      toast.error("⚠️ Unexpected error");
    }
  };

  // 🔍 FULL FILTER LOGIC
  const filteredData = course.filter((ele) => {
    const courseName = ele?.ProgramName?.toLowerCase() || "";
    const universityName = ele?.University?.name?.toLowerCase() || "";
    const countryName =
      ele?.University?.Country?.name?.toLowerCase() ||
      ele?.Country?.name?.toLowerCase() ||
      "";
    const programLevel = ele?.ProgramLevel?.toLowerCase() || "";
    const category = ele?.Category?.toLowerCase() || "";

    const createdAt = ele?.createdAt ? new Date(ele.createdAt) : null;
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    const dateMatch =
      (!from || (createdAt && createdAt >= from)) &&
      (!to || (createdAt && createdAt <= to));

    return (
      courseName.includes(search.toLowerCase()) &&
      universityName.includes(universitySearch.toLowerCase()) &&
      countryName.includes(countrySearch.toLowerCase()) &&
      programLevel.includes(programLevelSearch.toLowerCase()) &&
      category.includes(categorySearch.toLowerCase()) &&
      dateMatch
    );
  });

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
      cell: row => (
        <div style={{ width: "200px", overflowY: "auto" }}>
          {row?.Intake?.map((intake, i) => {
            const isExpired = new Date(intake?.end_date) < new Date();
            return (
              <div key={i} className="d-flex justify-content-between mb-1">
                <span>{intake?.date}</span>
                <span
                  style={{
                    backgroundColor: isExpired ? "#f800003b" : "#1bf8003b",
                    padding: "1px 6px",
                    borderRadius: "5px",
                  }}
                >
                  {isExpired ? "Closed" : "Open"}
                </span>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      name: "University",
      cell: row => row.University?.name || "None",
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
        <div style={{ width: "300px", height: "50px", overflowY: "auto" }}>
          {row?.Eligibility
            ? row.Eligibility.replace(/<[^>]+>/g, "")
            : "None"}
        </div>
      ),
    },
    {
      name: "Created At",
      cell: row =>
        row?.createdAt
          ? new Date(row.createdAt).toLocaleDateString()
          : "None",
    },
    {
      name: "Action",
      cell: row => (
        <Link
          to="#"
          onClick={() => {
            setEditingCourse(row);
            setShowModal(true);
          }}
          className="w-32-px h-32-px bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center"
        >
          <Icon icon="lucide:edit" />
        </Link>
      ),
    },
  ];

  return (
    <div className="card basic-data-table">
      <div className="card-header d-flex justify-content-between">
        <h5 className="card-title mb-0">Course Table</h5>
        <button
          className="btn rounded-pill text-primary radius-8 px-4 py-2"
          onClick={() => setShowModal(true)}
        >
          Add Course
        </button>
      </div>

      <div className="card-body overflow-x-auto">
        <div className="d-flex flex-wrap gap-3 mb-3">
          <input className="form-control" style={{ width: 300 }} placeholder="Course Name" value={search} onChange={e => setSearch(e.target.value)} />
          <input className="form-control" style={{ width: 300 }} placeholder="University" value={universitySearch} onChange={e => setUniversitySearch(e.target.value)} />
          <input className="form-control" style={{ width: 300 }} placeholder="Country" value={countrySearch} onChange={e => setCountrySearch(e.target.value)} />
          <input className="form-control" style={{ width: 250 }} placeholder="Program Level" value={programLevelSearch} onChange={e => setProgramLevelSearch(e.target.value)} />
          <input className="form-control" style={{ width: 250 }} placeholder="Category" value={categorySearch} onChange={e => setCategorySearch(e.target.value)} />
          <input type="date" className="form-control" style={{ width: 200 }} value={fromDate} onChange={e => setFromDate(e.target.value)} />
          <input type="date" className="form-control" style={{ width: 200 }} value={toDate} onChange={e => setToDate(e.target.value)} />
        </div>

        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          highlightOnHover
          responsive
          progressPending={loading}
        />
      </div>

      {showModal && (
        <CreateMbbsCourse
          loadCourse={loadCourse}
          ele={editingCourse}
          handleClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default MbbsCourseManager;
