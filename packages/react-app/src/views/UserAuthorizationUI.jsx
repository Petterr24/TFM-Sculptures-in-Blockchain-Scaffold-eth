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
  const [privilegeLevel, setPrivilegeLevel] = useState("");
  const [status, setStatus] = useState("");

  async function authorizeUser() {
    if (!userAddress || !privilegeLevel) {
      setStatus("Please enter an address and privilege level");
      return;
    }

    try {
      const transaction = await tx(writeContracts.UserAuthorization.authorizeUser(userAddress, privilegeLevel));
      await transaction.wait();
      setStatus("User authorized");
    } catch (err) {
      console.error(err);
      setStatus("Failed to authorize user");
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
        Address:
        <Address
          address={readContracts && readContracts.UserAuthorization ? readContracts.UserAuthorization.address : null}
          ensProvider={mainnetProvider}
          fontSize={16}
        />
        <Divider />v
        <div>
        <label>User Address:</label>
        <input
          type="text"
          value={userAddress}
          onChange={(e) => setUserAddress(e.target.value)}
        />
        </div>
        <div>
          <label>Privilege Level:</label>
          <input
            type="text"
            value={privilegeLevel}
            onChange={(e) => setPrivilegeLevel(e.target.value)}
          />
        </div>
        <button onClick={authorizeUser}>Authorize User</button>
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
        contracts={readContracts}
        contractName="UserAuthorization"
        eventName="UserAuthorized"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      />
      <Events
        contracts={readContracts}
        contractName="UserAuthorization"
        eventName="NewUserPrivilege"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      />
      <Events
        contracts={readContracts}
        contractName="UserAuthorization"
        eventName="UserRemoved"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      />
      <p>{status}</p>
    </div>
  );
}
