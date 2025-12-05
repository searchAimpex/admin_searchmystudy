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
import { deleteFiles, fetchCountry, fetchFile } from "../slice/CountrySlicr";
import CreateFile from "../form/CreateFile";

const FileManager = () => {
    const dispatch = useDispatch();
    //   const webinars  = useSelector((state) => state.partner.partner);
    // const { assessment } = useSelector(state => state.assessment)
    // const { student } = useSelector(state => state.student || [])
    const {file} = useSelector(state => state.country || [])
    // console.log(file,"|||||||||||||||||||||||");

    const [selectedIds, setSelectedIds] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [editingWebinar, setEditingWebinar] = useState(null);

    const fetchData = async () => {
        await dispatch(fetchCountry())
        const a = await dispatch(fetchFile())
        console.log(a,"::::::::::::::::::::::::::::");
        
    };
    //   console.log(webinars)

    useEffect(() => {
        fetchData();
    }, [dispatch]);

    useEffect(() => {
        if (file?.length > 0) {
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
    }, [file]);

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
            setSelectedIds(file?.map((w) => w._id) || []);
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
                `Are you sure you want to delete ${selectedIds.length} file(s)?`
            );
            if (!confirmed) return;
            // console.log(selectedIds,"----------------------------------------");
            const a = await dispatch(deleteFiles(selectedIds));
            // console.log(a);

            toast.success("Selected file(s) deleted successfully");
            fetchData()
            setSelectedIds([]);

        } catch (error) {
            console.log(error);
            toast.error("Error deleting file(s)");
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
                        <CreateFile
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
                            <th>Country</th>
                            <th>Name</th>
                            <th>Type</th>
                             <th>File</th>
                            <th>Create At</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {file?.map((ele, ind) => (
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

                                <td>{ele?.SecondCountry?.name}</td>
                                <td>{ele?.name}</td>
                                <td>{ele?.type}</td>
                                 <td>
                                    <a href={ele?.template} target="_blank">Link</a>
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

export default FileManager;
