import React from 'react'
import MasterLayout from '../masterLayout/MasterLayout'
import Breadcrumb from '../components/Breadcrumb'
import WebsitePopupManagement from '../components/WebsitePopupManagement'

const PopupPage = () => {
  return (
    <>
    {/* Master Layout */}
    <MasterLayout>
        {/* BreadCrumb */}
        <Breadcrumb title='Counsellor Details' />

        {/* CounsellorManager */}
        <WebsitePopupManagement/>
        </MasterLayout>
    </>
  )
}

export default PopupPage