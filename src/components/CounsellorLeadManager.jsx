import React, { useEffect, useState } from "react";
import $ from "jquery";
import "datatables.net-dt";

import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { toast } from "react-toastify";
import { fetchCounsellorLead,deleteCounsellorLead } from "../slice/counsellorLead";
// import { deleteCounsellorLead, fetchCounsellorLead } from "../slice/counsellorLead";


const CounsellorLeadManager = () => {
  const dispatch = useDispatch();
  const { counsellorLeads } = useSelector((state)=>state.counsellorLead)
  const [selectedIds, setSelectedIds] = useState([]);

  console.log(counsellorLeads,"_____________************");
  

  const fetchData = async ()=>{
      const res1 = await dispatch(fetchCounsellorLead());
      console.log(res1);
    }

    useEffect(() => {    
      fetchData()
      
    }, [dispatch]);

  const handleCheckboxChange = (id) => {
    setSelectedIds((prevSelected) => {
      if (prevSelected.includes(id)) {
        // Remove if already selected
        return prevSelected.filter((item) => item !== id);
      } else {
        // Add if not selected
        return [...prevSelected, id];
      }
    });
  };

const handleDelete = async () => {
  try {
    const confirmed = window.confirm("Are you sure you want to delete this webinar?");
    if (!confirmed) return; // stop if user clicks Cancel

   const res =  await dispatch(deleteCounsellorLead(selectedIds));
    console.log(res);
    
   fetchData()
    toast.success("lead deleted successfully");
  } catch (error) {
    console.log(error);
    toast.error("Error deleting lead");
  }
};

  // console.log(webinars);
  
  return (
    <div className="card basic-data-table">
      <div className="card-header" style={{ display: "flex", justifyContent: "space-between" }}>
        <h5 className="card-title mb-0">ContactUs lead Table</h5>
        <div>
          <button
            type="button"
            className="mx-4 btn rounded-pill text-primary radius-8 px-4 py-2"
            onClick={"jhkjbkj"}
          >
            Download
          </button>

            <button   className="mx-4 btn rounded-pill text-danger radius-8 px-4 py-2" onClick={handleDelete}>Delete</button>

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
                <th scope="col">
                  <div className="form-check style-check d-flex align-items-center">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label">S.L</label>
                  </div>
                </th>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Phone</th>
                <th scope="col">City</th>
                <th scope="col">Type</th>
                <th scope="col">Interested Course</th>
                <th scope="col">Interested Country</th>
                <th scope="col">Test</th>
                <th scope="col">Score</th>
                <th scope="col">Created At</th>
              </tr>
            </thead>
            <tbody>
              {counsellorLeads?.map((ele, ind) => (
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
                  <td>
                    {ele?.name}
                  </td>
                  <td>
                    {ele?.email}
                  </td>
                  <td>
                    {ele?.phone}
                  </td>
                  <td>{ele?.city}</td>
                  <td>{ele?.type}</td>
                  <td>{ele?.intersetedCourse}</td>
                  <td>{ele?.intersetedCountry}</td>
                  <td>{ele?.Test}</td>
                  <td>{ele?.Score}</td>
                  <td>{ele?.createdAt}</td>
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

export default CounsellorLeadManager