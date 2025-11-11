import React from 'react'
import MasterLayout from '../masterLayout/MasterLayout'
import Breadcrumb from '../components/Breadcrumb'
import AbroadProvince from '../components/AbroadProvince'

const AbroadProvincePage = () => {
  return (
    <>
    <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title='Abroad study - Province'/>

        {/* Province manager */}
        <AbroadProvince/>
    </MasterLayout>
    </>
  )
}

export default AbroadProvincePage