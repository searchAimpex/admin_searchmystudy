import React, { useEffect, useState } from "react";
import $ from "jquery";
import "datatables.net-dt";

import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  deleteWebinarLeads,
  fetchWebinar,
  fetchWebinarLeadss,
} from "../slice/webinarSlice";
import CreateWebinar from "../form/CreateWebinar";
import { toast } from "react-toastify";

const WebinarManager = () => {
  const dispatch = useDispatch();

  const [webinars, setwebinars] = useState([]);
  const [filteredWebinars, setFilteredWebinars] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingWebinar, setEditingWebinar] = useState(null);

  const [filterCountry, setFilterCountry] = useState("");
  const [filterName, setFilterName] = useState("");

  const fetchData = async () => {
    const a = await dispatch(fetchWebinarLeadss());
    setwebinars(a.payload);
    setFilteredWebinars(a.payload);
  };

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  // ✅ Apply filters
  useEffect(() => {
    let data = [...webinars];

    if (filterCountry) {
      data = data.filter(
        (item) =>
          item.country?.toLowerCase() === filterCountry.toLowerCase()
      );
    }

    if (filterName) {
      data = data.filter((item) =>
        item.name?.toLowerCase().includes(filterName.toLowerCase())
      );
    }

    setFilteredWebinars(data);
  }, [filterCountry, filterName, webinars]);

  // ✅ DataTable init
  useEffect(() => {
    if (filteredWebinars?.length > 0) {
      if ($.fn.DataTable.isDataTable("#dataTable")) {
        $("#dataTable").DataTable().destroy();
      }

      $("#dataTable").DataTable({
        paging: true,
        searching: true,
        pageLength: 5,
        lengthMenu: [5, 10, 20, 50],
        columnDefs: [
          { targets: [1, 3], searchable: true },
          { targets: "_all", searchable: false },
        ],
      });
    }
  }, [filteredWebinars]);

  // ✅ Checkbox
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  // ✅ Delete
  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      toast.warning("Please select at least one webinar to delete.");
      return;
    }

    if (!window.confirm(`Delete ${selectedIds.length} record(s)?`)) return;

    await dispatch(deleteWebinarLeads(selectedIds));
    toast.success("Deleted successfully");
    setSelectedIds([]);
    fetchData();
    dispatch(fetchWebinar());
  };

  // ✅ Download CSV
  const handleDownloadCSV = () => {
    if (!filteredWebinars.length) {
      toast.warning("No data available");
      return;
    }

    const headers = ["Country", "Email", "Name", "Number", "State"];

    const rows = filteredWebinars.map((item) => [
      item.country,
      item.email,
      item.name,
      item.number,
      item.state,
    ]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows]
        .map((row) => row.map((v) => `"${v || ""}"`).join(","))
        .join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "webinar_leads.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card basic-data-table">
      <div className="card-header d-flex justify-content-between">
        <h5 className="card-title mb-0">Webinar Table</h5>

        <div>
          {/* <button
            className="mx-2 btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            Add Webinar
          </button> */}

          <button
            className="mx-2 btn btn-danger"
            onClick={handleDelete}
          >
            Delete Selected
          </button>

          <button
            className="mx-2 btn btn-success"
            onClick={handleDownloadCSV}
          >
            Download CSV
          </button>
        </div>
      </div>

      {/* ✅ FILTERS */}
      <div className="row m-3">
        <div className="col-md-3">
          <select
            className="form-control"
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
          >
            <option value="">All Countries</option>
            {[...new Set(webinars.map((w) => w.country))].map(
              (country, i) => (
                <option key={i} value={country}>
                  {country}
                </option>
              )
            )}
          </select>
        </div>

        <div className="col-md-3">
          <input
            className="form-control"
            placeholder="Search by Name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />
        </div>
      </div>

      <div className="card-body overflow-x-auto">
        <table id="dataTable" className="table bordered-table mb-0">
          <thead>
            <tr>
              <th>Check</th>
              <th>Country</th>
              <th>Email</th>
              <th>Name</th>
              <th>Number</th>
              <th>State</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredWebinars.map((ele, ind) => (
              <tr key={ele._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(ele._id)}
                    onChange={() => handleCheckboxChange(ele._id)}
                  />{" "}
                  {ind + 1}
                </td>
                <td>{ele.country}</td>
                <td>{ele.email}</td>
                <td>{ele.name}</td>
                <td>{ele.number}</td>
                <td>{ele.state}</td>
                <td>
                  <Link
                    to="#"
                    className="btn btn-sm btn-success"
                    onClick={() => {
                      setEditingWebinar(ele);
                      setShowModal(true);
                    }}
                  >
                    <Icon icon="lucide:edit" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <CreateWebinar
          fetchData={fetchData}
          ele={editingWebinar}
          handleClose={() => {
            setShowModal(false);
            setEditingWebinar(null);
          }}
        />
      )}
    </div>
  );
};

export default WebinarManager;
