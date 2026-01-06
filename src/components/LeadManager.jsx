import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";
import "datatables.net-dt";
import "datatables.net-buttons";
import "datatables.net-buttons/js/buttons.html5";

import JSZip from "jszip";
window.JSZip = JSZip;

import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteLead, FetchAssessment } from "../slice/AssessmentSlice";
import CreateLead from "../form/CreateLead";
import AssissmentStatus from "../form/AssissmentStatus";
import { toast } from "react-toastify";

const LeadManager = () => {
    const dispatch = useDispatch();
    const { assessment } = useSelector((state) => state.assessment);

    const tableRef = useRef(null);

    const [selectedIds, setSelectedIds] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [editingWebinar, setEditingWebinar] = useState(null);

    /* ================= FETCH ================= */
    const fetchData = async () => {
        await dispatch(FetchAssessment());
    };

    useEffect(() => {
        fetchData();
    }, []);

    /* ================= DATATABLE INIT ================= */
    useEffect(() => {
        if (!assessment?.length) return;

        if ($.fn.DataTable.isDataTable("#dataTable")) {
            $("#dataTable").DataTable().destroy();
        }

        tableRef.current = $("#dataTable").DataTable({
            paging: true,
            searching: true,
            pageLength: 5,
            lengthMenu: [5, 10, 20, 50],
            dom: "Bfrtip",
            buttons: [
                {
                    extend: "excelHtml5",
                    title: "Lead_Report",
                    exportOptions: {
                        columns: [
                            1, // Tracking ID
                            2, // Student Name
                            3, // Role
                            4, // Country
                            5, // Course
                            6, // Email
                            7, // Phone
                            9, // Center Code
                            10, // Status
                            11, // Created At
                        ],
                        modifier: {
                            search: "applied", // export filtered data only
                            order: "applied",
                        },
                    },
                },
            ],
            language: {
                emptyTable: "No data available",
                zeroRecords: "Data not found",
            },
        });

        return () => {
            tableRef.current?.destroy();
        };
    }, [assessment]);

    /* ================= FILTER HELPERS ================= */
    const searchColumn = (index, value) => {
        tableRef.current?.column(index).search(value).draw();
    };

    const filterDate = (value) => {
        if (!value) {
            searchColumn(11, "");
            return;
        }
        const formatted = new Date(value).toLocaleDateString();
        searchColumn(11, formatted);
    };

    /* ================= DELETE ================= */
    const handleDelete = async () => {
        if (!selectedIds.length) {
            toast.warning("Select at least one lead");
            return;
        }

        if (!window.confirm("Are you sure you want to delete?")) return;

        await dispatch(deleteLead(selectedIds));
        toast.success("Deleted successfully");
        fetchData();
        setSelectedIds([]);
    };

    /* ================= ROLE DROPDOWN ================= */
    const roles = [
        ...new Set(assessment?.map((a) => a?.User?.role).filter(Boolean)),
    ];

    return (
        <div className="card basic-data-table">
            <div className="card-header d-flex justify-content-between">
                <h5>Lead Manager</h5>
                <div>
                    <button
                        className="btn btn-success mx-2"
                        onClick={() =>
                            tableRef.current
                                .button(".buttons-excel")
                                .trigger()
                        }
                    >
                        Download Excel
                    </button>

                    <button
                        className="btn btn-primary mx-2"
                        onClick={() => setShowModal(true)}
                    >
                        Create Lead
                    </button>

                    <button
                        className="btn btn-danger mx-2"
                        onClick={handleDelete}
                    >
                        Delete Selected
                    </button>
                </div>
            </div>

            <div className="card-body">

                {/* ================= FILTERS ================= */}
                <div className="row mb-3">
                    <div className="col-md-2">
                        <input
                            className="form-control"
                            placeholder="Tracking ID"
                            onKeyUp={(e) =>
                                searchColumn(1, e.target.value)
                            }
                        />
                    </div>

                    <div className="col-md-2">
                        <select
                            className="form-control"
                            onChange={(e) =>
                                searchColumn(3, e.target.value)
                            }
                        >
                            <option value="">All Roles</option>
                            {roles.map((role) => (
                                <option key={role} value={role}>
                                    {role}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-2">
                        <input
                            className="form-control"
                            placeholder="Center Code"
                            onKeyUp={(e) =>
                                searchColumn(9, e.target.value)
                            }
                        />
                    </div>

                    <div className="col-md-2">
                        <select
                            className="form-control"
                            onChange={(e) =>
                                searchColumn(10, e.target.value)
                            }
                        >
                            <option value="">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>

                    <div className="col-md-2">
                        <input
                            type="date"
                            className="form-control"
                            onChange={(e) =>
                                filterDate(e.target.value)
                            }
                        />
                    </div>
                </div>

                {/* ================= TABLE ================= */}
                <table id="dataTable" className="table bordered-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Tracking ID</th>
                            <th>Student Name</th>
                            <th>Role</th>
                            <th>Country</th>
                            <th>Course</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>DOB</th>
                            <th>Center Code</th>
                            <th>Status</th>
                            <th>Created At</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assessment?.map((ele) => (
                            <tr key={ele._id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(ele._id)}
                                        onChange={() =>
                                            setSelectedIds((prev) =>
                                                prev.includes(ele._id)
                                                    ? prev.filter(
                                                          (id) =>
                                                              id !== ele._id
                                                      )
                                                    : [...prev, ele._id]
                                            )
                                        }
                                    />
                                </td>

                                <td>{ele.trackingId}</td>
                                <td>
                                    {ele.firstName} {ele.lastName}
                                </td>
                                <td>{ele?.User?.role}</td>
                                <td>{ele?.Country?.name || "—"}</td>
                                <td>{ele.Course}</td>
                                <td>{ele.emailID}</td>
                                <td>{ele.mobileNumber}</td>
                                <td>{ele.dob}</td>
                                <td>{ele?.User?.CenterCode}</td>
                                <td>{ele.status}</td>
                                <td>
                                    {new Date(
                                        ele.createdAt
                                    ).toLocaleDateString()}
                                </td>

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

                                    <Link
                                        to="#"
                                        className="btn btn-sm btn-primary mx-2"
                                        onClick={() => {
                                            setEditingWebinar(ele);
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
            </div>

            {showModal && (
                <CreateLead
                    ele={editingWebinar}
                    fetchData={fetchData}
                    handleClose={() => setShowModal(false)}
                />
            )}

            {showStatusModal && (
                <AssissmentStatus
                    ele={editingWebinar}
                    fetchData={fetchData}
                    handleClose={() => setShowStatusModal(false)}
                />
            )}
        </div>
    );
};

export default LeadManager;
