import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useState } from "react";
import { utils } from "ethers";
import { SyncOutlined } from "@ant-design/icons";

import { Address, Balance, Events } from "../components";

export default function UserAuthorizationUI({
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {
  const [userAddress, setUserAddress] = useState("");
  const [newPrivilegeLevel, setNewPrivilegeLevel] = useState("");
  const [oldPrivilegeLevel, setOldPrivilegeLevel] = useState("");
  const [newUserStatus, setNewUserStatus] = useState("");
  const [newPrivilegeStatus, setNewPrivilegeStatus] = useState("");

  async function authorizeUser() {
    if (!userAddress || !newPrivilegeLevel) {
      setNewUserStatus("Please enter an address and privilege level");
      return;
    }

    try {
      const transaction = await tx(writeContracts.UserAuthorization.authorizeUser(userAddress, privilegeLevel));
      await transaction.wait();
      setNewUserStatus("User authorized");
    } catch (err) {
      console.error(err);
      setNewUserStatus("Failed to authorize user");
    }
  }

  async function changeUserPrivilege() {
    if (!address || !oldPrivilegeLevel || !newPrivilegeLevel) {
      setNewPrivilegeStatus("Please enter an address and the privilege levels");
      return;
    }

    try {
      const transaction = await await tx(writeContracts.UserAuthorization.changeUserPrivilege(userAddress, oldPrivilegeLevel, newPrivilegeLevel));
      await transaction.wait();
      setNewPrivilegeStatus("User privilege changed");
    } catch (err) {
      console.error(err);
      setStatus("Failed to change user privilege");
    }
  }

  return (
    <div>
      {/*
        ⚙️ User Authorization User Interface
      */}
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <Divider />
        <h2>User Authorization:</h2>
        <Divider />
        <label>SmartContract Address:</label>
        <Address
          address={readContracts && readContracts.UserAuthorization ? readContracts.UserAuthorization.address : null}
          ensProvider={mainnetProvider}
          fontSize={16}
        />
        {/*
          ⚙️ Section: New User Authorization
        */}
        <Divider/>
        <div>
          <label>User Address:</label>
          <Input
              value={userAddress}
              onChange={e => {
                setUserAddress(e.target.value);
              }}
          />
        </div>
        <div>
          <label>Privilege Level:</label>
          <Input
            value={newPrivilegeLevel}
            onChange={e => {
              setNewPrivilegeLevel(e.target.value);
            }}
          />
        </div>
        <Button 
          style={{ marginTop: 8 }}
          onClick={() => {
            authorizeUser();
            setUserAddress("");
            setNewPrivilegeLevel("");
          }}>
          Authorize User
        </Button>
        <p>Transcation status: {newUserStatus}</p>
        {/*
          ⚙️ Section: Change user privilege
        */}
        <Divider/>
        <div>
          <label>User Address:</label>
          <Input
              value={userAddress}
              onChange={e => {
                setUserAddress(e.target.value);
              }}
          />
        </div>
        <div>
          <label>Old Privilege Level:</label>
          <Input
            value={oldPrivilegeLevel}
            onChange={e => {
              setOldPrivilegeLevel(e.target.value);
            }}
          />
        </div>
        <div>
          <label>New Privilege Level:</label>
          <Input
            value={newPrivilegeLevel}
            onChange={e => {
              setNewPrivilegeLevel(e.target.value);
            }}
          />
        </div>
        <Button 
          style={{ marginTop: 8 }}
          onClick={() => {
            changeUserPrivilege();
            setUserAddress("");
            setOldPrivilegeLevel("");
            setNewPrivilegeLevel("");
          }}>
          Change user privilege
        </Button>
        <p>Transcation status: {newPrivilegeStatus}</p>
        <Divider />
        User Address:
        <Address address={address} ensProvider={mainnetProvider} fontSize={16} />
        <Divider />
        {/* use utils.formatEther to display a BigNumber: */}
        <h2>Your Balance: {yourLocalBalance ? utils.formatEther(yourLocalBalance) : "..."}</h2>
        <div>OR</div>
        <Balance address={address} provider={localProvider} price={price} />
      </div>

      {/*
        Events
      */}
      <Events
        title="Authorized Users"
        contracts={readContracts}
        contractName="UserAuthorization"
        eventName="UserAuthorized"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      />
      <Events
        title="New User Privilege"
        contracts={readContracts}
        contractName="UserAuthorization"
        eventName="NewUserPrivilege"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      />
      <Events
        title="Removed User"
        contracts={readContracts}
        contractName="UserAuthorization"
        eventName="UserRemoved"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      />
    </div>
  );
}
