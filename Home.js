import React, { useEffect, useState } from 'react';


// Array of image URLs
const images = [
    "q.jpg",
    "zz.jpg",
    "li.jpg",
    "ml.jpg",
    
    "z.jpg",
    "oi.jpg",
    "a.jpg",
    "t.jpg",
    "o.jpg",
    "m.jpg"
];

const Home = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setAnimate(true); // Start animation
            setTimeout(() => {
                setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
                setAnimate(false); // Reset animation state
            }, 1000); // Match this duration with your CSS animation duration
        }, 6000); // Change duration for how long each image is displayed

        return () => clearInterval(interval); // Cleanup on component unmount
    }, []);

    return (
        <div 
            className={`home ${animate ? 'fade-out' : 'fade-in'}`} 
            style={{
                backgroundImage: `url(${images[currentIndex]})`,
                backgroundSize: 'cover', // Cover the entire div
                backgroundRepeat: 'no-repeat', // Prevent the image from repeating
                backgroundPosition: 'center', // Center the image
                width: '62vw', // Full viewport width
                height: '100vh', // Full viewport height
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', 
                color: 'white', 
                transition: 'background-image 1s ease-in-out' // Smooth transition for image change
            }}
        >
            <h1>DON'T DREAM IT</h1>
            <h1>JUST</h1>
            <h1>ENJOY TO THE FULLEST</h1>
        </div>
    );
};

export default Home;