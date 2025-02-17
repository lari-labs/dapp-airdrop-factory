import React, { useState, useEffect } from 'react';
import Lottie from 'react-lottie';
import { motion, AnimatePresence } from 'framer-motion';

const CustomCursor = ({ isVisible }) => {
  const [position, setPosition] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const mouseMove = e => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', mouseMove);

    return () => {
      document.removeEventListener('mousemove', mouseMove);
    };
  }, []);

  const cursorVariants = {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.5 },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="pointer-events-none fixed left-0 top-0 z-50"
          style={{
            left: position.x,
            top: position.y,
          }}
          variants={cursorVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              width="48px"
              height="48px"
              viewBox="0 0 24 24"
              style={{ enableBackground: 'new 0 0 512 512' }}
              xmlSpace="preserve"
              className="text-slate-900"
            >
              <defs>
                <linearGradient
                  id="a"
                  x1="11.992"
                  x2="11.992"
                  y1="22.192"
                  y2="1.803"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopOpacity="1" stopColor="#2bdada" offset="0"></stop>
                  <stop stopOpacity="1" stopColor="#008080" offset="1"></stop>
                </linearGradient>
              </defs>
              <g>
                <path
                  fill="url(#a)"
                  d="m21.606 10.789-7.437 3.38-3.38 7.437a1 1 0 0 1-1.844-.055L1.875 3.166a1.007 1.007 0 0 1 1.292-1.291l18.385 7.07a1.006 1.006 0 0 1 .054 1.844z"
                  opacity="1"
                ></path>
              </g>
            </svg>
            <div
              className="pointer-events-none absolute rounded-full"
              style={{
                width: '100px',
                height: '100px',
                background: 'rgba(64, 224, 208, 0.5)',
                filter: 'blur(50px)',
                transform: 'translate(-70%, -100%)',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Box = ({ title, subtitle, animationUrl, animationSize }) => {
  const [animationData, setAnimationData] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    fetch(animationUrl)
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error fetching Lottie animation:', error));
  }, [animationUrl]);

  const defaultOptions = {
    loop: false,
    autoplay: isHovered,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  return (
    <motion.div
      className="flex h-96 cursor-none flex-col items-center justify-center rounded-xl border border-gray-300 bg-[#f6f7fb] p-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{
        scale: 1.05,
        boxShadow: '0 0 15px rgba(56, 178, 172, 0.6)',
        transition: { duration: 0.2 }, // Adjust the transition duration here
      }}
    >
      {animationData && (
        <div
          className="pointer-events-none mb-4"
          style={{ width: animationSize, height: animationSize }}
        >
          <Lottie
            options={{ ...defaultOptions }}
            height={animationSize}
            width={animationSize}
            isStopped={!isHovered}
          />
        </div>
      )}
      <div className="mb-2 mt-4 text-2xl font-bold">{title}</div>
      <div className="text-center text-gray-600">{subtitle}</div>
    </motion.div>
  );
};

const ProjectInfoComponent = () => {
  const [cursorVisible, setCursorVisible] = useState(false);

  const handleMouseEnter = () => {
    setCursorVisible(true);
  };

  const handleMouseLeave = () => {
    setCursorVisible(false);
  };

  const animations = {
    quantum:
      'https://res.cloudinary.com/dl2adjye7/raw/upload/v1717402976/Quantum_ervala.json',
    xray: 'https://res.cloudinary.com/dl2adjye7/raw/upload/v1717403728/x-ray_myb6ze.json',
    webdev:
      'https://res.cloudinary.com/dl2adjye7/raw/upload/v1717403728/webdev_y9c4cb.json',
    faceid:
      'https://res.cloudinary.com/dl2adjye7/raw/upload/v1717403728/wired-lineal-1376-face-id_yfecbq.json',
    data: 'https://res.cloudinary.com/dl2adjye7/raw/upload/v1717403728/ai-data_s0ovjl.json',
  };

  return (
    <div
      className="relative mx-auto max-w-6xl cursor-none p-4"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CustomCursor isVisible={cursorVisible} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
        <Box
          title="AI Innovation"
          subtitle="Pioneering the Future with groundbreaking advancements in artificial intelligence and machine learning technologies."
          animationUrl={animations.data}
          animationSize={180}
        />
        <Box
          title="Quantum Computing"
          subtitle="Revolutionizing Technology with the power of quantum bits and quantum entanglement to solve complex problems."
          animationUrl={animations.quantum}
          animationSize={140}
        />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-3 xl:grid-cols-3">
        <Box
          title="Medical X-Ray"
          subtitle="Innovating medical imaging techniques with advanced X-ray technology for better diagnosis."
          animationUrl={animations.xray}
          animationSize={110}
        />
        <Box
          title="Web Development"
          subtitle="Building the future of the web with cutting-edge technologies and frameworks."
          animationUrl={animations.webdev}
          animationSize={112}
        />
        <Box
          title="Face ID"
          subtitle="Enhancing security with state-of-the-art facial recognition technology."
          animationUrl={animations.faceid}
          animationSize={110}
        />
      </div>
    </div>
  );
};

export default ProjectInfoComponent;
