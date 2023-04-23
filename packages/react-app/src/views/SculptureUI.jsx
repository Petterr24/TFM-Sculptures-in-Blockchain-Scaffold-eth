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

  // Sculpture address
  const [sculptureInstance, setSculptureInstance] = useState(null);

  // Offsets to identify each dataset from those obtained from the Sculpture Record
  const PERSISTENT_DATA = 0;
  const MISCELLANEOUS_DATA = 1;
  const EDITION_DATA = 2;
  const CONSERVATION_DATA = 3;
  const OWNER = 4;

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
    { value: '0', label: 'NONE' },
    { value: '1', label: 'AUTHORISED UNIQUE WORK' },
    { value: '2', label: 'AUTHORISED UNIQUE WORK VARIATION' },
    { value: '3', label: 'AUTHORISED WORK' },
    { value: '4', label: 'AUTHORISED MULTIPLE' },
    { value: '5', label: 'AUTHORISED CAST' },
    { value: '6', label: 'POSTHUMOUS WORK AUTHORISED BY ARTIST' },
    { value: '7', label: 'NPOSTHUMOUS WORK AUTHORISED BY RIGHTSHOLDERSONE' },
    { value: '8', label: 'AUTHORISED REPRODUCTION' },
    { value: '9', label: 'AUTHORISED EXHIBITION COPY' },
    { value: '10', label: 'AUTHORISED TECHNICAL COPY' },
    { value: '11', label: 'AUTHORISED DIGITAL COPY' }
  ]

  // Categorization label options
  const conservationLabel = [
    { value: null, label: 'Select the conservation label', disabled: true },
    { value: '0', label: 'NONE' },
    { value: '1', label: 'AUTHORISED RECONSTRUCTION' },
    { value: '2', label: 'AUTHORISED RESTORATION' },
    { value: '3', label: 'AUTHORISED EPHEMERAL WORK' }
  ]

  // Conservation options
  const conversationOptions = [
    { value: null, label: 'Select the conservation option', disabled: true },
    { value: 'false', label: 'NO' },
    { value: 'true', label: 'YES' },
  ]
  const { Option } = Select;

  /********************* States to display the record on the UI. **************************/
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
  const [categorizationTag, setCategorizationTag] = useState(null);

  // Get the selected option based on the categorizationTag state
  const categorizationLabelOption = categorizationLabel.find(
    (option) => option.value !== null && option.value === categorizationTag
  );

  // Edition data
  const [edition, setEdition] = useState("");
  const [editionExecutor, setEditionExecutor] = useState("");
  const [editionNumber, setEditionNumber] = useState("");

  // Conservation data
  const [isConservation, setIsConservation] = useState(null);
  const [conservationCategory, setConservationCategory] = useState(null);

  // Get the selected option based on the isConservation state
  const conservationOption = conversationOptions.find(
    (option) => option.value !== null && option.value === isConservation
  );

  // Get the selected option based on the conservationCategory state
  const conservationCategoryOption = conservationLabel.find(
    (option) => option.value !== null && option.value === conservationCategory
  );

  // Sculpture owner
  const [sculptureOwner, setSculptureOwner] = useState("");

  /********************* States to update the record on the SC. **************************/
  // Update Sculpture Status
  const [updateDataStatus, setUpdateDataStatus] = useState("");

  // Miscelaneous data
  const [dateUpdate, setDateUpdate] = useState("");
  const [techniqueUpdate, setTechniqueUpdate] = useState("");
  const [dimensionsUpdate, setDimensionsUpdate] = useState("");
  const [locationUpdate, setLocationUpdate] = useState("");
  const [categorizationTagUpdate, setCategorizationTagUpdate] = useState(null);

  // Edition data
  const [editionUpdate, setEditionUpdate] = useState(null);
  const [editionExecutorUpdate, setEditionExecutorUpdate] = useState("");
  const [editionNumberUpdate, setEditionNumberUpdate] = useState(null);
  
  // Sculpture owner
  const [sculptureOwnerUpdate, setSculptureOwnerUpdate] = useState("");

  // Conservation data
  const [isConservationUpdate, setIsConservationUpdate] = useState(null);
  const [conservationCategoryUpdate, setConservationCategoryUpdate] = useState(null);

  // Some input fields
  const fields = [
    { name: 'Date', oldValue: date, newValue: dateUpdate },
    { name: 'Technique', oldValue: technique, newValue: techniqueUpdate },
    { name: 'Sculpture Dimensions', oldValue: dimensions, newValue: dimensionsUpdate },
    { name: 'Location', oldValue: location, newValue: locationUpdate },
    { name: 'Categorization Labels', oldValue: categorizationTag, newValue: categorizationTagUpdate },
    { name: 'Edition', oldValue: edition, newValue: editionUpdate },
    { name: 'Edition Executor', oldValue: editionExecutor, newValue: editionExecutorUpdate },
    { name: 'Edition Number', oldValue: editionNumber, newValue: editionNumberUpdate },
    { name: 'Conservation options', oldValue: isConservation, newValue: isConservationUpdate },
    { name: 'Conservation labels', oldValue: conservationCategory, newValue: conservationCategoryUpdate },
    { name: 'Sculpture owner', oldValue: sculptureOwner, newValue: sculptureOwnerUpdate }
  ];

  function checkMaxLength(str) {
    return str.length <= 64;
  }

  function isValidDate(value) {
    const regexFormat1 = /^\d{4}$/; // Regex pattern to match the data format like "1990"
    const regexFormat2 = /^(c\.)?\d{4}$/; // Regex pattern to match the date format like "c.1990"
    const regexFormat3 = /^\d{4}-\d{4}$/; // Regex pattern to match the date format like "1990-1992"
    const regexFormat4 = /^\d{4}\s-\s\d{4}$/; // Regex pattern to match the date format like "1990 - 1992"

    if (regexFormat1.test(value) || regexFormat2.test(value) || regexFormat3.test(value) || regexFormat4.test(value)) {
      return true;
    }

    return false;
  }

  function setData(data) {
    setSculptureName(data[PERSISTENT_DATA][PERSISTENT_SCULPTURE_NAME]);
    setArtist(data[PERSISTENT_DATA][PERSISTENT_ARTIST]);
    setCriticalCatalogNumber(data[PERSISTENT_DATA][PERSISTENT_CRITICAL_CATALOG_NUMBER]);
    setDate(data[MISCELLANEOUS_DATA][MISC_DATE]);
    setTechnique(data[MISCELLANEOUS_DATA][MISC_TECHNIQUE]);
    setDimensions(data[MISCELLANEOUS_DATA][MISC_DIMENSIONS]);
    setLocation(data[MISCELLANEOUS_DATA][MISC_LOCATION]);
    setCategorizationTag(data[MISCELLANEOUS_DATA][MISC_CATEGORIZATION_LABEL].toString());
    if (data[EDITION_DATA][EDITION_EDITION_EXECUTOR] != '-') {
      setEdition(data[EDITION_DATA][EDITION_EDITION].toString());
      setEditionExecutor(data[EDITION_DATA][EDITION_EDITION_EXECUTOR]);
      setEditionNumber(data[EDITION_DATA][EDITION_EDITION_NUMBER].toString());
    } else {
      setEdition(null);
      setEditionExecutor("");
      setEditionNumber(null)
    }
    setIsConservation(data[CONSERVATION_DATA][CONSV_CONSERVATION].toString());
    setConservationCategory(data[CONSERVATION_DATA][CONSV_CONSERVATION_LABEL]);
    setSculptureOwner(data[OWNER]);
  }

  async function updateSculpture() {
    if (!verifiedSculptureAddress) {
      setUpdateDataStatus(`Please first enter the address of the Sculpture record you want to update the data`);
      setDateUpdate("");
      setTechniqueUpdate("");
      setDimensionsUpdate("");
      setLocationUpdate("");
      setCategorizationTagUpdate(null);
      setEditionUpdate(null);
      setEditionExecutorUpdate("");
      setEditionNumberUpdate(null);
      setIsConservationUpdate(null);
      setConservationCategoryUpdate(null);
      setSculptureOwnerUpdate("");
      setGetDataStatus("");

      return false;
    }

    // Check that the following fields are provided
    for (const field of fields) {
      if (!field.newValue) {
        switch (field.name) {
          case 'Date':
            setDateUpdate(field.oldValue);
            break;

          case 'Technique':
            setTechniqueUpdate(field.oldValue);
            break;

          case 'Sculpture Dimensions':
            setDimensionsUpdate(field.oldValue);
            break;

          case 'Location':
            setLocationUpdate(field.oldValue);
            break;

          case 'Categorization Labels':
            setCategorizationTagUpdate(parseInt(field.oldValue));
            break;

          case 'Edition':
            setEditionUpdate(parseInt(field.oldValue));
            break;

          case 'Edition Executor':
            setEditionExecutor(field.oldValue);
            break;

          case 'Edition Number':
            setEditionNumberUpdate(parseInt(field.oldValue));
            break;

          case 'Sculpture owner':
            setSculptureOwnerUpdate(field.oldValue);
            break;

          case 'Conservation options':
            setIsConservationUpdate(field.oldValue);

          case 'Conservation labels':
            setConservationCategoryUpdate(field.oldValue);

          default:
            // Do nothing
        }
      }

      if (!field.newValue && !checkMaxLength(field.newValue.toString())) {
        setUpdateDataStatus(`The ${field.name} field exceeds the maximum string length of 64 characters`);

        return false;
      }
    }

    // If the choosen field is 'NONE', recover the old value to send to the SC
    if (categorizationTagUpdate == '0') {
      setCategorizationTagUpdate(parseInt(categorizationTag));
    }

    if (!isValidDate(dateUpdate)) {
      setUpdateDataStatus("Invalid date format. Please provide a valid year in the format '1990', 'c.1990', '1990-1992' or '1990 - 1992'");

      return false;
    }

    const miscellaneousDataUpdate = [
      dateUpdate,
      techniqueUpdate,
      dimensionsUpdate,
      locationUpdate,
      categorizationTagUpdate
    ]

    const editionDataUpdate = [
      editionUpdate,
      editionExecutorUpdate,
      editionNumberUpdate 
    ]

    const conservationDataUpdate = [
      isConservationUpdate,
      conservationCategoryUpdate
    ]

    // TODO: There is no restrictions for Edition fields depending on the categorization labels. Same for conservation maybe
    try {
      const transaction = await tx(sculptureInstance.updateSculpture(
        miscellaneousDataUpdate,
        editionDataUpdate,
        conservationDataUpdate,
        sculptureOwnerUpdate));

      await transaction.wait();
      setUpdateDataStatus("Sculpture record updated successfully");

      // Update the information in the UI
      return getSculptureDataAfterUpdate();
    } catch (err) {
      console.error(err);
      setUpdateDataStatus("Failed to updated a Sculpture record");

      return false;
    }
  }

  async function getSculptureDataAfterUpdate() {
    try {
      const data = await tx(sculptureInstance.getSculptureData());

      // Update the state variables with the parsed data
      setData(data)
      setGetDataStatus("Sculpture data recovered successfully!");

      return true;
    } catch (err) {
      console.error(err);
      setUpdateDataStatus("Failed to get data after a Sculpture record update");

      return false;
    }
  }

  async function getSculptureData() {
    try {
      const sculptureRecordsAddresses = await tx(readContracts.SculptureFactory.getSculptures());

      for (let i = 0; i < sculptureRecordsAddresses.length; i++) {
        if (sculptureRecordsAddresses[i] === sculptureAddress) {
          for (const contractName in sculptureRecords) {
            const contractInstance = sculptureRecords[contractName];
            if (contractInstance && contractInstance.address === sculptureAddress) {
              setVerifiedSculptureAddress(sculptureAddress);
              setSculptureInstance(contractInstance);
              const data = await tx(contractInstance.getSculptureData());
  
              // Update the state variables with the parsed data
              setData(data)
              setGetDataStatus("Sculpture data recovered successfully!");
  
              return true;
            }
          }
        }
      }
  
      setGetDataStatus("The provided Sculpture address does not exist!");
  
      return false;
    } catch (err) {
      console.error(err);
      setGetDataStatus("Failed to get the Sculpture Record");

      return false;
    }
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
          ⚙️ Section: To look for the Sculpture record. TODO: decide if we want to display the owner
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
                setCategorizationTag(null);
                setEdition("");
                setEditionExecutor("");
                setEditionNumber("");
                setIsConservation(null);
                setConservationCategory(null);
                setSculptureOwner("");
                setDateUpdate("");
                setTechniqueUpdate("");
                setDimensionsUpdate("");
                setLocationUpdate("");
                setCategorizationTagUpdate(null);
                setEditionUpdate(null);
                setEditionExecutorUpdate("");
                setEditionNumberUpdate(null);
                setSculptureOwnerUpdate("");
              }
            }).catch(error => {
              console.log(error);
            })
          }}>
          Get Sculpture Record
        </Button>
        <Divider />
        <p style={{ marginTop: 8 }}><strong>Transaction status:</strong> {getDataStatus}</p>
        <Divider />
        <Divider />
        <Divider style={{ fontWeight: 'bold', fontSize: '20px' }}>Sculpture Data</Divider>
        <Divider />
        <Divider />
        <p style={{ marginTop: 8 }}><strong>Sculpture name:</strong> {sculptureName}</p>
        <p style={{ marginTop: 8 }}><strong>Artist:</strong> {artist}</p>
        <p style={{ marginTop: 8 }}><strong>Critical catalog number:</strong> {criticalCatalogNumber}</p>
        <Divider />
        <p style={{ marginTop: 8 }}><strong>Date:</strong> {date}</p>
        <p style={{ marginTop: 8 }}><strong>Technique:</strong> {technique}</p>
        <p style={{ marginTop: 8 }}><strong>Dimensions:</strong> {dimensions}</p>
        <p style={{ marginTop: 8 }}><strong>Location:</strong> {location}</p>
        <p style={{ marginTop: 8 }}><strong>Categorization Label:</strong> {categorizationLabelOption ? categorizationLabelOption.label : ''}</p>
        <Divider />
        <p style={{ marginTop: 8 }}><strong>Edition:</strong> {edition}</p>
        <p style={{ marginTop: 8 }}><strong>Edition Executor:</strong> {editionExecutor}</p>
        <p style={{ marginTop: 8 }}><strong>Edition Number:</strong> {editionNumber}</p>
        <Divider />
        <p style={{ marginTop: 8 }}><strong>Conservation:</strong> {conservationOption ? conservationOption.label : ''}</p>
        <p style={{ marginTop: 8 }}><strong>Conservation Label:</strong> {conservationCategoryOption ? conservationCategoryOption.label : ''}</p>
        <Divider />
        <Divider />
        <Divider style={{ fontWeight: 'bold', fontSize: '20px' }}>Update Sculpture:</Divider>
        <Divider />
        <Divider />
        {/*
          ⚙️ Section: Update an existing Sculpture
        */}
        <div>
          <label>Date:</label>
          <Input
              value={dateUpdate}
              onChange={e => {
                setDateUpdate(e.target.value);
              }}
          />
        </div>
        <div>
          <label>Technique:</label>
          <Input
              value={techniqueUpdate}
              onChange={e => {
                setTechniqueUpdate(e.target.value);
              }}
          />
        </div>
        <div>
          <label>Dimensions:</label>
          <Input
              value={dimensionsUpdate}
              onChange={e => {
                setDimensionsUpdate(e.target.value);
              }}
          />
        </div>
        <div>
          <label>Location:</label>
          <Input
              value={locationUpdate}
              onChange={e => {
                setLocationUpdate(e.target.value);
              }}
          />
        </div>
        <div>
          <label>Owner:</label>
          <Input
              value={sculptureOwnerUpdate}
              onChange={e => {
                setSculptureOwnerUpdate(e.target.value);
              }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginTop: 10 }}>Categorization Label:</label>
          <Select style={{ marginTop: 5 }} value={categorizationTagUpdate} onChange={setCategorizationTagUpdate}>
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
              value={editionUpdate}
              onChange={e => {
                setEditionUpdate(e.target.value);
              }}
          />
        </div>
        <div>
          <label>Edition Executor:</label>
          <Input
              value={editionExecutorUpdate}
              onChange={e => {
                setEditionExecutorUpdate(e.target.value);
              }}
          />
        </div>
        <div>
          <label>Edition Number:</label>
          <Input
              value={editionNumberUpdate}
              onChange={e => {
                setEditionNumberUpdate(e.target.value);
              }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginTop: 10 }}>Conservation:</label>
          <Select style={{ marginTop: 5 }} value={isConservationUpdate} onChange={setIsConservationUpdate}>
            {conversationOptions.map((option) => (
              <Option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginTop: 10 }}>Conservation Label:</label>
          <Select style={{ marginTop: 5 }} value={conservationCategoryUpdate} onChange={setConservationCategoryUpdate}>
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
            updateSculpture().then(result => {
              if (result) {
                setDateUpdate("");
                setTechniqueUpdate("");
                setDimensionsUpdate("");
                setLocationUpdate("");
                setCategorizationTagUpdate(null);
                setEditionUpdate(null);
                setEditionExecutorUpdate("");
                setEditionNumberUpdate(null);
                setIsConservationUpdate(null);
                setConservationCategoryUpdate(null);
                setSculptureOwnerUpdate("");
              }
            }).catch(error => {
              console.log(error);
            })
          }}>
          Update Sculpture
        </Button>
        <p style={{ marginTop: 8 }}>Transcation status: {updateDataStatus}</p>
        <Divider />
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
