import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  deleteStudyCourse,
  fetchAbroadCourse,
} from "../slice/AbroadCourseSlice";
import CreateAbroadCourse from "../form/CreateAbroadCourse";
import DataTable from "react-data-table-component";

/* ================= HELPER ================= */
const normalize = (val) =>
  val ? val.toString().toLowerCase().trim() : "";

const AbroadCourseManager = () => {
  const dispatch = useDispatch();

  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [course, setCourse] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  /* ================= FILTER STATES ================= */
  const [search, setSearch] = useState(""); // Course name
  const [provinceSearch, setProvinceSearch] = useState("");
  const [universitySearch, setUniversitySearch] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* ================= FETCH ================= */
  const loadCourse = async () => {
    setLoading(true);
    try {
      const res = await dispatch(fetchAbroadCourse());
      if (res?.meta?.requestStatus === "fulfilled") {
        setCourse(res.payload || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourse();
  }, [dispatch]);

  /* ================= CHECKBOX ================= */
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const idsToDelete = id ? [id] : selectedIds;

    if (!idsToDelete.length) {
      toast.warn("⚠️ No items selected for deletion.");
      return;
    }

    if (
      !window.confirm(
        idsToDelete.length > 1
          ? `Delete ${idsToDelete.length} courses?`
          : "Delete this course?"
      )
    )
      return;

    try {
      const res = await dispatch(deleteStudyCourse(idsToDelete));
      if (deleteStudyCourse.fulfilled.match(res)) {
        toast.success("✅ Abroad Course deleted successfully!");
        setSelectedIds([]);
        loadCourse();
      } else {
        toast.error("❌ Delete failed");
      }
    } catch (error) {
      toast.error("⚠️ Something went wrong");
    }
  };

  /* ================= FILTER LOGIC (SAFE & FIXED) ================= */
  const filteredData = course.filter((ele) => {
    const courseName = normalize(ele?.ProgramName);
    const provinceName = normalize(ele?.Province?.name);
    const universityName = normalize(ele?.University?.name);
    const countryName = normalize(ele?.University?.Country?.name);

    const cSearch = normalize(search);
    const pSearch = normalize(provinceSearch);
    const uSearch = normalize(universitySearch);
    const coSearch = normalize(countrySearch);

    const matchCourse = !cSearch || courseName.includes(cSearch);
    const matchProvince = !pSearch || provinceName.includes(pSearch);
    const matchUniversity = !uSearch || universityName.includes(uSearch);
    const matchCountry = !coSearch || countryName.includes(coSearch);

    /* DATE FILTER */
    const createdDate = new Date(ele?.createdAt);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    const matchDate =
      (!from || createdDate >= from) &&
      (!to || createdDate <= new Date(to.setHours(23, 59, 59, 999)));

    return (
      matchCourse &&
      matchProvince &&
      matchUniversity &&
      matchCountry &&
      matchDate
    );
  });

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    {
      name: "S.L",
      cell: (row, idx) => (
        <div className="form-check d-flex align-items-center">
          <input
            type="checkbox"
            className="form-check-input"
            checked={selectedIds.includes(row._id)}
            onChange={() => handleCheckboxChange(row._id)}
          />
          <span className="ms-2">{idx + 1}</span>
        </div>
      ),
      width: "80px",
    },
    { name: "Course Name", selector: (row) => row.ProgramName, sortable: true },
    {
      name: "Country",
      selector: (row) => row.University?.Country?.name || "None",
    },
    {
      name: "Province",
      selector: (row) => row.Province?.name || "None",
    },
    {
      name: "University",
      selector: (row) => row.University?.name || "None",
    },
    {
      name: "Created At",
      cell: (row) =>
        new Date(row.createdAt).toLocaleDateString("en-GB"),
    },
    {
      name: "Action",
      cell: (row) => (
        <Link
          to="#"
          onClick={() => {
            setEditingCourse(row);
            setShowModal(true);
          }}
          className="text-success"
        >
          <Icon icon="lucide:edit" />
        </Link>
      ),
    },
  ];

  /* ================= UI ================= */
  return (
    <div className="card basic-data-table">
      <div className="card-header d-flex justify-content-between">
        <h5>Course Table</h5>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          Add Course
        </button>
      </div>

      <div className="card-body">
        {/* FILTER INPUTS */}
      <div className="d-flex gap-2 mb-3">
          <input
          className="form-control mb-2"
          placeholder="Search Course Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          className="form-control mb-2"
          placeholder="Search Province"
          value={provinceSearch}
          onChange={(e) => setProvinceSearch(e.target.value)}
        />
        <input
          className="form-control mb-2"
          placeholder="Search University"
          value={universitySearch}
          onChange={(e) => setUniversitySearch(e.target.value)}
        />
        <input
          className="form-control mb-2"
          placeholder="Search Country"
          value={countrySearch}
          onChange={(e) => setCountrySearch(e.target.value)}
        />
      </div>

        {/* DATE RANGE */}
        <div className="d-flex gap-2 mb-3">
          <input
            type="date"
            className="form-control"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <input
            type="date"
            className="form-control"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
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
        <CreateAbroadCourse
          loadCourse={loadCourse}
          ele={editingCourse}
          handleClose={() => {
            setShowModal(false);
            setEditingCourse(null);
          }}
        />
      )}
    </div>
  );
};

export default AbroadCourseManager;
