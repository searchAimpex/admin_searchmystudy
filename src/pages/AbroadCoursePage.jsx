import React from 'react'
import MasterLayout from '../masterLayout/MasterLayout'
import Breadcrumb from '../components/Breadcrumb'
import AbroadCourseManager from '../components/AbroadCourseManager'

const AbroadCoursePage = () => {
  return (
    <>
    <MasterLayout>
        {/* breadcrumb */}
        <Breadcrumb/>

        {/* University manager */}
        <AbroadCourseManager/>
    </MasterLayout>
    </>
  )
}

export default AbroadCoursePage