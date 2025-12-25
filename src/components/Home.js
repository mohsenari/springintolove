import React from 'react';

const Home = () => {
  return (
    <section id="home" className="section home">
      <div className="hero">
        {/* Placeholder for couple image - replace with actual image */}
        <p className="tagline">Spring Into Love</p>
        <div className="couple-image-container">
          <img
            src={"images/wed.jpg"}
            alt="Bride and Groom"
            className="couple-image"
          />
        </div>
        <p className="detail">The wedding of</p>
        <h1 className="names">Mohsen Ansari <br />&<br /> Emily Elizabeth Smith</h1>

        <div className="wedding-details">
          <p className="detail"><strong>Date:</strong> March 20, 2026 at 4 P.M.</p>
          <p className="detail"><strong>Venue:</strong> The Eglinton Grand</p>
          <a href="https://maps.app.goo.gl/yFKeUseKCx4LwL3dA" >
            <p className="detail">400 Eglinton Ave W, Toronto, ON M5N 1A2</p>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Home;
