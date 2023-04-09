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
    { value: '0', label: 'NONE' },
    { value: '1', label: 'AUTHORIZED UNIQUE WORK' },
    { value: '2', label: 'AUTHORIZED UNIQUE WORK VARIATION' },
    { value: '3', label: 'AUTHORIZED WORK' },
    { value: '4', label: 'AUTHORIZED MULTIPLE' },
    { value: '5', label: 'AUTHORIZED CAST' },
    { value: '6', label: 'POSTHUMOUS WORK AUTHORIZED BY ARTIST' },
    { value: '7', label: 'NPOSTHUMOUS WORK AUTHORIZED BY RIGHTSHOLDERSONE' },
    { value: '8', label: 'AUTHORIZED REPRODUCTION' },
    { value: '9', label: 'AUTHORIZED EXHIBITION COPY' },
    { value: '10', label: 'AUTHORIZED TECHNICAL COPY' },
    { value: '11', label: 'AUTHORIZED DIGITAL COPY' }
  ]

  // Categorization label options
  const conservationLabel = [
    { value: '0', label: 'AUTHORIZED RECONSTRUCTION' },
    { value: '1', label: 'AUTHORIZED RESTORATION' },
    { value: '2', label: 'AUTHORIZED EPHEMERAL WORK' }
  ]

  // Conservation options
  const conversationOptions = [
    { value: '0', label: 'NO' },
    { value: '1', label: 'YES' },
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
  const [categorizationCategory, setCategorizationCategory] = useState(null);

  // Get the selected option based on the categorizationCategory state
  const categorizationLabelOption = categorizationLabel.find(
    (option) => option.value === categorizationCategory
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
    (option) => option.value === isConservation
  );

  // Get the selected option based on the conservationCategory state
  const conservationCategoryOption = conservationLabel.find(
    (option) => option.value === conservationCategory
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
  const [categorizationCategoryUpdate, setCategorizationCategoryUpdate] = useState(null);

  // Edition data
  const [editionUpdate, setEditionUpdate] = useState(null);
  const [editionExecutorUpdate, setEditionExecutorUpdate] = useState("");
  const [editionNumberUpdate, setEditionNumberUpdate] = useState(null);
  
  // Sculpture owner
  const [sculptureOwnerUpdate, setSculptureOwnerUpdate] = useState("");

  // Conservation data --> TODO: discuss if necessary update these fields as well
  //const [isConservation, setIsConservation] = useState(null);
  //const [conservationCategory, setConservationCategory] = useState(null);

  // Some input fields
  const fields = [
    { name: 'Date', oldValue: date, newValue: dateUpdate },
    { name: 'Technique', oldValue: technique, newValue: techniqueUpdate },
    { name: 'Sculpture Dimensions', oldValue: dimensions, newValue: dimensionsUpdate },
    { name: 'Location', oldValue: location, newValue: locationUpdate },
    { name: 'Categorization Labels', oldValue: categorizationCategory, newValue: categorizationCategoryUpdate },
    { name: 'Edition', oldValue: edition, newValue: editionUpdate },
    { name: 'Edition Executor', oldValue: editionExecutor, newValue: editionExecutorUpdate },
    { name: 'Edition Number', oldValue: editionNumber, newValue: editionNumberUpdate },
    //{ name: 'Conservation options', oldValue: isConservation, newValue: editionUpdate }, TODO: Add if necessary
    { name: 'Sculpture owner', oldValue: sculptureOwner, newValue: sculptureOwnerUpdate }
  ];

  function checkMaxLength(str) {
    return str.length <= 64;
  }

  async function updateSculpture() {
    // Check that the following fields are provided
    for (const field of fields) {
      if ((field.name != 'Conservation options') && (!field.value)) {
        field.newValue = field.oldValue;
      } else if ((field.name == 'Conservation options') && (field.value == null)) {
        field.newValue = field.oldValue;
      }

      if (!checkMaxLength(field.value.toString())) {
        setUpdateDataStatus(`The ${field.name} field exceeds the maximum string length of 64 characters`);

        return false;
      }
    }

    // TODO: Once the doubt are solved. If necessary implement the conservation data update (including in SCs, not supported)
    // TODO: There is no restrictions for Edition fields depending on the categorization labels
    try {
      const transaction = await tx(sculptureInstance.updateSculpture(
        dateUpdate,
        techniqueUpdate,
        dimensionsUpdate,
        locationUpdate,
        categorizationCategoryUpdate,
        editionUpdate,
        editionExecutorUpdate,
        editionNumberUpdate,
        sculptureOwnerUpdate));

      await transaction.wait();
      setUpdateDataStatus("Sculpture record updated successfully");

      // Update the information in the UI
      getSculptureData();

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
            setSculptureInstance(contractInstance);
            const data = await tx(contractInstance.getSculptureData());

            // Update the state variables with the parsed data
            setSculptureName(data[PERSISTENT_DATA][PERSISTENT_SCULPTURE_NAME]);
            setArtist(data[PERSISTENT_DATA][PERSISTENT_ARTIST]);
            setCriticalCatalogNumber(data[PERSISTENT_DATA][PERSISTENT_CRITICAL_CATALOG_NUMBER]);
            setDate(data[MISCELLANEOUS_DATA][MISC_DATE]);
            setTechnique(data[MISCELLANEOUS_DATA][MISC_TECHNIQUE]);
            setDimensions(data[MISCELLANEOUS_DATA][MISC_DIMENSIONS]);
            setLocation(data[MISCELLANEOUS_DATA][MISC_LOCATION]);
            setCategorizationCategory(data[MISCELLANEOUS_DATA][MISC_CATEGORIZATION_LABEL].toString());
            setEdition(data[EDITION_DATA][EDITION_EDITION].toString());
            setEditionExecutor(data[EDITION_DATA][EDITION_EDITION_EXECUTOR]);
            setEditionNumber(data[EDITION_DATA][EDITION_EDITION_NUMBER].toString());
            setIsConservation(data[CONSERVATION_DATA][CONSV_CONSERVATION].toString());
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
                setEdition("");
                setEditionExecutor("");
                setEditionNumber("");
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
        <p style={{ marginTop: 8 }}><strong>Categorization Label:</strong> {categorizationLabelOption ? categorizationLabelOption.label : '-'}</p>
        <Divider />
        <p style={{ marginTop: 8 }}><strong>Edition:</strong> {edition}</p>
        <p style={{ marginTop: 8 }}><strong>Edition Executor:</strong> {editionExecutor}</p>
        <p style={{ marginTop: 8 }}><strong>Edition Number:</strong> {editionNumber}</p>
        <Divider />
        <p style={{ marginTop: 8 }}><strong>Conservation:</strong> {conservationOption ? conservationOption.label : '-'}</p>
        <p style={{ marginTop: 8 }}><strong>Conservation Label:</strong> {conservationCategoryOption ? conservationCategoryOption.label : '-'}</p>
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
          <Select style={{ marginTop: 5 }} value={categorizationCategoryUpdate} onChange={setCategorizationCategoryUpdate}>
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
        <Button 
          style={{ marginTop: 10 }}
          onClick={() => {
            updateSculpture().then(result => {
              if (result) {
                setDateUpdate("");
                setTechniqueUpdate("");
                setDimensionsUpdate("");
                setLocationUpdate("");
                setCategorizationCategoryUpdate(null);
                setEditionUpdate(null);
                setEditionExecutorUpdate("");
                setEditionNumberUpdate(null);
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
