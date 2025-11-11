import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { websiteLeads } from "../slice/contachUsLead";

const ContactUsLeadManager = () => {
  const dispatch = useDispatch();
  const [leads, setLeads] = useState([]);
  const [query, setQuery] = useState([]);
  const [contact, setContact] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("leads"); // 'leads', 'contact', 'query'
  const [selectedRows, setSelectedRows] = useState([]);

  // Fetch data
  const fetchData = async () => {
    const res = await dispatch(websiteLeads());
    if (Array.isArray(res?.payload?.leads)) {
      setLeads(res.payload.leads);
      setContact(res?.payload?.contact || []);
      setQuery(res?.payload?.query || []);
    } else {
      setLeads([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  // Columns config for table headers
  const columnsMap = {
    leads: ["Sr No.", "Name", "Email", "Message", "Phone", "Occupation", "Created At"],
    contact: ["Name", "Email", "Phone", "Message", "Created At"],
    query: ["Name", "Email", "Query", "Phone", "Created At"],
  };

  // Data for each type
  const dataMap = { leads, contact, query };

  // Filtered data for search
  const filteredData =
    dataMap[activeTab]?.filter(
      (item) =>
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.email?.toLowerCase().includes(search.toLowerCase())
    ) || [];

  // Handle row selection
  const toggleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // Handle delete selected
  const handleDelete = () => {
    if (selectedRows.length === 0) {
      alert("No rows selected!");
      return;
    }

    const updatedData = dataMap[activeTab].filter(
      (item) => !selectedRows.includes(item._id)
    );

    if (activeTab === "leads") setLeads(updatedData);
    if (activeTab === "contact") setContact(updatedData);
    if (activeTab === "query") setQuery(updatedData);

    setSelectedRows([]);
    alert(`Deleted ${selectedRows.length} ${activeTab}`);
  };

  return (
    <div className="card basic-data-table">
      <div
        className="card-header"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <h5 className="card-title mb-0">Contact Leads Table</h5>
        <div style={{ display: "flex", gap: "10px" }}>
          <select
            className="form-select form-select-sm"
            style={{ minWidth: 140 }}
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option value="leads">Leads</option>
            <option value="contact">Contact</option>
            <option value="query">Query</option>
          </select>

          <button
            className="btn btn-danger btn-sm"
            onClick={handleDelete}
            disabled={selectedRows.length === 0}
          >
            Delete Selected
          </button>
        </div>
      </div>

      <div className="card-body overflow-x-auto">
        <input
          type="text"
          placeholder="Search by Name or Email"
          className="form-control mb-3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Normal HTML Table */}
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRows(filteredData.map((item) => item._id));
                    } else {
                      setSelectedRows([]);
                    }
                  }}
                  checked={
                    filteredData.length > 0 &&
                    selectedRows.length === filteredData.length
                  }
                />
              </th>
              {columnsMap[activeTab].map((col, idx) => (
                <th key={idx}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
  {filteredData.map((item, index) => (
    <tr key={item._id}>
      <td>
        {index + 1}
        <input
          type="checkbox"
          checked={selectedRows.includes(item._id)}
          onChange={() => toggleSelectRow(item._id)}
          style={{ marginLeft: "8px" }}
        />
      </td>

      {activeTab === "leads" && (
        <>
          <td>{item.name}</td>
          <td>{item.email}</td>
          <td>{item.message}</td>
          <td>{item.phoneNo}</td>
          <td>{item.occupation}</td>
          <td>{new Date(item.createdAt).toLocaleString()}</td>
        </>
      )}

      {activeTab === "contact" && (
        <>
          <td>{item.name}</td>
          <td>{item.email}</td>
          <td>{item.phoneNo}</td>
          <td>{item.message}</td>
          <td>{new Date(item.createdAt).toLocaleString()}</td>
        </>
      )}

      {activeTab === "query" && (
        <>
          <td>{item.name}</td>
          <td>{item.email}</td>
          <td>{item.query}</td>
          <td>{item.phoneNo}</td>
          <td>{new Date(item.createdAt).toLocaleString()}</td>
        </>
      )}
    </tr>
  ))}
</tbody>

        </table>
      </div>
    </div>
  );
};

export default ContactUsLeadManager;
