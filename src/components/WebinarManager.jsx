import React, { useEffect, useState } from "react";
import $ from "jquery";
import "datatables.net-dt";

import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { deleteWebinar, fetchWebinar } from "../slice/webinarSlice";
import CreateWebinar from "../form/CreateWebinar";
import { toast } from "react-toastify";

const WebinarManager = () => {
  const dispatch = useDispatch();

  const [webinars, setwebinars] = useState([]);
  console.log(webinars,"webinars+++++++++++++++++++++++++++++");
  const [filteredWebinars, setFilteredWebinars] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingWebinar, setEditingWebinar] = useState(null);

  const [filterWeekday, setFilterWeekday] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  const fetchData = async () => {
    const res = await dispatch(fetchWebinar());
    if (!fetchWebinar.fulfilled.match(res)) {
      toast.error("Failed to load webinars");
      setwebinars([]);
      setFilteredWebinars([]);
      return;
    }
    const payload = res.payload;
    const list = Array.isArray(payload) ? payload : [];
    setwebinars(list);
    setFilteredWebinars(list);
  };

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    let data = [...webinars];

    if (filterWeekday) {
      data = data.filter(
        (item) =>
          String(item.weekday || "")
            .toLowerCase()
            .trim() === filterWeekday.toLowerCase().trim()
      );
    }

    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase().trim();
      data = data.filter((item) => {
        const hay = [
          item.title,
          item.trainer_name,
          item.trainer_profession,
        ]
          .map((x) => String(x || "").toLowerCase())
          .join(" ");
        return hay.includes(q);
      });
    }

    setFilteredWebinars(data);
  }, [filterWeekday, filterSearch, webinars]);

  useEffect(() => {
    if ($.fn.DataTable.isDataTable("#dataTable")) {
      $("#dataTable").DataTable().destroy();
    }
    if (filteredWebinars?.length > 0) {
      $("#dataTable").DataTable({
        paging: true,
        searching: true,
        pageLength: 5,
        lengthMenu: [5, 10, 20, 50],
        columnDefs: [
          { targets: "_all", searchable: false },
          { targets: [1, 2, 3, 4], searchable: true },
        ],
        order: [[5, "desc"]],
      });
    }
  }, [filteredWebinars]);

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      toast.warning("Please select at least one webinar to delete.");
      return;
    }

    if (!window.confirm(`Delete ${selectedIds.length} webinar(s)?`)) return;

    const res = await dispatch(deleteWebinar(selectedIds));
    if (deleteWebinar.fulfilled.match(res)) {
      toast.success("Deleted successfully");
      setSelectedIds([]);
      fetchData();
      dispatch(fetchWebinar());
    } else {
      const msg =
        res.payload?.message || res.error?.message || "Delete failed";
      toast.error(String(msg));
    }
  };

  const handleDownloadCSV = () => {
    if (!filteredWebinars.length) {
      toast.warning("No data available");
      return;
    }

    const headers = [
      "Trainer Name",
      "Trainer Profession",
      "Title",
      "Weekday",
      "Date",
      "Time Start",
      "Time End",
      "Image URL",
    ];

    const rows = filteredWebinars.map((item) => [
      item.trainer_name,
      item.trainer_profession,
      item.title,
      item.weekday,
      item.date,
      item.timeStart,
      item.timeEnd,
      item.imageURL,
    ]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows]
        .map((row) => row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
        .join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "webinars.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const weekdayOptions = [
    ...new Set(
      webinars
        .map((w) => (w.weekday ? String(w.weekday).trim() : ""))
        .filter(Boolean)
    ),
  ].sort();

  return (
    <div className="card basic-data-table">
      <div className="card-header d-flex justify-content-between flex-wrap gap-2">
        <h5 className="card-title mb-0">Webinar Table</h5>

        <div>
          <button
            type="button"
            className="mx-2 btn btn-primary"
            onClick={() => {
              setEditingWebinar(null);
              setShowModal(true);
            }}
          >
            Add Webinar
          </button>

          <button
            type="button"
            className="mx-2 btn btn-danger"
            onClick={handleDelete}
          >
            Delete Selected
          </button>

          <button
            type="button"
            className="mx-2 btn btn-success"
            onClick={handleDownloadCSV}
          >
            Download CSV
          </button>
        </div>
      </div>

      <div className="row m-3 g-2">
        <div className="col-md-3">
          <select
            className="form-control"
            value={filterWeekday}
            onChange={(e) => setFilterWeekday(e.target.value)}
          >
            <option value="">All weekdays</option>
            {weekdayOptions.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Search title, trainer name, or profession"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card-body overflow-x-auto">
        <table id="dataTable" className="table bordered-table mb-0">
          <thead>
            <tr>
              <th style={{ width: "72px" }}>Check</th>
              <th>Trainer Name</th>
              <th>Trainer Profession</th>
              <th>Title</th>
              <th>Weekday</th>
              <th>Date</th>
              <th>Start</th>
              <th>End</th>
              <th>Image</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {webinars.map((ele, ind) => (
              <tr key={ele._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(ele._id)}
                    onChange={() => handleCheckboxChange(ele._id)}
                  />{" "}
                  {ind + 1}
                </td>
                <td>{ele.trainer_name}</td>
                <td>{ele.trainer_profession}</td>
                <td>{ele.title}</td>
                <td>{ele.weekday}</td>
                <td>{ele.date}</td>
                <td>{ele.timeStart}</td>
                <td>{ele.timeEnd}</td>
                <td>
                  {ele.imageURL ? (
                    <a href={`https://backend.searchmystudy.com/${ele.imageURL}`} target="_blank" rel="noopener noreferrer">
                    {/* <img
                      src={`https://backend.searchmystudy.com/${ele.imageURL}`}
                      alt=""
                      style={{
                        maxWidth: "96px",
                        maxHeight: "48px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                        /> */}
                        Click to view
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  <Link
                    to="#"
                    className="btn btn-sm btn-success"
                    onClick={(e) => {
                      e.preventDefault();
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
