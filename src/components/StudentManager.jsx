import React, { useEffect, useState } from "react";
import $ from "jquery";
import "datatables.net-dt";

import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteWebinar, fetchWebinar } from "../slice/webinarSlice";
import CreateWebinar from "../form/CreateWebinar";
import { toast } from "react-toastify";
import { deletePartner, fetchPartner } from "../slice/PartnerSlice";
import CreatePartner from "../form/CreatePartner";
import { deleteLead, FetchAssessment } from "../slice/AssessmentSlice";
import CreateLead from "../form/CreateLead";
import { deleteStudent, FetchStudent } from "../slice/StudentSlice";
import StudentStatus from "../form/StudentStatus";

const StudentManager = () => {
    const dispatch = useDispatch();
    //   const webinars  = useSelector((state) => state.partner.partner);
    // const { assessment } = useSelector(state => state.assessment)
    const { student } = useSelector(state => state.student || [])

    console.log(student,"|||||||||||||||||||||||");

    const [selectedIds, setSelectedIds] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [editingWebinar, setEditingWebinar] = useState(null);
    
    // Filter state
    const [filters, setFilters] = useState({
        trackingId: "",
        ownerName: "",
        role: "",
        centerCode: "",
        createdAt: ""
    });

    const fetchData = async () => {
        await dispatch(FetchStudent())
    };
    //   console.log(webinars)

    // ✅ Filter handler
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // ✅ Clear filters
    const clearFilters = () => {
        setFilters({
            trackingId: "",
            ownerName: "",
            role: "",
            centerCode: "",
            createdAt: ""
        });
    };

    // ✅ Filter student data (MUST be before useEffect that depends on it)
    const filteredStudent = student?.filter(ele => {
        const trackingMatch = ele?.trackingId?.toLowerCase().includes(filters.trackingId.toLowerCase());
        const ownerMatch = (ele?.User?.OwnerName || "").toLowerCase().includes(filters.ownerName.toLowerCase());
        const roleMatch = (ele?.User?.role || "").toLowerCase().includes(filters.role.toLowerCase());
        const codeMatch = (ele?.User?.CenterCode || "").toLowerCase().includes(filters.centerCode.toLowerCase());
        
        let dateMatch = true;
        if (filters.createdAt) {
            const createdDate = ele?.createdAt ? new Date(ele.createdAt).toLocaleDateString() : "";
            dateMatch = createdDate.includes(filters.createdAt);
        }
        
        return trackingMatch && ownerMatch && roleMatch && codeMatch && dateMatch;
    }) || [];

    useEffect(() => {
        fetchData();
    }, [dispatch]);

    useEffect(() => {
        if (filteredStudent?.length > 0) {
            // Delay initialization to ensure DOM is ready
            setTimeout(() => {
                try {
                    if ($.fn.DataTable.isDataTable("#dataTable")) {
                        $("#dataTable").DataTable().destroy();
                    }

                    $("#dataTable").DataTable({
                        paging: true,
                        searching: true,
                        pageLength: 5,
                        lengthMenu: [5, 10, 20, 50],
                        columnDefs: [
                            { targets: [1, 2], searchable: true },
                            { targets: "_all", searchable: false },
                        ],
                    });
                } catch (error) {
                    console.error("DataTable initialization error:", error);
                }
            }, 100);
        }
    }, [filteredStudent]);

    // ✅ Checkbox (single select/unselect)
    const handleCheckboxChange = (id) => {
        setSelectedIds((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((item) => item !== id)
                : [...prevSelected, id]
        );
    };

    // ✅ Master checkbox (select/unselect all)
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(student?.map((w) => w._id) || []);
        } else {
            setSelectedIds([]);
        }
    };

    // ✅ Delete selected webinars
    const handleDelete = async () => {
        try {
            if (selectedIds.length === 0) {
                toast.warning("Please select at least one webinar to delete.");
                return;
            }

            const confirmed = window.confirm(
                `Are you sure you want to delete ${selectedIds.length} webinar(s)?`
            );
            if (!confirmed) return;
            // console.log(selectedIds,"----------------------------------------");
            const a = await dispatch(deleteStudent(selectedIds));
            console.log(a);

            toast.success("Selected student(s) deleted successfully");
            await dispatch(FetchStudent());
            setSelectedIds([]);

        } catch (error) {
            console.log(error);
            toast.error("Error deleting student(s)");
        }
    };

    return (
        <div className="card basic-data-table">
            <div
                className="card-header"
                style={{ display: "flex", justifyContent: "space-between" }}
            >
                <h5 className="card-title mb-0">Partner Table</h5>
                <div>
                    <button
                        type="button"
                        className="mx-4 btn rounded-pill text-primary radius-8 px-4 py-2"
                        onClick={() => setShowModal(true)}
                    >
                        Create Lead
                    </button>

                    <button
                        className="mx-4 btn rounded-pill text-danger radius-8 px-4 py-2"
                        onClick={handleDelete}
                    >
                        Delete Selected
                    </button>

                    {showModal && (
                        <CreateLead
                            fetchData={fetchData}
                            ele={editingWebinar}
                            handleClose={() => {
                                setShowModal(false);
                                setEditingWebinar(null);
                            }}
                        />
                    )}
                    {showStatusModal && (
                        <StudentStatus
                            fetchData={fetchData}
                            ele={editingWebinar}
                            handleClose={() => {
                                setShowStatusModal(false);
                                setEditingWebinar(null);
                            }}
                        />
                    )}
                </div>
            </div>

            <div className="card-body overflow-x-auto">
                {/* Filter Section */}
                <div className="mb-4 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <h6 className="mb-3" style={{ fontWeight: 'bold' }}>Filter Students</h6>
                    <div className="row g-2">
                        <div className="col-md-2">
                            <input
                                type="text"
                                name="trackingId"
                                placeholder="Tracking ID"
                                value={filters.trackingId}
                                onChange={handleFilterChange}
                                className="form-control form-control-sm"
                            />
                        </div>
                        <div className="col-md-2">
                            <input
                                type="text"
                                name="ownerName"
                                placeholder="Punched By"
                                value={filters.ownerName}
                                onChange={handleFilterChange}
                                className="form-control form-control-sm"
                            />
                        </div>
                        <div className="col-md-2">
                            <input
                                type="text"
                                name="role"
                                placeholder="Center Type"
                                value={filters.role}
                                onChange={handleFilterChange}
                                className="form-control form-control-sm"
                            />
                        </div>
                        <div className="col-md-2">
                            <input
                                type="text"
                                name="centerCode"
                                placeholder="Center Code"
                                value={filters.centerCode}
                                onChange={handleFilterChange}
                                className="form-control form-control-sm"
                            />
                        </div>
                        <div className="col-md-2">
                            <input
                                type="text"
                                name="createdAt"
                                placeholder="Created Date"
                                value={filters.createdAt}
                                onChange={handleFilterChange}
                                className="form-control form-control-sm"
                            />
                        </div>
                        <div className="col-md-2">
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="btn btn-sm btn-outline-secondary w-100"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                    <p className="text-muted small mt-2">Results: {filteredStudent?.length || 0} / {student?.length || 0}</p>
                </div>

                {/* Table */}
                <table id="dataTable" className="table bordered-table mb-0">
                    <thead>
                        <tr>
                            <th>Check</th>
                            <th>Tracking ID</th>
                            <th>Punched By</th>
                            <th>Center Type</th>
                            <th>Center Code</th>
                            <th>Name</th>
                            <th>Email ID</th>
                            <th>DOB</th>
                            <th>Mobile Number</th>
                            <th>Passport No.</th>
                            <th>Status</th>
                            <th>Created At</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudent?.map((ele, ind) => (
                            <tr key={ele._id || ind}>
                                <td>
                                    <div className="form-check style-check d-flex align-items-center">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={selectedIds.includes(ele._id)}
                                            onChange={() => handleCheckboxChange(ele._id)}
                                        />
                                        <label className="form-check-label">{ind + 1}</label>
                                    </div>
                                </td>

                                <td>{ele?.trackingId}</td>
                                <td>{ele?.User?.OwnerName || "—"}</td>
                                <td>{ele?.User?.role || "—"}</td>
                                <td>{ele?.User?.CenterCode || "—"}</td>
                                <td>{ele?.firstName} {ele.middleName} {ele.lastName}</td>
                                <td>{ele?.emailID}</td>
                                <td>{ele.dob}</td>
                                <td>{ele.mobileNumber}</td>
                                <td>{ele.passportNumber}</td>
                                <td>{ele.status}</td>
                                <td>{ele?.createdAt ? new Date(ele.createdAt).toLocaleDateString() : "—"}</td>


                                <td>
                                    <Link
                                        onClick={() => {
                                            setEditingWebinar(ele);
                                            setShowModal(true);
                                        }}
                                        to="#"
                                        className="btn btn-sm btn-success"
                                    >
                                        <Icon icon="lucide:edit" />
                                    </Link>


                                    <Link
                                        onClick={() => {
                                            setEditingWebinar(ele);
                                            setShowStatusModal(true);
                                        }}
                                        to="#"
                                        className="btn btn-sm mx-8 btn-primary"
                                    >
                                        <Icon icon="lucide:edit" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default StudentManager;
