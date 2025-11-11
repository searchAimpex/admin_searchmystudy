import React, { useEffect, useState } from "react";
import $ from "jquery";
import "datatables.net-dt";

import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { toast } from "react-toastify";
import { fetchCounsellorLead, deleteCounsellorLead } from "../slice/counsellorLead";
import CreateAbroadCourse from "../form/CreateAbroadCourse";
import { fetchWebDetails } from "../slice/websiteDetails";
import WebsiteDetails from "../form/WebsiteDetails";


const WebsiteDetailsManager = () => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [websiteDetails, setwebsiteDetails] = useState()
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);


  const fetchData = async () => {
    const res1 = await dispatch(fetchWebDetails());
    console.log(res1.payload?.data, "|||||||||||||||||||||||||||||||||");
    if (res1?.meta?.requestStatus === "fulfilled") {
      setwebsiteDetails(res1?.payload?.data)
    }

  }

  useEffect(() => {
    fetchData()

  }, [dispatch]);



  return (
    <div className="card basic-data-table">
      <div className="card-header" style={{ display: "flex", justifyContent: "space-between" }}>
        <h5 className="card-title mb-0">Website Details Table</h5>

        <div>
          {/* <button
            type="button"
            className="btn rounded-pill text-primary radius-8 px-4 py-2"
            onClick={() => setShowModal(true)}
          >
            Update Details
          </button> */}
{/* 
          {selectedIds.length > 0 && (
            <button
              className="btn rounded-pill text-danger radius-8 px-4 py-2"
              onClick={() => handleDelete()}
            >
              Delete Selected ({selectedIds.length})
            </button>
          )} */}

          {showModal && (
            <WebsiteDetails
              fetchData={fetchData}
              ele={editingCourse}
              handleClose={() => {
                setShowModal(false);
                setEditingCourse(null);
              }}
            />
          )}
        </div>

      </div>
      <div className="card-body overflow-x-auto">
        <>
          <style>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 4px;
                }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background-color: #888;
              border-radius: 4px;
              border: 2px solid #f1f1f1;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background-color: #555;
                }
                `}</style>

          <table
            id="dataTable"
            className="table bordered-table mb-0"
            data-page-length={10}
          // style={{overflowX:"auto"}}
          >
            <thead>
              <tr>

                <th scope="col">Instagram</th>
                <th scope="col">Facebook</th>
                <th scope="col">LinkedIn</th>
                <th scope="col">Twiiter</th>
                <th scope="col">Counselling No</th>
                <th scope="col">Call No</th>
                <th scope="col">Whatsapp No</th>
                <th scope="col">Mail</th>
                <th scope="col">Address</th>
                <th scope="col">Action</th>

              </tr>
            </thead>
            <tbody>
              {websiteDetails?.map((ele, ind) => (
                <tr key={ele._id || ind}>

                  <td>
                    {ele?.insta}
                  </td>
                  <td>
                    {ele?.facebook}
                  </td>
                  <td>{ele?.linkedIn}</td>
                  <td>
                    {ele?.twitter}
                  </td>
                  <td>{ele?.counselling_no}</td>
                  <td>{ele?.call_no}</td>
                  <td>{ele?.whatsapp_no}</td>
                  <td>{ele?.mail}</td>
                    <td>{ele?.address}</td>
                  <td>
                    <Link
                      onClick={() => {
                        setEditingCourse(ele);
                        setShowModal(true);
                      }}
                      to="#"
                      className="w-32-px h-32-px me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center"
                    >
                      <Icon icon="lucide:edit" />
                    </Link>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      </div>
    </div>
    // <div>Hello</div>
  )
}

export default WebsiteDetailsManager