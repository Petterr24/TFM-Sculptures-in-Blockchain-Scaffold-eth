import React, { useState } from 'react';
import axios from 'axios';

function HomePage() {
  const [userAuthAddress, setUserAuthAddress] = useState('');
  const [sculptureFactoryAddress, setSculptureFactoryAddress] = useState('');

  const handleProvideContractAddresses = async (event) => {
    event.preventDefault();
    if (!userAuthAddress || !sculptureFactoryAddress) {
      alert('Please enter valid contract addresses');
      return;
    }

    const isValidUserAuthAddress = /^0x[a-fA-F0-9]{40}$/i.test(userAuthAddress);
    const isValidSculptureFactoryAddress = /^0x[a-fA-F0-9]{40}$/i.test(sculptureFactoryAddress);
    if (!isValidUserAuthAddress || !isValidSculptureFactoryAddress) {
      alert('Please enter valid contract addresses');
      return;
    }

    try {
      await axios.post('/provideContractAddresses', {
        UserAuthorisationAddress: userAuthAddress,
        SculptureFactoryAddress: sculptureFactoryAddress,
      });
      console.log('Contract addresses updated successfully');
    } catch (error) {
      console.error(error);
    }
  };

  const handleStartLocalChain = async (event) => {
    event.preventDefault();
    try {
      await axios.post('/startLocalChain');
      console.log('Local chain started successfully');
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeploySmartContracts = async (event) => {
    event.preventDefault();
    try {
      await axios.post('/deploy');
      console.log('Smart contracts deployed successfully');
    } catch (error) {
      console.error(error);
    }
  };

  const handleStartUI = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.get('/hardhatContractExist');
      if (!response.data) {
        alert('Smart Contracts are not deployed to run Scaffold UI. Please first deploy the SCs');
        return;
      }
      await axios.post('/startUI');
      console.log('SCs UI started successfully');
    } catch (error) {
      console.error(error);
    }
  };
  

  return (
    <div>
      <h1>Sculptures in Blockchain</h1>
      <form onSubmit={handleProvideContractAddresses}>
        <label htmlFor="userAuthAddress">User Authorisation Contract Address:</label>
        <input
          type="text"
          id="userAuthAddress"
          name="userAuthAddress"
          onChange={(event) => setUserAuthAddress(event.target.value)}
          required
        />

        <label htmlFor="sculptureFactoryAddress">Sculpture Factory Contract Address:</label>
        <input
          type="text"
          id="sculptureFactoryAddress"
          name="sculptureFactoryAddress"
          onChange={(event) => setSculptureFactoryAddress(event.target.value)}
          required
        />

        <button type="submit">Update Contract Addresses</button>
      </form>

      <button onClick={handleStartLocalChain}>Start Local Chain</button>

      <button onClick={handleDeploySmartContracts}>Deploy Smart Contracts</button>

      <button onClick={handleStartUI}>Start SCs UI</button>
    </div>
  );
}

export default HomePage;
