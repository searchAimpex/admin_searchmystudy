import React from 'react'
import MasterLayout from '../masterLayout/MasterLayout'
import Breadcrumb from '../components/Breadcrumb'
import AbroadUniversity from '../components/AbroadUniversity'

const AbroadUniversityPage = () => {
  return (
    <>
    <MasterLayout>
        {/* breadcrumb */}
        <Breadcrumb/>

        {/* University manager */}
        <AbroadUniversity/>
    </MasterLayout>
    </>
  )
}

export default AbroadUniversityPage