import { Button,Divider, Input, Select } from "antd";
import React, { useState } from "react";
import { utils } from "ethers";

import { Address, Balance, Events } from "../components";

export default function UserAuthorisationUI({
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {

  // Privileges options
  const privileges = [
    { value: null, label: "Select the privilege", disabled: true },
    { value: 0, label: "NONE" },
    { value: 1, label: "USER" },
    { value: 2, label: "ADMIN" },
  ]
  const { Option } = Select;

  // States used to authorise a new user
  const [userAddress, setUserAddress] = useState("");
  const [privilegeLevel, setPrivilegeLevel] = useState(null);
  const [newUserStatus, setNewUserStatus] = useState("");

  // States used to change the privilege of any existing user
  const [existingUserAddress, setExistingUserAddress] = useState("");
  const [newPrivilegeLevel, setNewPrivilegeLevel] = useState(null);
  const [oldPrivilegeLevel, setOldPrivilegeLevel] = useState(null);
  const [newPrivilegeStatus, setNewPrivilegeStatus] = useState("");

  // States used to remove an authorised user
  const [userAddressToRemove, setUserAddressToRemove] = useState("");
  const [removedUserStatus, setRemovedUserStatus] = useState("");

  async function authoriseUser() {
    if (!userAddress || !privilegeLevel) {
      setNewUserStatus("Please enter an address and privilege level");
      return;
    }

    try {
      const transaction = await tx(writeContracts.UserAuthorisation.authoriseUser(userAddress, privilegeLevel));
      await transaction.wait();
      setNewUserStatus("User authorised");
    } catch (err) {
      console.error(err);
      setNewUserStatus("Failed to authorise user");
    }
  }

  async function changeUserPrivilege() {
    if (!existingUserAddress || !oldPrivilegeLevel || !newPrivilegeLevel) {
      setNewPrivilegeStatus("Please enter an address and the privilege levels");
      return;
    }

    try {
      const transaction = await tx(writeContracts.UserAuthorisation.changeUserPrivilege(existingUserAddress, oldPrivilegeLevel, newPrivilegeLevel));
      await transaction.wait();
      setNewPrivilegeStatus("User privilege changed");
    } catch (err) {
      console.error(err);
      setNewPrivilegeStatus("Failed to change user privilege");
    }
  }

  async function removeAuthorisedUser() {
    if (!userAddressToRemove) {
      setRemovedUserStatus("Please enter an address");
      return;
    }

    try {
      const transaction = await tx(writeContracts.UserAuthorisation.removeAuthorisedUser(userAddressToRemove));
      await transaction.wait();
      setRemovedUserStatus("Authorised user removed");
    } catch (err) {
      console.error(err);
      setRemovedUserStatus("Failed to remove an authorised user");
    }
  }

  return (
    <div>
      {/*
        ⚙️ User Authorisation User Interface
      */}
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 500, margin: "auto", marginTop: 64 }}>
        <Divider />
          <h2 style={{ fontWeight: "bold", fontSize: "28px" }}>User Authorisation</h2>
        <Divider />
        <label>SmartContract Address:</label>
        <Address
          address={readContracts && readContracts.UserAuthorisation ? readContracts.UserAuthorisation.address : null}
          ensProvider={mainnetProvider}
          fontSize={16}
        />
        <Divider/>
        {/*
          ⚙️ Section: New User Authorisation
        */}
        <div>
          <label>User Address:</label>
          <Input
              value={userAddress}
              onChange={e => {
                setUserAddress(e.target.value);
              }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginTop: 10 }}>Privilege Level:</label>
          <Select style={{ marginTop: 5 }} value={privilegeLevel} onChange={setPrivilegeLevel}>
            {privileges.map((option) => (
              <Option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
        <Button 
          style={{ marginTop: 10 }}
          onClick={() => {
            authoriseUser();
            setUserAddress("");
            setPrivilegeLevel(null);
          }}>
          Authorise User
        </Button>
        <p style={{ marginTop: 8 }}>Transcation status: {newUserStatus}</p>
        <Divider/>
        {/*
          ⚙️ Section: Change user privilege
        */}
        <div>
          <label>User Address:</label>
          <Input
              value={existingUserAddress}
              onChange={e => {
                setExistingUserAddress(e.target.value);
              }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginTop: 10 }}>Old Privilege Level:</label>
          <Select style={{ marginTop: 5 }} value={oldPrivilegeLevel} onChange={setOldPrivilegeLevel}>
            {privileges.map((option) => (
              <Option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginTop: 10 }}>New Privilege Level:</label>
          <Select style={{ marginTop: 5 }} value={newPrivilegeLevel} onChange={setNewPrivilegeLevel}>
            {privileges.map((option) => (
              <Option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
        <Button 
          style={{ marginTop: 10 }}
          onClick={() => {
            changeUserPrivilege();
            setExistingUserAddress("");
            setOldPrivilegeLevel(null);
            setNewPrivilegeLevel(null);
          }}>
          Change user privilege
        </Button>
        <p style={{ marginTop: 8 }}>Transcation status: {newPrivilegeStatus}</p>
        <Divider/>
        {/*
          ⚙️ Section: Remove authorised user
        */}
        <div>
          <label>User Address:</label>
          <Input
              value={userAddressToRemove}
              onChange={e => {
                setUserAddressToRemove(e.target.value);
              }}
          />
        </div>
        <Button 
          style={{ marginTop: 10 }}
          onClick={() => {
            removeAuthorisedUser();
            setUserAddressToRemove("");
          }}>
          Remove authorised user
        </Button>
        <p style={{ marginTop: 8 }}>Transcation status: {removedUserStatus}</p>
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
        title="Authorised Users"
        contracts={readContracts}
        contractName="UserAuthorisation"
        eventName="UserAuthorised"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      />
      <Events
        title="New User Privilege"
        contracts={readContracts}
        contractName="UserAuthorisation"
        eventName="NewUserPrivilege"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      />
      <Events
        title="Removed User"
        contracts={readContracts}
        contractName="UserAuthorisation"
        eventName="UserRemoved"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      />
    </div>
  );
}
