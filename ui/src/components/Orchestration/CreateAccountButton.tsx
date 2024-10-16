const CreateAccountButton = ({
  handleCreateAccount,
  loadingCreateAccount,
}) => (
    <button
      className={`bg-teal-500 text-white rounded text-lg p-4 text-white rounded shadow-md ${loadingCreateAccount ? 'bg-gray-600' : 'bg-blue-500'}`}
      onClick={handleCreateAccount}
      disabled={loadingCreateAccount}
    >        
          Claim Airdrop  
    </button>
);

export default CreateAccountButton;
