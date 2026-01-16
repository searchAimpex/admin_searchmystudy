import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { deleteQueries, websiteLeads } from "../slice/contachUsLead";

const ContactUsLeadManager = () => {
  const dispatch = useDispatch();

  const [leads, setLeads] = useState([]);
  const [contact, setContact] = useState([]);
  const [query, setQuery] = useState([]);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("leads");

  // ✅ STORE IDS BY TYPE
  const [selectedIds, setSelectedIds] = useState({
    leads: [],
    contact: [],
    query: [],
  });

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // 🔹 FETCH DATA
  const fetchData = async () => {
    const res = await dispatch(websiteLeads());
    if (Array.isArray(res?.payload?.leads)) {
      setLeads(res.payload.leads);
      setContact(res?.payload?.contact || []);
      setQuery(res?.payload?.query || []);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  const columnsMap = {
    leads: ["Sr No.", "Name", "Email", "Message", "Phone", "Occupation", "Created At"],
    contact: ["Name", "Email", "Phone", "Message", "Created At"],
    query: ["Name", "Email", "Query", "Phone", "Created At"],
  };

  const dataMap = { leads, contact, query };

  // 🔹 FILTER (SEARCH + DATE)
  const filteredData =
    dataMap[activeTab]?.filter((item) => {
      const matchesSearch =
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.email?.toLowerCase().includes(search.toLowerCase());

      const createdAt = item?.createdAt ? new Date(item.createdAt) : null;
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;

      const matchesDate =
        (!from || (createdAt && createdAt >= from)) &&
        (!to || (createdAt && createdAt <= to));

      return matchesSearch && matchesDate;
    }) || [];

  // 🔹 SINGLE ROW CHECKBOX
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) => {
      const ids = prev[activeTab];
      return {
        ...prev,
        [activeTab]: ids.includes(id)
          ? ids.filter((x) => x !== id)
          : [...ids, id],
      };
    });
  };

  // 🔹 SELECT ALL
  const handleSelectAll = (checked) => {
    setSelectedIds((prev) => ({
      ...prev,
      [activeTab]: checked ? filteredData.map((i) => i._id) : [],
    }));
  };

  // 🔹 DELETE
  const handleDelete = async () => {
    const idsToDelete = selectedIds[activeTab];

    if (idsToDelete.length === 0) {
      alert("No rows selected!");
      return;
    }

    const updatedData = dataMap[activeTab].filter(
      (item) => !idsToDelete.includes(item._id)
    );

    if (activeTab === "leads") setLeads(updatedData);
    if (activeTab === "contact") setContact(updatedData);
    if (activeTab === "query") setQuery(updatedData);
    console.log({
        leads: activeTab === "leads" ? idsToDelete : [],
        contact: activeTab === "contact" ? idsToDelete : [],
        query: activeTab === "query" ? idsToDelete : [],
      });
    
   const res =  await dispatch(
      deleteQueries({
        leads: activeTab === "leads" ? idsToDelete : [],
        contact: activeTab === "contact" ? idsToDelete : [],
        query: activeTab === "query" ? idsToDelete : [],
      })
    );
    console.log(res,"||||||||||||||||||||||||||")
    setSelectedIds((prev) => ({
      ...prev,
      [activeTab]: [],
    }));

    alert(`Deleted ${idsToDelete.length} ${activeTab}`);
  };

  // 🔹 CSV DOWNLOAD
  const handleDownload = () => {
    if (!filteredData.length) return;

    const columns = columnsMap[activeTab];
    const csvRows = [columns.join(",")];

    filteredData.forEach((item, index) => {
      let row = [];

      if (activeTab === "leads") {
        row = [
          index + 1,
          item.name,
          item.email,
          item.message,
          item.phoneNo,
          item.occupation,
          new Date(item.createdAt).toLocaleString(),
        ];
      }

      if (activeTab === "contact") {
        row = [
          item.name,
          item.email,
          item.phoneNo,
          item.message,
          new Date(item.createdAt).toLocaleString(),
        ];
      }

      if (activeTab === "query") {
        row = [
          item.name,
          item.email,
          item.query,
          item.phoneNo,
          new Date(item.createdAt).toLocaleString(),
        ];
      }

      csvRows.push(row.map((c) => `"${c}"`).join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTab}_data.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card basic-data-table">
      <div className="card-header d-flex justify-content-between">
        <select
          className="form-select form-select-sm"
          style={{ width: 150 }}
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
        >
          <option value="leads">Leads</option>
          <option value="contact">Contact</option>
          <option value="query">Query</option>
        </select>

        <div className="d-flex gap-2">
          <button
            className="btn btn-danger btn-sm"
            onClick={handleDelete}
            disabled={selectedIds[activeTab].length === 0}
          >
            Delete Selected
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={handleDownload}
            disabled={!filteredData.length}
          >
            Download
          </button>
        </div>
      </div>

      <div className="card-body overflow-x-auto">
        <div className="d-flex gap-3 mb-3">
          <input
            className="form-control"
            placeholder="Search Name / Email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input type="date" className="form-control" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <input type="date" className="form-control" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>

        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                       className="form-check-input" 
                  checked={
                    filteredData.length > 0 &&
                    selectedIds[activeTab].length === filteredData.length
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              {columnsMap[activeTab].map((col, i) => (
                <th key={i}>{col}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredData.map((item, index) => (
              <tr key={item._id}>
                <td>
                  <input
                    type="checkbox"
                         className="form-check-input"   
                    checked={selectedIds[activeTab].includes(item._id)}
                    onChange={() => handleCheckboxChange(item._id)}
                  />
                </td>

                {activeTab === "leads" && (
                  <>
                    <td>{index + 1}</td>
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
