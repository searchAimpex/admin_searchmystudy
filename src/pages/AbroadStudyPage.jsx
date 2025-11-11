import React from 'react'
import MasterLayout from '../masterLayout/MasterLayout'
import Breadcrumb from '../components/Breadcrumb'
import AbroadManager from '../components/AbroadManager'

const AbroadStudyPage = () => {
  return (
   <>
   <MasterLayout>
    {/* BreadCrumb */}
    <Breadcrumb title='Abroad Study' />

    {/* AbroadManager */}
    <AbroadManager/>
   </MasterLayout>
   </>
  )
}

export default AbroadStudyPage