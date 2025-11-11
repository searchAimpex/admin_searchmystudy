import MasterLayout from '../masterLayout/MasterLayout'
import Breadcrumb from '../components/Breadcrumb'
import MbbsUniversityManager from '../components/MbbsUniversityManager'

const MbbsUniversityPage = () => {
  return (
    <>
    <MasterLayout>
        {/* BreadCrumb */}
        <Breadcrumb title="mbbsUniversity"/>
    {/* university Manager */}
    <MbbsUniversityManager/>
    </MasterLayout>
    </>
  )
}

export default MbbsUniversityPage