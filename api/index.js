// server.js
import express from 'express';
import cors from 'cors';
import { merkleTreeObj } from './keys.js';
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory rate limiting variables
let globalRequestCount = 0;
const requestLimit = 5;
const timeWindow = 15000; // 15 seconds

// In-memory cache for storing inclusion proofs
const proofCache = {}; // In the format { publicKey: proofData }

// Reset the request count at the start of each time window
setInterval(() => {
  globalRequestCount = 0;
}, timeWindow);

// Rate limiter middleware function
const rateLimiter = (req, res, next) => {
  if (globalRequestCount >= requestLimit) {
    console.log('Rate limit reached, delaying response');
    setTimeout(next, 3000); // 3-second delay
  } else {
    globalRequestCount++;
    next();
  }
};
const compose =
  (...fns) =>
  initialValue =>
    fns.reduceRight((acc, val) => val(acc), initialValue);

const snd = ([_x, y, ..._z]) => y;
const getHash = ({ hash }) => hash;
const isUndefined = x => x === undefined;
const trace = label => value => {
  console.log(label, '::::', value);
  return value;
};
const isValidCheck = compose(isUndefined, trace('after getHash'), getHash);

// Example endpoint
app.post('/api/verify-eligibility', rateLimiter, (req, res) => {
  const {
    publicKey: { key },
  } = req.body;

  // Check cache first
  if (proofCache[key]) {
    console.log('Returning cached proof for:', key);
    console.group(
      '------------- NESTED LOGGER OPEN:: proofCache[publicKey] -------------',
    );
    console.log('=====================================================');
    console.log('::proofCache', proofCache);
    console.log('----------------------------------------------');
    console.log(':: proofCache[publicKey]', proofCache[key]);
    console.log('=====================================================');
    console.log(
      '---------- NESTED LOGGER CLOSED:: proofCache[publicKey]----------',
    );
    console.groupEnd();
    return res.json({
      message: 'Transaction is valid',
      proof: proofCache[key],
    });
  }

  // Mock check for public key inclusion - replace with actual logic
  const proof = checkInclusion(key);
  console.log('------------------------');
  console.log('proof::', proof);

  if (proof) {
    // Example proof, replace with actual computation logic

    // Store in cache
    proofCache[key] = proof;

    res.json({ message: 'Transaction is valid', proof });
  } else {
    res.status(400).json({ message: 'Public key not eligible' });
  }
});

// Mock function to check if a publicKey exists in the Merkle Tree
function checkInclusion(publicKey) {
  // Replace this with your actual logic to check the Merkle Tree
  return merkleTreeObj.constructProof(publicKey); // Assume all keys are valid for demonstration
}

// Starting the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
