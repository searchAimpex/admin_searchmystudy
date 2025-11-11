import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { deleteCounsellorLead, fetchCounsellorSingleLead } from "../slice/counsellorLead";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import DataTable from "react-data-table-component";

const CounselorSingleLead = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [selectedIds, setSelectedIds] = useState([]);
  const [leads, setLeads] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const handleDelete = async () => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this lead?");
      if (!confirmed) return;
      await dispatch(deleteCounsellorLead(selectedIds));
      toast.success("Lead deleted successfully");
      const res = await dispatch(fetchCounsellorSingleLead(id));
      setLeads(res.payload);
    } catch (error) {
      toast.error("Error deleting lead");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await dispatch(fetchCounsellorSingleLead(id)).unwrap();
        setLeads(res);
      } catch (err) {
        setError(err?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchData();
    }
  }, [id, dispatch]);

  const handleCheckboxChange = (id) => {
    setSelectedIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id)
        : [...prevSelected, id]
    );
  };

  // Filter by name/email/phone
  const filteredData = leads?.filter((ele) =>
    (ele?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (ele?.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (String(ele?.phone || "")).toLowerCase().includes(search.toLowerCase())
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
    { name: "Email", selector: row => row.email || "-----", sortable: true },
    { name: "Phone", selector: row => row.phone || "-----", sortable: true },
    { name: "City", selector: row => row.city || "-----", sortable: true },
    { name: "Type", selector: row => row.type || "-----", sortable: true },
    { name: "Interested Course", selector: row => row.intersetedCourse || "-----", sortable: true },
    { name: "Interested Country", selector: row => row.intersetedCountry || "-----", sortable: true },
    { name: "Test", selector: row => row.test || "-----", sortable: true },
    { name: "Score", selector: row => row.score || "-----", sortable: true },
    {
      name: "Created At",
      cell: row =>
        row?.createdAt
          ? new Date(row.createdAt).toLocaleString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour12: true,
            })
          : "-----",
    },
  ];

  if (loading) return <p>Loading leads...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="card basic-data-table">
      <div className="card-header" style={{ display: "flex", justifyContent: "space-between" }}>
        <h5 className="card-title mb-0">Counselor lead Table</h5>
        <div>
          <button
            type="button"
            className="mx-4 btn rounded-pill text-primary radius-8 px-4 py-2"
            onClick={() => {}} // Implement download if needed
          >
            Download
          </button>
          <button
            className="mx-4 btn rounded-pill text-danger radius-8 px-4 py-2"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>
      <div className="card-body overflow-x-auto">
        <input
          type="text"
          placeholder="Search by Name, Email or Phone"
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

export default CounselorSingleLead;