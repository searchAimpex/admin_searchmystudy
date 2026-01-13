import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  deleteAbroadUniversity,
  fetchAbroadUniversity,
} from "../slice/AbroadUniversitySlice";
import CreateAbroadUniversity from "../form/CreateAbroadUniversity";
import DataTable from "react-data-table-component";

/* ================= HELPER ================= */
const normalize = (val) =>
  val ? val.toString().toLowerCase().trim() : "";

const AbroadUniversity = () => {
  const dispatch = useDispatch();

  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [university, setUniversity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState(null);

  /* ================= FILTER STATES ================= */
  const [search, setSearch] = useState(""); // University
  const [countrySearch, setCountrySearch] = useState(""); // Country
  const [provinceSearch, setProvinceSearch] = useState(""); // Province

  /* ================= FETCH ================= */
  const loadUniversity = async () => {
    setLoading(true);
    try {
      const res = await dispatch(fetchAbroadUniversity());
      if (res?.meta?.requestStatus === "fulfilled") {
        setUniversity(res.payload || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUniversity();
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
          ? `Delete ${idsToDelete.length} universities?`
          : "Delete this university?"
      )
    )
      return;

    try {
      const res = await dispatch(deleteAbroadUniversity(idsToDelete));
      if (deleteAbroadUniversity.fulfilled.match(res)) {
        toast.success("✅ Abroad University deleted successfully!");
        setSelectedIds([]);
        loadUniversity();
      } else {
        toast.error("❌ Delete failed");
      }
    } catch (err) {
      toast.error("⚠️ Something went wrong");
    }
  };

  /* ================= FILTER LOGIC (FIXED) ================= */
  const filteredData = university.filter((ele) => {
    const universityName = normalize(ele?.name);
    const countryName = normalize(ele?.Country?.name);
    const provinceName = normalize(ele?.Province?.name);

    const uSearch = normalize(search);
    const cSearch = normalize(countrySearch);
    const pSearch = normalize(provinceSearch);

    const matchUniversity =
      !uSearch || universityName.includes(uSearch);

    const matchCountry =
      !cSearch || countryName.includes(cSearch);

    const matchProvince =
      !pSearch || provinceName.includes(pSearch);

    return matchUniversity && matchCountry && matchProvince;
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
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "Province", selector: (row) => row.Province?.name || "-" },
    { name: "Country", selector: (row) => row.Country?.name || "-" },
    {
      name: "Image",
      cell: (row) => (
        <a href={row.heroURL} target="_blank" rel="noopener noreferrer">
          View
        </a>
      ),
    },
    {
      name: "Banner",
      cell: (row) => (
        <a href={row.bannerURL} target="_blank" rel="noopener noreferrer">
          View
        </a>
      ),
    },
    {
      name: "Logo",
      cell: (row) => (
        <a href={row.logo} target="_blank" rel="noopener noreferrer">
          View
        </a>
      ),
    },
    {
      name: "Created Date",
      cell: (row) =>
        new Date(row.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      name: "Action",
      cell: (row) => (
        <>
          <Link
            to="#"
            onClick={() => {
              setEditingUniversity(row);
              setShowModal(true);
            }}
            className="me-2 text-success"
          >
            <Icon icon="lucide:edit" />
          </Link>
          <Link
            to="#"
            onClick={() => handleDelete(row._id)}
            className="text-danger"
          >
            <Icon icon="mingcute:delete-2-line" />
          </Link>
        </>
      ),
    },
  ];

  /* ================= UI ================= */
  return (
    <div className="card basic-data-table">
      <div className="card-header d-flex justify-content-between">
        <h5>University Table</h5>
        <div>
          <button
            className="btn btn-primary me-2"
            onClick={() => setShowModal(true)}
          >
            Add University
          </button>
          {selectedIds.length > 0 && (
            <button
              className="btn btn-danger"
              onClick={() => handleDelete()}
            >
              Delete Selected ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      <div className="card-body">
        {/* FILTER INPUTS */}
       <div className="d-flex">
         <input
          className="form-control mb-2"
          placeholder="Search University"
          value={search}
          style={{width:"400px", marginRight:"20px"}}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          className="form-control mb-2"
          placeholder="Search Country"
          value={countrySearch}
                    style={{width:"400px", marginRight:"20px"}}

          onChange={(e) => setCountrySearch(e.target.value)}
        />
        <input
          className="form-control mb-3"
          placeholder="Search Province"
                    style={{width:"400px", marginRight:"20px"}}

          value={provinceSearch}
          onChange={(e) => setProvinceSearch(e.target.value)}
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
        <CreateAbroadUniversity
          loadUniversity={loadUniversity}
          ele={editingUniversity}
          handleClose={() => {
            setShowModal(false);
            setEditingUniversity(null);
          }}
        />
      )}
    </div>
  );
};

export default AbroadUniversity;
