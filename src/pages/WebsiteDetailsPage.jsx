import React from 'react'
import Breadcrumb from "../components/Breadcrumb";
import MasterLayout from '../masterLayout/MasterLayout'
import WebsiteDetailsManager from '../components/WebsiteDetailsManager';

const WebsiteDetailsPage = () => {
  return (
    <>
    <MasterLayout>
        {/* breadCrumb */}
        <Breadcrumb title="Counsellor lead"/>

        {/* Manager */}
        <WebsiteDetailsManager/>
    </MasterLayout>
    </>
  )
}

export default WebsiteDetailsPage