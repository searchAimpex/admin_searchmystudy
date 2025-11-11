import { Icon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";

import { Link } from "react-router-dom";

const CoursesOne = ({ query, contactUsLead }) => {
  const [leads, setleads] = useState([...query || [],...contactUsLead || []]);
  // console.log(leads, "++++++++++++++++++++++++++++")
  return (
    <div className='col-xxl-8'>
      <div className='card h-100'>
        <div className='card-header'>
          <div className='d-flex align-items-center flex-wrap gap-2 justify-content-between'>
            <h6 className='mb-2 fw-bold text-lg mb-0'>Courses</h6>
            <Link
              to='#'
              className='text-primary-600 hover-text-primary d-flex align-items-center gap-1'
            >
              View All
              <Icon icon='solar:alt-arrow-right-linear' className='icon' />
            </Link>
          </div>
        </div>
        <div className='card-body p-24'>
          <div className='table-responsive scroll-sm'>
            <table className='table bordered-table mb-0'>
              <thead>
                <tr>
                  <th scope='col'>Name</th>
                  <th scope='col'>Phone No </th>
                  <th scope='col'>occupation</th>
                  <th scope='col'>Comment</th>
                  <th scope='col'>CreatedAt </th>
                </tr>
              </thead>
              <tbody>
                {
                  leads?.map((ele, i) => (
                    <tr>
                      <td>
                        <span className='text-secondary-light'>{ele.name}</span>
                      </td>
                      <td>
                        <span className='text-secondary-light'>
                          {ele.phoneNo || ele.phone}
                        </span>
                      </td>
                      <td>
                        <div className='text-secondary-light'>
                          <h6 className='text-md mb-0 fw-normal'>
                         {ele.occupation || "---"}
                          </h6>
                        
                        </div>
                      </td>
                      <td>
                        <span className='text-secondary-light'>{ele?.comment || ele.message}</span>
                      </td>
                      <td>
                       <span className="text-secondary-light">
  {ele?.createdAt
    ? `${new Date(ele.createdAt).getDate()}-${new Date(ele.createdAt).getMonth() + 1}-${new Date(ele.createdAt).getFullYear()}`
    : ""}
</span>

                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesOne;
