import React, { useState } from 'react';
import { clsx as classNames } from 'clsx';

const REQUEST_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

const EligibilityChecker = () => {
  const [requestState, setRequestState] = useState(REQUEST_STATES.IDLE);
  const [errorMessage, setErrorMessage] = useState('');
  const [eligibilityData, setEligibilityData] = useState(null);
  const [publicKey, setPublicKey] = useState('');

  const checkEligibility = async () => {
    setRequestState(REQUEST_STATES.LOADING);
    setErrorMessage('');

    try {
      const response = await fetch(
        'http://localhost:3000/api/verify-eligibility',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ publicKey: { key: publicKey } }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setEligibilityData(data);
        setRequestState(REQUEST_STATES.SUCCESS);
      } else {
        setErrorMessage(data.message || 'Eligibility check failed');
        setRequestState(REQUEST_STATES.ERROR);
      }
    } catch (error) {
      setErrorMessage('Network error occurred. Please try again.');
      setRequestState(REQUEST_STATES.ERROR);
    }
  };

  const buttonClasses = classNames(
    'px-4 py-2 rounded-md font-medium transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    {
      'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white':
        requestState === REQUEST_STATES.IDLE,
      'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white':
        requestState === REQUEST_STATES.SUCCESS,
      'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white':
        requestState === REQUEST_STATES.ERROR,
    },
  );

  const renderContent = () => {
    switch (requestState) {
      case REQUEST_STATES.IDLE:
        return (
          <div className="space-y-4">
            <input
              type="text"
              value={publicKey}
              onChange={e => setPublicKey(e.target.value)}
              placeholder="Enter public key"
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={checkEligibility} className={buttonClasses}>
              Check Eligibility
            </button>
          </div>
        );

      case REQUEST_STATES.LOADING:
        return (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="text-gray-600">Checking eligibility...</p>
          </div>
        );

      case REQUEST_STATES.SUCCESS:
        return (
          <div
            className={classNames(
              'space-y-4 rounded-lg p-6',
              'border border-green-200 bg-green-50',
            )}
          >
            <h3 className="text-lg font-semibold text-green-800">
              Eligibility Check Successful!
            </h3>
            <div className="overflow-auto rounded-md bg-white p-4">
              <pre className="text-sm text-gray-700">
                {JSON.stringify(eligibilityData, null, 2)}
              </pre>
            </div>
            <button
              onClick={() => setRequestState(REQUEST_STATES.IDLE)}
              className={buttonClasses}
            >
              Check Another
            </button>
          </div>
        );

      case REQUEST_STATES.ERROR:
        return (
          <div
            className={classNames(
              'space-y-4 rounded-lg p-6',
              'border border-red-200 bg-red-50',
            )}
          >
            <h3 className="text-lg font-semibold text-red-800">
              Error Occurred
            </h3>
            <p className="text-red-600">{errorMessage}</p>
            <button
              onClick={() => setRequestState(REQUEST_STATES.IDLE)}
              className={buttonClasses}
            >
              Try Again
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        Eligibility Checker
      </h2>
      <div className="rounded-lg bg-white p-6 shadow-md">{renderContent()}</div>
    </div>
  );
};

export default EligibilityChecker;
