import { Button, Divider, Input, Select } from "antd";
import React, { useState } from "react";
import { utils } from "ethers";

import { Address, Balance } from "../components";

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
    { value: "", label: "Select the categorization label" },
    { value: "0", label: "NONE" },
    { value: "1", label: "AUTHORISED UNIQUE WORK" },
    { value: "2", label: "AUTHORISED UNIQUE WORK VARIATION" },
    { value: "3", label: "AUTHORISED WORK" },
    { value: "4", label: "AUTHORISED MULTIPLE" },
    { value: "5", label: "AUTHORISED CAST" },
    { value: "6", label: "POSTHUMOUS WORK AUTHORISED BY THE ARTIST" },
    { value: "7", label: "POSTHUMOUS WORK AUTHORISED BY THE RIGHTSHOLDERS" },
    { value: "8", label: "AUTHORISED REPRODUCTION" },
    { value: "9", label: "AUTHORISED EXHIBITION COPY" },
    { value: "10", label: "AUTHORISED TECHNICAL COPY" },
    { value: "11", label: "AUTHORISED DIGITAL COPY" },
  ];

  // Categorization label options
  const conservationLabel = [
    { value: "", label: "Select the conservation label" },
    { value: "0", label: "NONE" },
    { value: "1", label: "AUTHORISED RECONSTRUCTION" },
    { value: "2", label: "AUTHORISED RESTORATION" },
    { value: "3", label: "AUTHORISED EPHEMERAL WORK" },
  ];

  // Conservation options
  const conversationOptions = [
    { value: "", label: "Select the conservation option" },
    { value: "false", label: "NO" },
    { value: "true", label: "YES" },
  ];

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
  const [categorizationTag, setCategorizationTag] = useState("");

  // Get the selected option based on the categorizationTag state
  const categorizationLabelOption = categorizationLabel.find(
    option => option.value !== '' && option.value !== '0' && option.value === categorizationTag
  );

  // Edition data
  const [edition, setEdition] = useState("");
  const [editionExecutor, setEditionExecutor] = useState("");
  const [editionNumber, setEditionNumber] = useState("");

  // Conservation data
  const [isConservation, setIsConservation] = useState("");
  const [conservationCategory, setConservationCategory] = useState("");

  // Get the selected option based on the isConservation state
  const conservationOption = conversationOptions.find(
    option => option.value !== "" && option.value === isConservation
  );

  // Get the selected option based on the conservationCategory state
  const conservationCategoryOption = conservationLabel.find(
    option => option.value !== "" && option.value !== "0" && option.value === conservationCategory
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
  const [isConservationUpdate, setIsConservationUpdate] = useState(true);
  const [conservationCategoryUpdate, setConservationCategoryUpdate] = useState(null);

  /********************* States to show the new value to update the Record in the UI. **************************/
  // Miscelaneous data
  const [dateUpdateUI, setDateUpdateUI] = useState("");
  const [techniqueUpdateUI, setTechniqueUpdateUI] = useState("");
  const [dimensionsUpdateUI, setDimensionsUpdateUI] = useState("");
  const [locationUpdateUI, setLocationUpdateUI] = useState("");
  const [categorizationTagUpdateUI, setCategorizationTagUpdateUI] = useState("");

  // Edition data
  const [editionUpdateUI, setEditionUpdateUI] = useState("");
  const [editionExecutorUpdateUI, setEditionExecutorUpdateUI] = useState("");
  const [editionNumberUpdateUI, setEditionNumberUpdateUI] = useState("");

  // Sculpture owner
  const [sculptureOwnerUpdateUI, setSculptureOwnerUpdateUI] = useState("");

  // Conservation data
  const [isConservationUpdateUI, setIsConservationUpdateUI] = useState("");
  const [conservationCategoryUpdateUI, setConservationCategoryUpdateUI] = useState("");

  /********************* Inputs fields provided to update a Sculpture record. **************************/
  const fields = [
    { name: "Date", oldValue: date, newValue: dateUpdate },
    { name: "Technique", oldValue: technique, newValue: techniqueUpdate },
    { name: "Sculpture Dimensions", oldValue: dimensions, newValue: dimensionsUpdate },
    { name: "Location", oldValue: location, newValue: locationUpdate },
    { name: "Categorization Labels", oldValue: categorizationTag, newValue: categorizationTagUpdateUI },
    { name: "Sculpture owner", oldValue: sculptureOwner, newValue: sculptureOwnerUpdate },
    { name: "Edition", oldValue: edition, newValue: editionUpdateUI },
    { name: "Edition Executor", oldValue: editionExecutor, newValue: editionExecutorUpdate },
    { name: "Edition Number", oldValue: editionNumber, newValue: editionNumberUpdateUI },
    { name: "Conservation options", oldValue: isConservation, newValue: isConservationUpdateUI },
    { name: "Conservation labels", oldValue: conservationCategory, newValue: conservationCategoryUpdateUI }
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

  function isDimensionsFieldCorrect(data) {
    // Dimensions pattern : "LENGTH x WIDTH x HEIGHT" (cm), considering also decimal values
    const regex = /^\s*(\d+(\.\d+)?|\.\d+)\s*x\s*(\d+(\.\d+)?|\.\d+)\s*x\s*(\d+(\.\d+)?|\.\d+)\s*$/;

    if (regex.test(data)) {
      return true;
    }

    return false;
  }

  function isCorrectCategLabelForEdition() {
    // One of the following categorization labels is required to store information in the edition fields:
    // 'AUTHORISED REPRODUCTION'
    // 'AUTHORISED EXHIBITION COPY'
    // 'AUTHORISED TECHNICAL COPY'
    // 'AUTHORISED DIGITAL COPY'
    return (categorizationTagUpdate > 7 && categorizationTagUpdate < 12)
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
    if (data[EDITION_DATA][EDITION_EDITION_EXECUTOR] != "-") {
      setEdition(data[EDITION_DATA][EDITION_EDITION].toString());
      setEditionExecutor(data[EDITION_DATA][EDITION_EDITION_EXECUTOR]);
      setEditionNumber(data[EDITION_DATA][EDITION_EDITION_NUMBER].toString());
    } else {
      setEdition("");
      setEditionExecutor("");
      setEditionNumber("");
    }
    setIsConservation(data[CONSERVATION_DATA][CONSV_CONSERVATION].toString());
    setConservationCategory(data[CONSERVATION_DATA][CONSV_CONSERVATION_LABEL].toString());
    setSculptureOwner(data[OWNER]);
  }

  function resetUpdateFields() {
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

  async function updateSculpture() {
    if (!verifiedSculptureAddress) {
      setUpdateDataStatus("Please first enter the address of the Sculpture record you want to update the data");
      resetUpdateFields();

      setGetDataStatus("");
      setDateUpdateUI("");
      setTechniqueUpdateUI("");
      setDimensionsUpdateUI("");
      setLocationUpdateUI("");
      setCategorizationTagUpdateUI("");
      setEditionUpdateUI("");
      setEditionExecutorUpdateUI("");
      setEditionNumberUpdateUI("");
      setIsConservationUpdateUI("");
      setConservationCategoryUpdateUI("");
      setSculptureOwnerUpdateUI("");

      return false;
    }

    const miscellaneousDataUpdate = [dateUpdate, techniqueUpdate, dimensionsUpdate, locationUpdate, categorizationTagUpdate];
    const editionDataUpdate = [editionUpdate, editionExecutorUpdate, editionNumberUpdate];
    const conservationDataUpdate = [isConservationUpdate, conservationCategoryUpdate];
    let sculptureOwnerData = sculptureOwnerUpdate;

    let rejectUpdateIfNoData = true;
    // Check that the following fields are provided
    for (const field of fields) {
      let skipStringLengthCheck = false;
      if (!field.newValue) {
        // When no data has been provided for a field, use the oldValue (the value stored in the SC/record) in order to send it again to the SC just to no fail the transaction by sending empty fields
        switch (field.name) {
          case "Date":
            setDateUpdate(field.oldValue);
            miscellaneousDataUpdate[MISC_DATE] = field.oldValue;
            break;

          case "Technique":
            setTechniqueUpdate(field.oldValue);
            miscellaneousDataUpdate[MISC_TECHNIQUE] = field.oldValue;
            break;

          case "Sculpture Dimensions":
            setDimensionsUpdate(field.oldValue);
            miscellaneousDataUpdate[MISC_DIMENSIONS] = field.oldValue;
            break;

          case "Location":
            setLocationUpdate(field.oldValue);
            miscellaneousDataUpdate[MISC_LOCATION] = field.oldValue;
            break;

          case "Categorization Labels":
            setCategorizationTagUpdate(parseInt(field.oldValue));
            miscellaneousDataUpdate[MISC_CATEGORIZATION_LABEL] = parseInt(field.oldValue);
            skipStringLengthCheck = true;
            break;

          case "Edition":
            // If Edition is not provided, check if the previous value was empty, so we have to send the default value '0'
            let editionValue = 0;
            if (field.oldValue !== "") {
              editionValue = parseInt(field.oldValue);
            }
            setEditionUpdate(editionValue);
            editionDataUpdate[EDITION_EDITION] = editionValue;
            skipStringLengthCheck = true;
            break;

          case "Edition Executor":
            // If EditionExecutor is not provided, check if the previous value was empty, so we have to send the default value '-'
            let editionExecutorValue = "-";
            if (field.oldValue !== "") {
              editionExecutorValue = field.oldValue;
            }
            setEditionExecutorUpdate(editionExecutorValue)
            editionDataUpdate[EDITION_EDITION_EXECUTOR] = editionExecutorValue;
            break;

          case "Edition Number":
            // If EditionNumber is not provided, check if the previous value was empty, so we have to send the default value '0'
            let editionNumberValue = 0;
            if (field.oldValue !== "") {
              editionNumberValue = parseInt(field.oldValue);
            }
            setEditionNumberUpdate(editionNumberValue);
            editionDataUpdate[EDITION_EDITION_NUMBER] = editionNumberValue;
            skipStringLengthCheck = true;
            break;

          case "Sculpture owner":
            setSculptureOwnerUpdate(field.oldValue);
            sculptureOwnerData = field.oldValue;
            break;

          case "Conservation options":
            let conservationValue = false;
            if (field.oldValue === "true") {
              conservationValue = true;
            }
            setIsConservationUpdate(conservationValue);
            conservationDataUpdate[CONSV_CONSERVATION] = conservationValue;
            skipStringLengthCheck = true;
            break;

          case "Conservation labels":
            // If ConservationLabel is not provided, check if the previous value was empty, so we have to send the default value '0'
            let conservationLabelValue = 0;
            if (field.oldValue !== "") {
              conservationLabelValue = parseInt(field.oldValue);
            }
            setConservationCategoryUpdate(conservationLabelValue);
            conservationDataUpdate[CONSV_CONSERVATION_LABEL] = conservationLabelValue;
            skipStringLengthCheck = true;
            break;

          default:
            // Do nothing
        }
      } else {
        // Condition when new field has been provided. Some checks are necessary depending on the field
        // Some of them must be converted from Strings to Int values

        // Set to false the rejection flag when any field has been provided
        if (rejectUpdateIfNoData) {
          rejectUpdateIfNoData = false;
        }

        // Convert the non string fields to the corresponding type (int or boolean) using the UI states which are strings
        skipStringLengthCheck = true;
        switch (field.name) {
          case "Date":
            if (!isValidDate(field.newValue)) {
              setUpdateDataStatus("Invalid date format. Please provide a valid year in the format '1990', 'c.1990', '1990-1992' or '1990 - 1992'");

              return false;
            }
            break;

          case "Categorization Labels":
            let categorizationTagValue = parseInt(field.newValue);
            setCategorizationTagUpdate(categorizationTagValue);
            miscellaneousDataUpdate[MISC_CATEGORIZATION_LABEL] = categorizationTagValue;
            break;

          case "Edition":
            let editionValue = parseInt(field.newValue);
            setEditionUpdate(editionValue);
            editionDataUpdate[EDITION_EDITION] = editionValue;
            break;

          case "Edition Number":
            let editionNumberValue = parseInt(field.newValue);
            setEditionNumberUpdate(editionNumberValue);
            editionDataUpdate[EDITION_EDITION_NUMBER] = editionNumberValue;
            break;

          case "Conservation options":
            let conservationValue = false;
            if (field.newValue === "true") {
              conservationValue = true;
            }
            setIsConservationUpdate(conservationValue);
            conservationDataUpdate[CONSV_CONSERVATION] = conservationValue;
            break;

          case "Conservation labels":
            let conservationLabelValue = parseInt(field.newValue);
            setConservationCategoryUpdate(conservationLabelValue);
            conservationDataUpdate[CONSV_CONSERVATION_LABEL] = conservationLabelValue;
            break;

          case "Sculpture Dimensions":
            if (!isDimensionsFieldCorrect(field.newValue)) {
              setUpdateDataStatus("Invalid dimensions format. Please provide the dimensions following this format 'LENGTH x WIDTH x HEIGHT'");

              return false;
            }

          default:
            // Do nothing for the other cases
            // Set to false the String Length check as it means that the current field is a string
            skipStringLengthCheck = false;
        }
      }

      if (!skipStringLengthCheck && !checkMaxLength(field.newValue)) {
        setUpdateDataStatus(`The ${field.name} field exceeds the maximum string length of 64 characters`);

        return false;
      }
    }

    if (rejectUpdateIfNoData) {
      resetUpdateFields();
      setUpdateDataStatus("Please provide any field to update the record.");

      return false;
    }

    // It is necessary to have a conservation label when the conservation option is set to TRUE ('YES')
    if (conservationDataUpdate[CONSV_CONSERVATION] && conservationDataUpdate[CONSV_CONSERVATION_LABEL] === 0) {
      // Fails if the isConservation value is true and the Conservation label is 'NONE'
      setUpdateDataStatus("A conservation label is required when selecting Conservation. NONE is not a valid option");

      return false;
    } else if (!conservationDataUpdate[CONSV_CONSERVATION] && conservationDataUpdate[CONSV_CONSERVATION_LABEL] !== 0) {
      // Fails if the isConservation value is false and the Conservation label is different than 'NONE'
      setUpdateDataStatus("Conservation labels cannot be selected when conservation is set to 'NO'");

      return false;
    } else if (conservationDataUpdate[CONSV_CONSERVATION] && miscellaneousDataUpdate[MISC_CATEGORIZATION_LABEL] !== 0) {
      // Fails if the conservation option is set to 'YES' and the Categorization Label is different than NONE
      setUpdateDataStatus("Conservation labels cannot be selected when Categorization Label is already stored. Therefore, set the Categorization label to NONE.");

      return false;
    } else if (!conservationDataUpdate[CONSV_CONSERVATION] && miscellaneousDataUpdate[MISC_CATEGORIZATION_LABEL] === 0) {
      // Fails if the categorization label is set to 'NONE' and the Conservation option is set to 'NO'. 
      // When the conservation option is 'NO' it is required to select one of the available categorization labels

      setUpdateDataStatus("It is required to provide any Categorization Labels when the Conservation option is set to 'NO'");

      return false;
    }

    if ((editionDataUpdate[EDITION_EDITION] !== 0) || (editionDataUpdate[EDITION_EDITION_NUMBER] !== 0) || (editionDataUpdate[EDITION_EDITION_EXECUTOR] !== "-")) {
      // Checks if the categorization label is correct according to the Edition requirements
      if (!isCorrectCategLabelForEdition()) {
        setUpdateDataStatus("Edition data can only be provided when using Authorisation reproduction, exhibition copy, technical copy or digital copy for categorization labels.");

        return false;
      }
    }

    try {
      const transaction = await tx(sculptureInstance.updateSculpture(
        miscellaneousDataUpdate,
        editionDataUpdate,
        conservationDataUpdate,
        sculptureOwnerData
      ));

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
      setData(data);
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
              setData(data);
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
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 500, margin: "auto", marginTop: 64 }}>
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
                // State to display the current Record address
                setVerifiedSculptureAddress("");

                // States used to display the information stored in the SmartContract record
                setSculptureName("");
                setArtist("");
                setCriticalCatalogNumber("");
                setDate("");
                setTechnique("");
                setDimensions("");
                setLocation("");
                setSculptureOwner("");
                setCategorizationTag("");
                setEdition("");
                setEditionExecutor("");
                setEditionNumber("");
                setIsConservation("");
                setConservationCategory("");

                // States used to store the new values that would be supplied to update the exiting record
                setDateUpdate("");
                setTechniqueUpdate("");
                setDimensionsUpdate("");
                setLocationUpdate("");
                setSculptureOwnerUpdate("");
                setCategorizationTagUpdate(null);
                setEditionUpdate(null);
                setEditionExecutorUpdate("");
                setEditionNumberUpdate(null);
                setIsConservationUpdate(null);
                setConservationCategoryUpdate(null);

                // States used to store the values provided by the user in the UI fields to be supplied to the record in order to be updated
                // They are only used to display the value in the Update Sculpture section
                setDateUpdateUI("");
                setTechniqueUpdateUI("");
                setDimensionsUpdateUI("");
                setLocationUpdateUI("");
                setSculptureOwnerUpdateUI("");
                setCategorizationTagUpdateUI("");
                setEditionUpdateUI("");
                setEditionExecutorUpdateUI("");
                setEditionNumberUpdateUI("");
                setIsConservationUpdateUI("");
                setConservationCategoryUpdateUI("");
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
        <Divider style={{ fontWeight: "bold", fontSize: "20px" }}>Sculpture Data</Divider>
        <Divider />
        <Divider />
          <p style={{ marginTop: 8 }}><strong>Sculpture name:</strong> {sculptureName}</p>
          <p style={{ marginTop: 8 }}><strong>Artist:</strong> {artist}</p>
          <p style={{ marginTop: 8 }}><strong>Critical catalog number:</strong> {criticalCatalogNumber}</p>
        <Divider />
          <p style={{ marginTop: 8 }}><strong>Date:</strong> {date}</p>
          <p style={{ marginTop: 8 }}><strong>Technique:</strong> {technique}</p>
          <p style={{ marginTop: 8 }}><strong>Dimensions (cm):</strong> {dimensions}</p>
          <p style={{ marginTop: 8 }}><strong>Location:</strong> {location}</p>
          <p style={{ marginTop: 8 }}><strong>Sculpture owner:</strong> {sculptureOwner}</p>
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
        <Divider style={{ fontWeight: "bold", fontSize: "20px" }}>Update Sculpture:</Divider>
        <Divider />
        <Divider />
        {/*
          ⚙️ Section: Update an existing Sculpture
        */}
        <div>
          <label>Date:</label>
          <Input
              value={dateUpdateUI}
              onChange={e => {
                setDateUpdate(e.target.value);
                setDateUpdateUI(e.target.value);
              }}
          />
        </div>
        <div>
          <label>Technique:</label>
          <Input
              value={techniqueUpdateUI}
              onChange={e => {
                setTechniqueUpdate(e.target.value);
                setTechniqueUpdateUI(e.target.value);
              }}
          />
        </div>
        <div>
          <label>Dimensions:</label>
          <Input
              value={dimensionsUpdateUI}
              onChange={e => {
                setDimensionsUpdate(e.target.value);
                setDimensionsUpdateUI(e.target.value);
              }}
          />
        </div>
        <div>
          <label>Location:</label>
          <Input
              value={locationUpdateUI}
              onChange={e => {
                setLocationUpdate(e.target.value);
                setLocationUpdateUI(e.target.value);
              }}
          />
        </div>
        <div>
          <label>Owner:</label>
          <Input
              value={sculptureOwnerUpdateUI}
              onChange={e => {
                setSculptureOwnerUpdate(e.target.value);
                setSculptureOwnerUpdateUI(e.target.value);
              }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginTop: 10 }}>Categorization Label:</label>
          <Select style={{ marginTop: 5 }} value={categorizationTagUpdateUI} onChange={setCategorizationTagUpdateUI}>
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
              value={editionUpdateUI}
              onChange={e => {
                setEditionUpdateUI(e.target.value);
              }}
          />
        </div>
        <div>
          <label>Edition Executor:</label>
          <Input
              value={editionExecutorUpdateUI}
              onChange={e => {
                setEditionExecutorUpdate(e.target.value);
                setEditionExecutorUpdateUI(e.target.value);
              }}
          />
        </div>
        <div>
          <label>Edition Number:</label>
          <Input
              value={editionNumberUpdateUI}
              onChange={e => {
                setEditionNumberUpdateUI(e.target.value);
              }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginTop: 10 }}>Conservation:</label>
          <Select style={{ marginTop: 5 }} value={isConservationUpdateUI} onChange={setIsConservationUpdateUI}>
            {conversationOptions.map((option) => (
              <Option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginTop: 10 }}>Conservation Label:</label>
          <Select style={{ marginTop: 5 }} value={conservationCategoryUpdateUI} onChange={setConservationCategoryUpdateUI}>
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
                // States used to store the new values that would be supplied to update the exiting record
                setDateUpdate("");
                setTechniqueUpdate("");
                setDimensionsUpdate("");
                setLocationUpdate("");
                setSculptureOwnerUpdate("");
                setCategorizationTagUpdate(null);
                setEditionUpdate(null);
                setEditionExecutorUpdate("");
                setEditionNumberUpdate(null);
                setIsConservationUpdate(null);
                setConservationCategoryUpdate(null);

                // States used to store the values provided by the user in the UI fields to be supplied to the record in order to be updated
                // They are only used to display the value in the Update Sculpture section
                setDateUpdateUI("");
                setTechniqueUpdateUI("");
                setDimensionsUpdateUI("");
                setLocationUpdateUI("");
                setSculptureOwnerUpdateUI("");
                setCategorizationTagUpdateUI("");
                setEditionUpdateUI("");
                setEditionExecutorUpdateUI("");
                setEditionNumberUpdateUI("");
                setIsConservationUpdateUI("");
                setConservationCategoryUpdateUI("");
              }
            }).catch(error => {
              console.log(error);
            })
          }}>
          Update Sculpture Record
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
