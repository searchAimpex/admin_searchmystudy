import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import QueryManager from "../components/QueryManager";

const QueryPage = () => {
  return (
    <>
      <MasterLayout>
        {/* breadCrumb */}
        <Breadcrumb title="Query" />

        {/* Manager */}
        <QueryManager />
      </MasterLayout>
    </>
  );
};

export default QueryPage;
