import React from 'react'
import MasterLayout from '../masterLayout/MasterLayout'
import Breadcrumb from "../components/Breadcrumb";
import ContactUsLeadManager from '../components/ContactUsLeadManager'
import CounselorSingleLead from '../components/CounselorSingleLead';
import { useParams } from 'react-router-dom';

const CounselorSingleLeadManager = (  ) => {

  
  return (
    <>
    <MasterLayout>
        {/* breadCrumb */}
        <Breadcrumb title='Counsellor lead' />

        {/* Manager */}
        <CounselorSingleLead/>
    </MasterLayout>
    </>
  )
}

export default CounselorSingleLeadManager