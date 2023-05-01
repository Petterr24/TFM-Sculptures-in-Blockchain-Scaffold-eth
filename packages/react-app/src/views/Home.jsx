import { useContractReader } from "eth-hooks";
import { Button, Card, DatePicker, Divider, Input, Select, Progress, Slider, Spin, Switch } from "antd";
import { ethers } from "ethers";
import { Link } from "react-router-dom";
import React, { useState } from "react";
import { Address } from "../components";
import axios from 'axios';
const path = require("path");
const fs = require("fs");

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Home({ yourLocalBalance, readContracts }) {
  // Keep track of whether contracts have been deployed
  const [contractsDeployed, setContractsDeployed] = useState(false);
  const [userAuthorisationAddress, setUserAuthorisationAddress] = useState("");
  const [sculptureFactoryAddress, setSculptureFactoryAddress] = useState("");

  const deployContracts = async () => {
    try {
      const response = await axios.post('http://localhost:5000/deploy');
      if (response.status === 200) {
        setContractsDeployed(true);
        setUserAuthorisationAddress(response.data.userAuthorisationAddress);
        setSculptureFactoryAddress(response.data.sculptureFactoryAddress);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeployClick = async () => {
    await deployContracts();
  }

  const provideContractAddresses = () => {
    // Update the contract addresses in the json files
    const sculptureFactoryPath = path.join(__dirname, "../contracts/SculptureFactory.json");
    const sculptureFactoryJson = JSON.parse(fs.readFileSync(sculptureFactoryPath, "utf-8"));
    sculptureFactoryJson.address = sculptureFactoryAddress;
    fs.writeFileSync(sculptureFactoryPath, JSON.stringify(sculptureFactoryJson, null, 2));

    const userAuthorisationPath = path.join(__dirname, "../contracts/UserAuthorisation.json");
    const userAuthorisationJson = JSON.parse(fs.readFileSync(userAuthorisationPath, "utf-8"));
    userAuthorisationJson.address = userAuthorisationAddress;
    fs.writeFileSync(userAuthorisationPath, JSON.stringify(userAuthorisationJson, null, 2));

    alert("Contract addresses updated");
  };

  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 500, margin: "auto", marginTop: 64 }}>
        <Divider />
          <h2 style={{ fontWeight: 'bold', fontSize: '28px' }}>Home</h2>
        <Divider />
        {contractsDeployed ? (
          <>
            <p>UserAuthorisation address: </p>
            <Address value={readContracts.UserAuthorisation.address} />
            <p>SculptureFactory address: </p>
            <Address value={readContracts.SculptureFactory.address} />
          </>
        ) : (
          <Button onClick={handleDeployClick}>Deploy Contracts</Button>
        )}
        <br />
        <br />
        <div style={{ border: "1px solid #cccccc", padding: 16, width: 500, margin: "auto", marginTop: 64 }}>
          <h2 style={{ fontWeight: 'bold', fontSize: '28px' }}>Provide Contract Addresses</h2>
          <p>Enter the addresses of the deployed contracts:</p>
          <div style={{ marginBottom: 16 }}>
            <Input
              placeholder="UserAuthorisation address"
              value={userAuthorisationAddress}
              onChange={(e) => setUserAuthorisationAddress(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <Input
              placeholder="SculptureFactory address"
              value={sculptureFactoryAddress}
              onChange={(e) => setSculptureFactoryAddress(e.target.value)}
            />
          </div>
          <Button onClick={provideContractAddresses}>Submit</Button>
        </div>
      </div>
    </div>
  );
}

export default Home;
