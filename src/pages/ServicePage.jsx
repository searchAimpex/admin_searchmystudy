import Breadcrumb from "../components/Breadcrumb"
import ServiceManager from "../components/ServiceManager"
import MasterLayout from "../masterLayout/MasterLayout"

const ServicePage = () => {
  return (
    <>
    {/* Master layout */}
    <MasterLayout>
{/* Breadcrumb */}
<Breadcrumb title='Our Services'/>

{/* Service manager */}
<ServiceManager/>
    </MasterLayout>
    </>
  )
}

export default ServicePage