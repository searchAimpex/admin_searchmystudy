import React, { useEffect, useState } from "react";
import $ from "jquery";
import "datatables.net-dt";

import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { deletePromotional, fetchPromotional } from "../slice/promotional";
// import CreatePromotional from "../form/CreatePromotional";
import CreateContact from "../form/CreateContact";
import { deleteContact, fetchContact } from "../slice/contact";

const ContactManager = () => {
    const dispatch = useDispatch();
    // contact slice returns an array (or maybe an object). normalize to array to avoid destructuring/null errors
    const navItems = useSelector((state) => {
        const c = state?.contact?.contact;
        // if slice returns an array, return it; if it returns an object with navItems, pick it; otherwise default to []
        if (Array.isArray(c)) return c;
        if (c?.navItems && Array.isArray(c.navItems)) return c.navItems;
        if (c?.data && Array.isArray(c.data)) return c.data;
        return [];
    });

    const [selectedIds, setSelectedIds] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingWebinar, setEditingWebinar] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [items, setItems] = useState([]);

    const fetchData = async () => {
        const a = await dispatch(fetchPromotional())
        const b  = await dispatch(fetchContact())
        // console.log(b,"-------------------------------");
        
    };

    useEffect(() => {
        fetchData();
    }, [dispatch]);

    useEffect(() => {
        // sync local items with store so we can update UI optimistically
        setItems(Array.isArray(navItems) ? navItems : []);
        if (navItems && navItems.length > 0) {
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
    }, [navItems]); // re-init table when store data changes

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
            setSelectedIds((Array.isArray(navItems) ? navItems.map((w) => w._id) : []));
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
        // optimistic UI: remove rows immediately
        const previousItems = items;
        setItems(prev => prev.filter(item => !selectedIds.includes(item._id)));
        const idsToDelete = [...selectedIds];
        setSelectedIds([]);

        try {
            const res = await dispatch(deleteContact(idsToDelete));
            if (res?.meta?.requestStatus === "fulfilled") {
                // optional: re-sync from server to ensure consistent state
                await fetchData();
                toast.success("Selected nav(s) deleted successfully");
            } else {
                // revert optimistic change
                setItems(previousItems);
                const msg = res?.payload?.message || res?.error?.message || "Delete failed";
                toast.error(msg);
            }
        } catch (error) {
            console.error(error);
            // revert optimistic change
            setItems(previousItems);
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
                        <CreateContact
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
                            <th>Designation</th>
                            <th>Number</th>
                            <th>Profile</th>
                            <th>Create At</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(Array.isArray(items) ? items : []).map((ele, ind) => (
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
                                 <td>{ele?.designation || "---------"}</td>
                                <td>
                                    <a href={ele?.profileImg} target="_blank">Link</a>
                                </td>
                                 <td>{ele?.phone || "---------"}</td>

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

export default ContactManager;
