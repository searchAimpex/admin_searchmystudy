import { Icon } from "@iconify/react/dist/iconify.js";

import { Link } from "react-router-dom";

const TopInstructorsOne = ({Mbbscourse}) => {
  console.log(Mbbscourse,">>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
  return (
    <div className='col-xxl-4 col-md-6'>
      <div className='card'>
        <div className='card-header'>
          <div className='d-flex align-items-center flex-wrap gap-2 justify-content-between'>
            <h6 className='mb-2 fw-bold text-lg mb-0'>MBBS Courses</h6>
            <Link
              to='#'
              className='text-primary-600 hover-text-primary d-flex align-items-center gap-1'
            >
              View All
              <Icon icon='solar:alt-arrow-right-linear' className='icon' />
            </Link>
          </div>
            <span className='text-sm text-secondary-light fw-medium'>
                  Total Courses: {Mbbscourse?.length}
                </span>

        </div>
        <div className='card-body'>
          
         {
          Mbbscourse?.slice(0,5).map((ele, index)=>(
          <div className='d-flex align-items-center justify-content-between gap-3 mb-24'>
            <div className='d-flex align-items-center'>
              <img
                src='assets/images/users/user1.png'
                alt='WowDash React Vite'
                className='w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden'
              />
              <div className='flex-grow-1'>
                <h6 className='text-md mb-0 fw-medium'>{ele?.ProgramName}</h6>
                <span className='text-sm text-secondary-light fw-medium'>
                  Agent ID: {ele?.completeFees?.amount} {ele?.completeFees?.currency}
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

export default TopInstructorsOne;
