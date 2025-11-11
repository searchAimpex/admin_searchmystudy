import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import CounselorManager from "../components/CounselorManager";

const CounselorManagerPage = () => {
  return (
    <>
      <MasterLayout>
        <Breadcrumb title="Counselor" />

        {/* Manager */}
        <CounselorManager/>
      </MasterLayout>
    </>
  );
};

export default CounselorManagerPage;
