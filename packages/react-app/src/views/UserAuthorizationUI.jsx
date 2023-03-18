import { Button, Card, DatePicker, Divider, Input, Select, Progress, Slider, Spin, Switch } from "antd";
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

  // Privileges options
  const privileges = [
    { value: null, label: 'Select the privilege', disabled: true },
    { value: 0, label: 'NONE' },
    { value: 1, label: 'USER' },
    { value: 2, label: 'ADMIN' },
  ]
  const { Option } = Select;

  // States used to authorize a new user
  const [userAddress, setUserAddress] = useState("");
  const [privilegeLevel, setPrivilegeLevel] = useState(null);
  const [newUserStatus, setNewUserStatus] = useState("");

  // States used to change the privilege of any existing user
  const [existingUserAddress, setExistingUserAddress] = useState("");
  const [newPrivilegeLevel, setNewPrivilegeLevel] = useState(null);
  const [oldPrivilegeLevel, setOldPrivilegeLevel] = useState(null);
  const [newPrivilegeStatus, setNewPrivilegeStatus] = useState("");

  // States used to remove an authorized user
  const [userAddressToRemove, setUserAddressToRemove] = useState("");
  const [removedUserStatus, setRemovedUserStatus] = useState("");

  async function authorizeUser() {
    if (!userAddress || !privilegeLevel) {
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
    if (!existingUserAddress || !oldPrivilegeLevel || !newPrivilegeLevel) {
      setNewPrivilegeStatus("Please enter an address and the privilege levels");
      return;
    }

    try {
      const transaction = await tx(writeContracts.UserAuthorization.changeUserPrivilege(existingUserAddress, oldPrivilegeLevel, newPrivilegeLevel));
      await transaction.wait();
      setNewPrivilegeStatus("User privilege changed");
    } catch (err) {
      console.error(err);
      setNewPrivilegeStatus("Failed to change user privilege");
    }
  }

  async function removeAuthorizedUser() {
    if (!userAddressToRemove) {
      setRemovedUserStatus("Please enter an address");
      return;
    }

    try {
      const transaction = await tx(writeContracts.UserAuthorization.removeAuthorizedUser(userAddressToRemove));
      await transaction.wait();
      setRemovedUserStatus("Authorized user removed");
    } catch (err) {
      console.error(err);
      setRemovedUserStatus("Failed to remove an authorized user");
    }
  }

  return (
    <div>
      {/*
        ⚙️ User Authorization User Interface
      */}
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <Divider />
        <h2>User Authorization</h2>
        <Divider />
        <label>SmartContract Address:</label>
        <Address
          address={readContracts && readContracts.UserAuthorization ? readContracts.UserAuthorization.address : null}
          ensProvider={mainnetProvider}
          fontSize={16}
        />
        <Divider/>
        {/*
          ⚙️ Section: New User Authorization
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
        <div>
          <label>Privilege Level:</label>
          <Select value={privilegeLevel} onChange={setPrivilegeLevel}>
            {privileges.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
        <Button 
          style={{ marginTop: 8 }}
          onClick={() => {
            authorizeUser();
            setUserAddress("");
            setPrivilegeLevel(null);
          }}>
          Authorize User
        </Button>
        <p>Transcation status: {newUserStatus}</p>
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
        <div>
          <label>Old Privilege Level:</label>
          <Select value={oldPrivilegeLevel} onChange={setOldPrivilegeLevel}>
            {privileges.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
        <div>
          <label>New Privilege Level:</label>
          <Select value={newPrivilegeLevel} onChange={setNewPrivilegeLevel}>
            {privileges.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
        <Button 
          style={{ marginTop: 8 }}
          onClick={() => {
            changeUserPrivilege();
            setExistingUserAddress("");
            setOldPrivilegeLevel(null);
            setNewPrivilegeLevel(null);
          }}>
          Change user privilege
        </Button>
        <p>Transcation status: {newPrivilegeStatus}</p>
        <Divider/>
        {/*
          ⚙️ Section: Remove authorized user
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
          style={{ marginTop: 8 }}
          onClick={() => {
            removeAuthorizedUser();
            setUserAddressToRemove("");
          }}>
          Remove authorized user
        </Button>
        <p>Transcation status: {removedUserStatus}</p>
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
