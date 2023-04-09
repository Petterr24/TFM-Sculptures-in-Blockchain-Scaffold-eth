import { Button, Card, DatePicker, Divider, Input, Select, Progress, Slider, Spin, Switch } from "antd";
import React, { useState } from "react";
import { utils } from "ethers";
import { SyncOutlined } from "@ant-design/icons";

import { Address, Balance, Events } from "../components";

export default function SculptureUI({
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
  sculptureRecords,
}) {

  // Offsets to identify each dataset from those obtained from the Sculpture Record
  const PERSISTENT_DATA = 0;
  const MISCELLANEOUS_DATA = 1;
  const EDITION_DATA = 2;
  const CONSERVATION_DATA = 2;

  //Offsets to identify each field in each dataset
  const PERSISTENT_SCULPTURE_NAME = 0;
  const PERSISTENT_ARTIST = 1;
  const PERSISTENT_CRITICAL_CATALOG_NUMBER = 2;
  const MISC_DATE = 0;
  const MISC_TECHNIQUE = 1;
  const MISC_DIMENSIONS = 2;
  const MISC_LOCATION = 3;
  const MISC_CATEGORIZATION_LABEL = 4;
  const EDITION_EDITION = 0;
  const EDITION_EDITION_EXECUTOR = 1;
  const EDITION_EDITION_NUMBER = 2;
  const CONSV_CONSERVATION = 0;
  const CONSV_CONSERVATION_LABEL = 1;

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

  // Sculpture address
  const [sculptureAddress, setSculptureAddress] = useState("");
  // Verified Sculpture address
  const [verifiedSculptureAddress, setVerifiedSculptureAddress] = useState("");

  // Get Sculpture Data Status
  const [getDataStatus, setGetDataStatus] = useState("");

  // Persisten data
  const [sculptureName, setSculptureName] = useState("");
  const [artist, setArtist] = useState("");
  const [criticalCatalogNumber, setCriticalCatalogNumber] = useState("");

  // Miscelaneous data
  const [date, setDate] = useState("");
  const [technique, setTechnique] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [location, setLocation] = useState("");
  const [categorizationCategory, setCategorizationCategory] = useState(null);

  // Edition data
  const [edition, setEdition] = useState(0);
  const [editionExecutor, setEditionExecutor] = useState("");
  const [editionNumber, setEditionNumber] = useState(0);

  // Conservation data
  const [isConservation, setIsConservation] = useState(null);
  const [conservationCategory, setConservationCategory] = useState(null);

  // Sculpture owner
  const [sculptureOwner, setSculptureOwner] = useState("");

  // Update Sculpture Status
  const [updateDataStatus, setUpdateDataStatus] = useState("");

  async function updateSculpture() {
    if (!date) {
      setUpdateDataStatus("Please introduce the Date");
      return false;
    }

    if (!technique) {
      setUpdateDataStatus("Please introduce the Technique");
      return false;
    }

    if (!dimensions) {
      setUpdateDataStatus("Please introduce the Sculpture dimensions");
      return false;
    }

    if (!location) {
      setUpdateDataStatus("Please introduce the Location");
      return false;
    }

    if (categorizationCategory == null) {
      setUpdateDataStatus("Please choose any of the Categorization Labels");
      return false;
    }

    if (isConservation == null) {
      setUpdateDataStatus("Please choose any of the conservation options");
      return false;
    }

    if ((isConservation == true) && (conservationCategory == null)) {
      setUpdateDataStatus("Please choose any of the conservation label");
      return false;
    }

    if (!sculptureOwner) {
      setUpdateDataStatus("Please introduce the Sculpture Owner");
      return false;
    }

    try {
      const transaction = await tx(writeContracts.Sculpture.updateSculpture(
        date,
        technique,
        dimensions,
        location,
        categorizationCategory,
        edition,
        editionExecutor,
        editionNumber,
        sculptureOwner));

      await transaction.wait();
      setUpdateDataStatus("Sculpture record updated successfully");

      return true;
    } catch (err) {
      console.error(err);
      setUpdateDataStatus("Failed to updated a Sculpture record");

      return false;
    }
  }

  async function getSculptureData() {
    const sculptureRecordsAddresses = await tx(readContracts.SculptureFactory.getSculptures());

    for (let i = 0; i < sculptureRecordsAddresses.length; i++) {
      if (sculptureRecordsAddresses[i] === sculptureAddress) {
        for (const contractName in sculptureRecords) {
          const contractInstance = sculptureRecords[contractName];
          if (contractInstance && contractInstance.address === sculptureAddress) {
            setVerifiedSculptureAddress(sculptureAddress);
            const data = await tx(contractInstance.getSculptureData());

            // Update the state variables with the parsed data
            setSculptureName(data[PERSISTENT_DATA][PERSISTENT_SCULPTURE_NAME]);
            setArtist(data[PERSISTENT_DATA][PERSISTENT_ARTIST]);
            setCriticalCatalogNumber(data[PERSISTENT_DATA][PERSISTENT_CRITICAL_CATALOG_NUMBER]);
            setDate(data[MISCELLANEOUS_DATA][MISC_DATE]);
            setTechnique(data[MISCELLANEOUS_DATA][MISC_TECHNIQUE]);
            setDimensions(data[MISCELLANEOUS_DATA][MISC_DIMENSIONS]);
            setLocation(data[MISCELLANEOUS_DATA][MISC_LOCATION]);
            setCategorizationCategory(data[MISCELLANEOUS_DATA][MISC_CATEGORIZATION_LABEL]);
            setEdition(data[EDITION_DATA][EDITION_EDITION]);
            setEditionExecutor(data[EDITION_DATA][EDITION_EDITION_EXECUTOR]);
            setEditionNumber(data[EDITION_DATA][EDITION_EDITION_NUMBER]);
            setIsConservation(data[CONSERVATION_DATA][CONSV_CONSERVATION]);
            setConservationCategory(data[CONSERVATION_DATA][CONSV_CONSERVATION_LABEL]);

            setGetDataStatus("Sculpture Data recovered successfully!");

            return true;
          }
        }
      }
    }

    setGetDataStatus("The provided Sculpture address does not exist!");

    return false;
  }

  return (
    <div>
      {/*
        ⚙️ Sculpture User Interface
      */}
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <Divider />
        <h2 style={{ fontWeight: 'bold', fontSize: '28px' }}>Sculpture</h2>
        <Divider />
        <label>SmartContract Address:</label>
        <Address
          address={verifiedSculptureAddress}
          ensProvider={mainnetProvider}
          fontSize={16}
        />
        <Divider/>
        {/*
          ⚙️ Section: To look for the Sculpture record
        */}
        <div>
          <label>Sculpture Address:</label>
          <Input
              value={sculptureAddress}
              onChange={e => {
                setSculptureAddress(e.target.value);
              }}
          />
        </div>
        <Button 
          style={{ marginTop: 10 }}
          onClick={() => {
            getSculptureData().then(result => {
              if (result) {
                setSculptureAddress("");
              } else {
                setVerifiedSculptureAddress("");
                setSculptureName("");
                setArtist("");
                setCriticalCatalogNumber("");
                setDate("");
                setTechnique("");
                setDimensions("");
                setLocation("");
                setCategorizationCategory(null);
                setEdition(0);
                setEditionExecutor("");
                setEditionNumber(0);
                setIsConservation(null);
                setConservationCategory(null);
                setSculptureOwner("");
              }
            }).catch(error => {
              console.log(error);
            })
          }}>
          Get Sculpture Record
        </Button>
        <Divider />
        <p style={{ marginTop: 8 }}>Data: {getDataStatus}</p>
        <Divider />
        <Divider />
        <p style={{ marginTop: 8 }}>Sculpture name: {sculptureName}</p>
        <p style={{ marginTop: 8 }}>Artist: {artist}</p>
        <p style={{ marginTop: 8 }}>Critical catalog number: {criticalCatalogNumber}</p>
        <Divider />
        <p style={{ marginTop: 8 }}>Date: {date}</p>
        <p style={{ marginTop: 8 }}>Technique: {technique}</p>
        <p style={{ marginTop: 8 }}>Dimensions: {dimensions}</p>
        <p style={{ marginTop: 8 }}>Location: {location}</p>
        <p style={{ marginTop: 8 }}>Categorization Category: {categorizationCategory}</p>
        <Divider />
        <p style={{ marginTop: 8 }}>Edition: {edition}</p>
        <p style={{ marginTop: 8 }}>Edition Executor: {editionExecutor}</p>
        <p style={{ marginTop: 8 }}>Edition Number: {editionNumber}</p>
        <Divider />
        <p style={{ marginTop: 8 }}>Conservation data: {isConservation}</p>
        <p style={{ marginTop: 8 }}>Conservation Category: {conservationCategory}</p>
        <Divider />
        <Divider />
        User Address:
        <Address address={address} ensProvider={mainnetProvider} fontSize={16} />
        <Divider />
        {/* use utils.formatEther to display a BigNumber: */}
        <h2>Your Balance: {yourLocalBalance ? utils.formatEther(yourLocalBalance) : "..."}</h2>
        <div>OR</div>
        <Balance address={address} provider={localProvider} price={price} />
      </div>
    </div>
  );
}
