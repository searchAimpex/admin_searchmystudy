import React, { useEffect, useState, useRef } from "react";
import $ from "jquery";
import "datatables.net-dt";
import "datatables.net-dt"; // ✅ ONLY JS
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { FetchStudent, deleteStudent } from "../slice/StudentSlice";
import CreateLead from "../form/CreateLead";
import StudentStatus from "../form/StudentStatus";

const StudentManager = () => {
  const dispatch = useDispatch();
  const { student = [] } = useSelector((state) => state.student || {});

  /* ================= refs for DataTable ================= */
  const tableRef = useRef(null);
  const dataTableRef = useRef(null);

  /* ================= local state ================= */
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  /* ================= filters ================= */
  const [filters, setFilters] = useState({
    trackingId: "",
    ownerName: "",
    role: "",
    centerCode: "",
    createdAt: "",
  });

  /* ================= fetch ================= */
  const fetchData = async () => {
    await dispatch(FetchStudent());
  };

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  /* ================= filter handler ================= */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      trackingId: "",
      ownerName: "",
      role: "",
      centerCode: "",
      createdAt: "",
    });
  };

  /* ================= filtered data ================= */
  const filteredStudent = (student || []).filter((ele) => {
    if (!ele) return false;

    const trackingMatch = (ele.trackingId || "")
      .toLowerCase()
      .includes(filters.trackingId.toLowerCase());

    const ownerMatch = (ele?.User?.OwnerName || "")
      .toLowerCase()
      .includes(filters.ownerName.toLowerCase());

    const roleMatch = (ele?.User?.role || "")
      .toLowerCase()
      .includes(filters.role.toLowerCase());

    const centerCodeMatch = (ele?.User?.CenterCode || "")
      .toLowerCase()
      .includes(filters.centerCode.toLowerCase());

    let dateMatch = true;
    if (filters.createdAt) {
      const created = ele?.createdAt
        ? new Date(ele.createdAt).toISOString().slice(0, 10)
        : "";
      dateMatch = created === filters.createdAt;
    }

    return (
      trackingMatch &&
      ownerMatch &&
      roleMatch &&
      centerCodeMatch &&
      dateMatch
    );
  });

  /* ================= DataTable lifecycle (SAFE) ================= */
  const initDataTable = () => {
    if (dataTableRef.current) {
      dataTableRef.current.destroy();
      dataTableRef.current = null;
    }

    dataTableRef.current = $(tableRef.current).DataTable({
      paging: true,
      searching: false, // React filters only
      pageLength: 5,
      lengthMenu: [5, 10, 20, 50],
      destroy: true,
    });
  };

  useEffect(() => {
    if (filteredStudent.length > 0) {
      setTimeout(() => {
        initDataTable();
      }, 0);
    } else {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }
    }
  }, [filteredStudent]);

  useEffect(() => {
    return () => {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }
    };
  }, []);

  /* ================= checkbox ================= */
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredStudent.map((s) => s._id));
    } else {
      setSelectedIds([]);
    }
  };

  /* ================= delete ================= */
  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      toast.warning("Please select at least one student");
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selectedIds.length} selected student(s)?`
    );
    if (!confirmed) return;

    const res = await dispatch(deleteStudent(selectedIds));
    console.log(res,"++++++++++++++++++++")
    toast.success("Student(s) deleted successfully");
    setSelectedIds([]);
    fetchData();
  };

  /* ================= JSX ================= */
  return (
    <div className="card basic-data-table">
      <div className="card-header d-flex justify-content-between">
        <h5 className="card-title mb-0">Student Table</h5>

        <button
          className="btn btn-danger rounded-pill px-4"
          onClick={handleDelete}
        >
          Delete Selected
        </button>
      </div>

      <div className="card-body overflow-x-auto">
        {/* ================= Filters ================= */}
        <div className="mb-4 p-3 bg-light rounded">
          <div className="row g-2">
            <div className="col-md-2">
              <input
                className="form-control form-control-sm"
                name="trackingId"
                placeholder="Tracking ID"
                value={filters.trackingId}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-md-2">
              <input
                className="form-control form-control-sm"
                name="ownerName"
                placeholder="Punched By"
                value={filters.ownerName}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-md-2">
              <input
                className="form-control form-control-sm"
                name="role"
                placeholder="Center Type"
                value={filters.role}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-md-2">
              <input
                className="form-control form-control-sm"
                name="centerCode"
                placeholder="Center Code"
                value={filters.centerCode}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-md-2">
              <input
                type="date"
                className="form-control form-control-sm"
                name="createdAt"
                value={filters.createdAt}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary btn-sm w-100"
                onClick={clearFilters}
              >
                Clear
              </button>
            </div>
          </div>

          <p className="small text-muted mt-2">
            Results: {filteredStudent.length} / {student.length}
          </p>
        </div>

        {/* ================= Table ================= */}
        <table ref={tableRef} className="table bordered-table mb-0">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    filteredStudent.length > 0 &&
                    selectedIds.length === filteredStudent.length
                  }
                  onChange={handleSelectAll}
                />
              </th>
              <th>Tracking ID</th>
              <th>Student Name</th>
              <th>Punched By</th>
              <th>Father Name</th>
              <th>Country</th>
              <th>Course Name</th>
              <th>State</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Center Code</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudent.map((ele, ind) => (
              <tr key={ele._id}>
                <td>
                  <input
                    type="checkbox"
                     className="form-check-input"
                    checked={selectedIds.includes(ele._id)}
                    onChange={() => handleCheckboxChange(ele._id)}
                  />
                </td>

                <td>{ele.trackingId}</td>
                <td>
                  {ele.firstName} {ele.middleName} {ele.lastName}
                </td>
                <td>{ele.fatherName || "—"}</td>
                <td>asd</td>
                <td>{ele?.Country?.name || "—"}</td>
                <td>Course</td>
                <td>{ele.state || "—"}</td>
                <td>{ele.emailID}</td>
                <td>{ele.mobileNumber}</td>
                <td>{ele?.User?.role}</td>
                <td>{ele?.User?.CenterCode}</td>
                <td>
                  {ele.createdAt
                    ? new Date(ele.createdAt).toLocaleDateString()
                    : "—"}
                </td>

                <td>
                  <Link
                    to="#"
                    className="btn btn-sm btn-success me-2"
                    onClick={() => {
                      setEditingStudent(ele);
                      setShowModal(true);
                    }}
                  >
                    <Icon icon="lucide:edit" />
                  </Link>

                  <Link
                    to="#"
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      setEditingStudent(ele);
                      setShowStatusModal(true);
                    }}
                  >
                    <Icon icon="lucide:edit" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showModal && (
          <CreateLead
            ele={editingStudent}
            fetchData={fetchData}
            handleClose={() => setShowModal(false)}
          />
        )}

        {showStatusModal && (
          <StudentStatus
            ele={editingStudent}
            fetchData={fetchData}
            handleClose={() => setShowStatusModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default StudentManager;
