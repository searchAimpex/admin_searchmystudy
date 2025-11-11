import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import VideoManager from "../components/VideoManager";

const VideoManagerPage = () => {
  return (
    <>
      <MasterLayout>
        {/* BreadCrumb */}
        <Breadcrumb title="Video Details" />

        {/* Video MAnager */}
        <VideoManager/>
      </MasterLayout>
    </>
  );
};

export default VideoManagerPage;
