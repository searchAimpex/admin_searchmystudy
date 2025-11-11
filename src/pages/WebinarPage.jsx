import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import WebinarManager from "../components/WebinarManager";

const WebinarPage = () => {
  return (
    <>
    {/* masterLayout */}
    <MasterLayout>
    {/* BreadCrumb */}
    <Breadcrumb title='Webinar Details'/>

    {/* WebinarManager */}
    <WebinarManager/>
    </MasterLayout>
    </>
  );
};

export default WebinarPage;
