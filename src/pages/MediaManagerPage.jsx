import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import MediaManager from "../components/MediaManager";

const MediaManagerPage = () => {
  return (
  <>
      <MasterLayout>
        {/* BreadCrumb */}
        <Breadcrumb title="Media Details" />

        {/* Media Manager */}
        <MediaManager/>
      </MasterLayout>
    </>
  )
}

export default MediaManagerPage;