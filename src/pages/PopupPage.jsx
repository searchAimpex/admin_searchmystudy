import React from 'react'
import MasterLayout from '../masterLayout/MasterLayout'
import Breadcrumb from '../components/Breadcrumb'
import CounsellorManager from '../components/TestemonialsManagement'
import PopupManagement from '../components/PopupManagement'

const PopupPage = () => {
  return (
    <>
    {/* Master Layout */}
    <MasterLayout>
        {/* BreadCrumb */}
        <Breadcrumb title='Counsellor Details' />

        {/* CounsellorManager */}
        <PopupManagement/>
        </MasterLayout>
    </>
  )
}

export default PopupPage