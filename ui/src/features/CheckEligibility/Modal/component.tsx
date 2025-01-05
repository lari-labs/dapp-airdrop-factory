import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Modal = ({ isOpen, onClose, inclusionProof, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.div
        className="modal-content"
        initial={{ opacity: 0, y: '-100vh' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '-100vh' }}
        transition={{ duration: 0.5 }}
        onClick={e => e.stopPropagation()} // Prevent click from closing modal
      >
        <button onClick={onClose} className="close-btn">
          X
        </button>
        {isLoading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="result">
            {inclusionProof
              ? 'You are eligible for the airdrop!'
              : 'You are not eligible for the airdrop.'}
          </div>
        )}
      </motion.div>
    </div>
  );
};

const App = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [inclusionProof, setInclusionProof] = useState(null);

  const fetchAirdropEligibility = async () => {
    setLoading(true);
    // Simulate API call
    try {
      const response = await fetch('http://localhost:3000/api/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicKey: 'your-public-key-here' }),
      });

      const data = await response.json();
      setInclusionProof(data.proof);
    } catch (error) {
      console.error('Error fetching airdrop eligibility', error);
    } finally {
      setLoading(false);
      setModalOpen(true);
    }
  };

  return (
    <div className="App">
      <button onClick={fetchAirdropEligibility}>
        Check Airdrop Eligibility
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        isLoading={isLoading}
        inclusionProof={inclusionProof}
      />
    </div>
  );
};

export default App;
