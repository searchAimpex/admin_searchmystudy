import React from 'react'
import Breadcrumb from "../components/Breadcrumb";
import MasterLayout from '../masterLayout/MasterLayout'
import CounsellorLeadManager from '../components/CounsellorLeadManager';

const CounsellorLeadPage = () => {
  return (
    <>
    <MasterLayout>
        {/* breadCrumb */}
        <Breadcrumb title="Counsellor lead"/>

        {/* Manager */}
        <CounsellorLeadManager/>
    </MasterLayout>
    </>
  )
}

export default CounsellorLeadPage