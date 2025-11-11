import React from 'react'
import MasterLayout from '../masterLayout/MasterLayout'
import Breadcrumb from '../components/Breadcrumb'
import CounsellorManager from '../components/TestemonialsManagement'

const CounsellorPage = () => {
  return (
    <>
    {/* Master Layout */}
    <MasterLayout>
        {/* BreadCrumb */}
        <Breadcrumb title='Counsellor Details' />

        {/* CounsellorManager */}
        <CounsellorManager/>
        </MasterLayout>
    </>
  )
}

export default CounsellorPage