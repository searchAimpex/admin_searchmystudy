import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import png1 from "../assets/profile.png";
import png from "../assets/website-icon.jpg";
import bgImage from "../assets/bg.jpg"; // your background image

const HomePageOne = () => {
  const styles = {
    container: {
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "2rem",
      height: "100vh",
      padding: "20px",
      overflow: "hidden",
    },
    background: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundImage: `url(${bgImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      zIndex: 0,
    },
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)", // black overlay with 50% opacity
      zIndex: 1,
    },
    centerCard: {
      position: "relative",
      zIndex: 2,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      background: "rgba(255, 255, 255, 1)",
      borderRadius: "15px",
      padding: "30px 50px",
      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
      maxWidth: "500px",
      textAlign: "center",
      transition: "transform 0.25s ease, box-shadow 0.25s ease",
    },
    image: {
      width: "600px",
      height: "400px",
      objectFit: "cover",
      marginBottom: "15px",
      // border: "4px solid #eee",
    },
    name: {
      fontSize: "1.5rem",
      color: "transparent",             // text transparent to show gradient
      background: "linear-gradient(90deg, #6a11cb, #2575fc)", // purple-blue gradient
      backgroundClip: "text",
      WebkitBackgroundClip: "text",    // Safari support
      fontWeight: "700",
      textShadow: "1px 1px 2px rgba(0,0,0,0.3)", // subtle shadow for depth
      letterSpacing: "1.5px",
      margin: 0,
    },
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = "translateY(-8px)";
    e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.2)";
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
  };

  return (
    <div style={styles.container}>
      {/* Background Image */}
      <div style={styles.background}></div>
      {/* Black Overlay */}
      <div style={styles.overlay}></div>

      {/* Left Card */}
     <a href="/sign-in">
       <div
        style={styles.centerCard}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img src={png} alt="Profile" style={styles.image} />
        <h4 style={styles.name}>Website Admin</h4>
      </div>
     </a>

      {/* Right Card */}
      <div
        style={styles.centerCard}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img src={png1} alt="Profile" style={styles.image} />
        <h4 style={styles.name}>Frenchise Admin</h4>
      </div>
    </div>
  );
};

export default HomePageOne;
