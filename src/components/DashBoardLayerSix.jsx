import UnitCountFive from "./child/UnitCountFive";
import TrafficSourcesOne from "./child/TrafficSourcesOne";
import TopCategoriesOne from "./child/TopCategoriesOne";
import TopInstructorsOne from "./child/TopInstructorsOne";
import StudentProgressOne from "./child/StudentProgressOne";
import CoursesOne from "./child/CoursesOne";
import CourseActivityOne from "./child/CourseActivityOne";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMbbsUniversity } from "../slice/mbbsUniversity";
import { fetchMbbsStudy } from "../slice/MbbsSlice";
import { fetchAbroadStudy } from "../slice/AbroadSlice";
import { websiteLeads } from "../slice/contachUsLead";
import { fetchWebinar } from "../slice/webinarSlice";
import { fetchCounsellorLead } from "../slice/counsellorLead";
import { fetchMbbsCourse } from "../slice/MbbsCourse";
import { fetchAbroadCourse } from "../slice/AbroadCourseSlice";
import { fetchAbroadUniversity } from "../slice/AbroadUniversitySlice";

const DashBoardLayerSix = () => {
  const dispatch = useDispatch();
  const data = useSelector(state => state)
  const overseaseCountry = useSelector(state => state?.abroadStudy?.studyAbroad )
  const mbbsCountry = useSelector(state => state?.mbbsStudy?.studyMbbs)
  const mbbsUniversity = useSelector(state => state?.mbbsUniversity?.mbbsUniversity)
  const abroadUniversity = useSelector(state => state?.abroadUniversity?.abroadUniversity)
  const contactUsLead = useSelector(state => state?.contactUsLead?.websiteLead?.contact)
  const query = useSelector(state => state?.contactUsLead?.websiteLead?.query) 
  const course = useSelector(state => state?.mbbsCourse?.mbbsCourse)
  const OverseaseCourse = useSelector(state => state?.abroadCourse?.AbroadCourses)
  const counsellorLead = useSelector(state => state?.counsellorLead)
console.log(data, 'dashboar data ------------------');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dispatch(fetchMbbsStudy());
        const res1 = await dispatch(fetchAbroadStudy());
        const uni = await dispatch(fetchMbbsUniversity());
        const uniAbroad = await dispatch(fetchAbroadUniversity());
        const uni1 = await dispatch(fetchAbroadStudy());
        const lead = await dispatch(websiteLeads());
        const counselor = await dispatch(fetchCounsellorLead());
        const webinar = await dispatch(fetchWebinar());
        const Mbbscourse = await dispatch(fetchMbbsCourse());
        const overseaseCourse = await dispatch(fetchAbroadCourse());
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData()
  }, [])

  return (
    <>
      <div className='row gy-4 mb-24'>
        {/* UnitCountFive */}
        <UnitCountFive abroadUniversity={abroadUniversity} mbbsUniversity={mbbsUniversity} overseaseCountry={overseaseCountry} mbbsCountry={mbbsCountry} counsellorLead={counsellorLead} />

        {/* TrafficSourcesOne */}
        {/* <TrafficSourcesOne /> */}

        {/* TopCategoriesOne */}
        <TopCategoriesOne OverseaseCourse={OverseaseCourse}/>

        {/* TopInstructorsOne */}
        <TopInstructorsOne Mbbscourse={course} />

        {/* StudentProgressOne */}
        <StudentProgressOne mbbsCountry={mbbsCountry}/>

        {/* CoursesOne */}
       <CoursesOne contactUsLead={contactUsLead} query={query} />

        {/* CourseActivityOne */}
        {/* <CourseActivityOne /> */}
      </div>
    </>
  );
};

export default DashBoardLayerSix;
