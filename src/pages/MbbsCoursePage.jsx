import React from 'react'
import MasterLayout from '../masterLayout/MasterLayout'
import Breadcrumb from '../components/Breadcrumb'
import MbbsCourseManager from '../components/MbbsCourseManager'

const MbbsCoursePage = () => {
  return (
    <>
    <MasterLayout>
        {/* breadCrumb */}
        <Breadcrumb title="MbbsCourse" />

        {/* MbbsCorse */}
        <MbbsCourseManager/>
    </MasterLayout>
    </>
  )
}

export default MbbsCoursePage