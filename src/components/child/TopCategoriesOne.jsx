import { Icon } from "@iconify/react/dist/iconify.js";

import { Link } from "react-router-dom";

const TopCategoriesOne = ({ OverseaseCourse }) => {
  // console.log(OverseaseCourse);

  return (
    <div className='col-xxl-4 col-md-6'>
      <div className='card'>
        <div className='card-header'>
          <div className='d-flex align-items-center flex-wrap gap-2 justify-content-between'>
            <h6 className='mb-2 fw-bold text-lg mb-0'>Abroad Courses: </h6>
            
            <Link
              to='#'
              className='text-primary-600 hover-text-primary d-flex align-items-center gap-1'
            >
              View All
              <Icon icon='solar:alt-arrow-right-linear' className='icon' />
            </Link>
          </div>
            <span className='text-sm text-secondary-light fw-normal'>
                      Total Courses : {OverseaseCourse?.length}
                    </span>
        </div>
        {
          OverseaseCourse.slice(0, 5).map((ele, index) => (
            <div className='card-body' key={ele._id}>
              <div className='d-flex align-items-center justify-content-between gap-3 mb-24'>
                <div className='d-flex align-items-center gap-12'>
                  <div className='w-40-px h-40-px radius-8 flex-shrink-0 bg-info-50 d-flex justify-content-center align-items-center'>
                    <img
                      src='assets/images/home-six/category-icon1.png'
                      alt='WowDash React Vite'
                      className=''
                    />
                  </div>
                  <div className='flex-grow-1'>
                    <h6 className='text-md mb-0 fw-normal'>{ele?.ProgramName}</h6>
                    <span className='text-sm text-secondary-light fw-normal'>
                      Fees : {ele?.completeFees?.amount} {ele?.completeFees?.currency}
                    </span>
                  </div>
                </div>
                {/* <Link
                  href='#'
                  className='w-24-px h-24-px bg-primary-50 text-primary-600 d-flex justify-content-center align-items-center text-lg bg-hover-primary-100 radius-4'
                >
                  <i className='ri-arrow-right-s-line' />
                </Link> */}
              </div>

            </div>))
        }
      </div>
    </div>
  );
};

export default TopCategoriesOne;
