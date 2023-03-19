import { Button, Card, DatePicker, Divider, Input, Select, Progress, Slider, Spin, Switch } from "antd";
import React, { useState } from "react";
import { utils } from "ethers";
import { SyncOutlined } from "@ant-design/icons";

import { Address, Balance, Events } from "../components";

export default function SculptureFactoryUI({
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {

  // Categorization label options
  const categorizationLabel = [
    { value: null, label: 'Select the categorization label', disabled: true },
    { value: 0, label: 'NONE' },
    { value: 1, label: 'AUTHORIZED UNIQUE WORK' },
    { value: 2, label: 'AUTHORIZED UNIQUE WORK VARIATION' },
    { value: 3, label: 'AUTHORIZED WORK' },
    { value: 4, label: 'AUTHORIZED MULTIPLE' },
    { value: 5, label: 'AUTHORIZED CAST' },
    { value: 6, label: 'POSTHUMOUS WORK AUTHORIZED BY ARTIST' },
    { value: 7, label: 'NPOSTHUMOUS WORK AUTHORIZED BY RIGHTSHOLDERSONE' },
    { value: 8, label: 'AUTHORIZED REPRODUCTION' },
    { value: 9, label: 'AUTHORIZED EXHIBITION COPY' },
    { value: 10, label: 'AUTHORIZED TECHNICAL COPY' },
    { value: 11, label: 'AUTHORIZED DIGITAL COPY' }
  ]

  // Categorization label options
  const conservationLabel = [
    { value: null, label: 'Select the conservation label', disabled: true },
    { value: 0, label: 'AUTHORIZED RECONSTRUCTION' },
    { value: 1, label: 'AUTHORIZED RESTORATION' },
    { value: 2, label: 'AUTHORIZED EPHEMERAL WORK' }
  ]

  // Conservation options
  const conversationOptions = [
    { value: null, label: 'Select the conservation option', disabled: true },
    { value: false, label: 'NO' },
    { value: true, label: 'YES' },
  ]
  const { Option } = Select;

  // Persisten data
  const [sculptureId, setSculptureId] = useState("");
  const [sculptureName, setSculptureName] = useState("");
  const [artist, setArtist] = useState("");
  const [criticalCatalogNumber, setCriticalCatalogNumber] = useState("");

  // Miscelaneous data
  const [date, setDate] = useState("");
  const [technique, setTechnique] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [location, setLocation] = useState("");
  const [categorizationCategory, setcategorizationCategory] = useState(null);

  // Edition data
  const [edition, setEdition] = useState(0);
  const [editionExecutor, setEditionExecutor] = useState("");
  const [editionNumber, setEditionNumber] = useState(0);

  // Conservation data
  const [isConservation, setIsConservation] = useState(null);
  const [conservationCategory, setConservationCategory] = useState(null);

  // Create Sculpture Status
  const [creationStatus, setCreationStatus] = useState("");

  // Sculpture owner
  const [sculptureOwner, setSculptureOwner] = useState("");

  async function createSculpture() {
    if (!sculptureId) {
      setCreationStatus("Please introduce the Sculpture Id");
      return false;
    }

    if (!sculptureName) {
      setCreationStatus("Please introduce the Sculpture Name");
      return false;
    }

    if (!artist) {
      setCreationStatus("Please introduce the Artist Name");
      return false;
    }

    if (!criticalCatalogNumber) {
      setCreationStatus("Please introduce the critical catalog number");
      return false;
    }

    if (!date) {
      setCreationStatus("Please introduce the Date");
      return false;
    }

    if (!technique) {
      setCreationStatus("Please introduce the Technique");
      return false;
    }

    if (!dimensions) {
      setCreationStatus("Please introduce the Sculpture dimensions");
      return false;
    }

    if (!location) {
      setCreationStatus("Please introduce the Location");
      return false;
    }

    if (categorizationCategory == null) {
      setCreationStatus("Please choose any of the Categorization Labels");
      return false;
    }

    if (isConservation == null) {
      setCreationStatus("Please choose any of the conservation options");
      return false;
    }

    if ((isConservation == true) && (conservationCategory == null)) {
      setCreationStatus("Please choose any of the conservation label");
      return false;
    }

    if (!sculptureOwner) {
      setCreationStatus("Please introduce the Sculpture Owner");
      return false;
    }

    const persistentData = {
      sculptureId,
      sculptureName,
      artist,
      criticalCatalogNumber
    }

    const miscellaneousData = {
      date,
      technique,
      dimensions,
      location,
      categorizationCategory
    }

    const editionData = {
      edition,
      editionExecutor,
      editionNumber 
    }

    const conservationData = {
      isConservation,
      conservationCategory
    }

    try {
      const transaction = await tx(writeContracts.SculptureFactory.createSculpture(persistentData, miscellaneousData, editionData, conservationData, sculptureOwner));
      await transaction.wait();
      setNewUserStatus("Sculpture record created successfully");

      return true;
    } catch (err) {
      console.error(err);
      setNewUserStatus("Failed to create a Sculpture record");

      return false;
    }
  }

  return (
    <div>
      {/*
        ⚙️ Sculpture Factory User Interface
      */}
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <Divider />
        <h2 style={{ fontWeight: 'bold', fontSize: '28px' }}>Sculpture Factory</h2>
        <Divider />
        <label>SmartContract Address:</label>
        <Address
          address={readContracts && readContracts.UserAuthorization ? readContracts.UserAuthorization.address : null}
          ensProvider={mainnetProvider}
          fontSize={16}
        />
        <Divider/>
        {/*
          ⚙️ Section: Create new Sculpture
        */}
        <div>
          <label>Sculpture ID:</label>
          <Input
              value={sculptureId}
              onChange={e => {
                setSculptureId(e.target.value);
              }}
          />
        </div>
        <div>
          <label>Name of the Sculpture:</label>
          <Input
              value={sculptureName}
              onChange={e => {
                setSculptureName(e.target.value);
              }}
          />
        </div>
        <div>
          <label>Artist:</label>
          <Input
              value={artist}
              onChange={e => {
                setArtist(e.target.value);
              }}
          />
        </div>
        <div>
          <label>Critical catalog number:</label>
          <Input
              value={criticalCatalogNumber}
              onChange={e => {
                setCriticalCatalogNumber(e.target.value);
              }}
          />
        </div>
        <div>
          <label>Date:</label>
          <Input
              value={date}
              onChange={e => {
                setDate(e.target.value);
              }}
          />
        </div>
        <div>
          <label>Technique:</label>
          <Input
              value={technique}
              onChange={e => {
                setTechnique(e.target.value);
              }}
          />
        </div>
        <div>
          <label>Dimensions:</label>
          <Input
              value={dimensions}
              onChange={e => {
                setDimensions(e.target.value);
              }}
          />
        </div>
        <div>
          <label>Location:</label>
          <Input
              value={location}
              onChange={e => {
                setLocation(e.target.value);
              }}
          />
        </div>
        <div>
          <label>Owner:</label>
          <Input
              value={sculptureOwner}
              onChange={e => {
                setSculptureOwner(e.target.value);
              }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginTop: 10 }}>Categorization Label:</label>
          <Select style={{ marginTop: 5 }} value={categorizationCategory} onChange={setcategorizationCategory}>
            {categorizationLabel.map((option) => (
              <Option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
        <div>
          <label>Edition:</label>
          <Input
              value={edition}
              onChange={e => {
                setEdition(e.target.value);
              }}
          />
        </div>
        <div>
          <label>Edition Executor:</label>
          <Input
              value={editionExecutor}
              onChange={e => {
                setEditionExecutor(e.target.value);
              }}
          />
        </div>
        <div>
          <label>Edition Number:</label>
          <Input
              value={editionNumber}
              onChange={e => {
                setEditionNumber(e.target.value);
              }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginTop: 10 }}>Conservation:</label>
          <Select style={{ marginTop: 5 }} value={isConservation} onChange={setIsConservation}>
            {conversationOptions.map((option) => (
              <Option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginTop: 10 }}>Conservation Label:</label>
          <Select style={{ marginTop: 5 }} value={conservationCategory} onChange={setConservationCategory}>
            {conservationLabel.map((option) => (
              <Option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
        <Button 
          style={{ marginTop: 10 }}
          onClick={() => {
            if (createSculpture()) {
              setSculptureId("");
              setSculptureName("");
              setArtist("");
              setCriticalCatalogNumber("");
              setDate("");
              setTechnique("");
              setDimensions("");
              setLocation("");
              setcategorizationCategory(null);
              setEdition(0);
              setEditionExecutor("");
              setEditionNumber(0);
              setIsConservation(null);
              setConservationCategory(null);
              setCreationStatus("");
              setSculptureOwner("");
            }
          }}>
          Create Sculpture
        </Button>
        <p style={{ marginTop: 8 }}>Transcation status: {creationStatus}</p>
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
        title="New Sculptures"
        contracts={readContracts}
        contractName="SculptureFactory"
        eventName="SculptureCreated"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      />
      <Events
        title="New Sculpture Addresses"
        contracts={readContracts}
        contractName="SculptureFactory"
        eventName="SculptureAddress"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      />
    </div>
  );
}
