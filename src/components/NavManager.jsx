import React, { use, useEffect, useState } from "react";
import $ from "jquery";
import "datatables.net-dt";

import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { deleteLoanLead } from "../slice/loanLead";
import { fetchComission } from "../slice/comission";
import CreateCommission from "../form/CreateCommission";
import { deleteNav, fetchNav } from "../slice/nav";
import CreateNav from "../form/CreateNav";

const NavManager = () => {
    const dispatch = useDispatch();
    // const {  } = useSelector((state) => state?.comission);
    const comission  = useSelector((state) => state?.nav?.nav || []);

    const [selectedIds, setSelectedIds] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingWebinar, setEditingWebinar] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchData = async () => {
        const a = await dispatch(fetchNav())
        // console.log(a)
    };

    useEffect(() => {
        fetchData();
    }, [dispatch]);

    useEffect(() => {
        if (comission?.length > 0) {
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
                            { targets: [1, 2], searchable: true }, // Tracking ID & Name searchable
                            { targets: "_all", searchable: false },
                        ],
                    });
                } catch (error) {
                    console.error("DataTable initialization error:", error);
                }
            }, 100);
        }
    }, [comission]);

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
            setSelectedIds(comission?.map((w) => w._id) || []);
        } else {
            setSelectedIds([]);
        }
    };

    // ✅ Delete selected webinars
    const handleDelete = async () => {
        if (selectedIds.length === 0) {
            toast.warning("Please select at least one nav to delete.");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete ${selectedIds.length} nav(s)?`
        );
        if (!confirmed) return;

        setIsDeleting(true);
        try {
            // dispatch delete and wait for it to finish
            const res = await dispatch(deleteNav(selectedIds));

            // optionally check result status
            if (res?.meta?.requestStatus === "fulfilled") {
                // refetch list and wait for update so DataTable re-inits via effect
                await fetchData();

                toast.success("Selected nav(s) deleted successfully");
                setSelectedIds([]);
            } else {
                const msg = res?.payload?.message || res?.error?.message || "Delete failed";
                toast.error(msg);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error deleting nav(s)");
        } finally {
            setIsDeleting(false);
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
                        <CreateNav
                            fetchData={fetchData}
                            ele={editingWebinar}
                            handleClose={() => {
                                setShowModal(false);
                                setEditingWebinar(null);
                            }}
                        />
                    )}

                </div>
            </div>

            <div className="card-body overflow-x-auto">
                <table id="dataTable" className="table bordered-table mb-0">
                    <thead>
                        <tr>
                            <th>Check</th>
                            <th>Name</th>
                            <th>URL</th>
                            <th>Create At</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comission.map((ele, ind) => (
                            <tr key={ele._id || ind}>
                                <td>
                                    <div 
                                    className="form-check style-check d-flex align-items-center"
                                    >
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={selectedIds.includes(ele._id)}
                                            onChange={() => handleCheckboxChange(ele._id)}
                                        />
                                        <label className="form-check-label">{ind + 1}</label>
                                    </div>
                                </td>
                              

                                <td>{ele?.name || "---------"}</td>
                                <td>
                                    <a href={ele?.url} target="_blank">Link</a>
                                </td>
                                <td>{ele?.createdAt}</td>


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


                                    {/* <Link
                                        onClick={() => {
                                            setEditingWebinar(ele);
                                            setShowStatusModal(true);
                                        }}
                                        to="#"
                                        className="btn mx-10 btn-sm btn-primary"
                                    >
                                        <Icon icon="lucide:edit" />
                                    </Link> */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default NavManager;
