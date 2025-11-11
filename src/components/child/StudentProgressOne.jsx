import { Icon } from "@iconify/react/dist/iconify.js";

import { Link } from "react-router-dom";

const StudentProgressOne = ({mbbsCountry}) => {
  console.log(mbbsCountry);
  
  return (
    <div className='col-xxl-4 col-md-6'>
      <div className='card'>
        <div className='card-header'>
          <div className='d-flex align-items-center flex-wrap gap-2 justify-content-between'>
            <h6 className='mb-2 fw-bold text-lg mb-0'>Total Countries</h6>
            <Link
              to='#'
              className='text-primary-600 hover-text-primary d-flex align-items-center gap-1'
            >
              View All
              <Icon icon='solar:alt-arrow-right-linear' className='icon' />
            </Link>
          </div>
        </div>
        <div className='card-body'>
           
          {
            mbbsCountry?.slice(0,6).map((ele, index)=>(
              <div className='d-flex align-items-center justify-content-between gap-3 mb-24'>
               <div className='d-flex align-items-center'>
              <img
                src={ele?.flagURL}
                alt='WowDash React Vite'
                className='w-40-px h-40-px radius-8 flex-shrink-0 me-12 overflow-hidden'
              />
              <div className='flex-grow-1'>
                <h6 className='text-md mb-0 fw-medium'>{ele?.name}</h6>
                <span className='text-sm text-secondary-light fw-medium'>
                  {(() => {
    const date = new Date(ele?.createdAt);
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  })()}
                </span>
              </div>
            </div>
          </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default StudentProgressOne;
