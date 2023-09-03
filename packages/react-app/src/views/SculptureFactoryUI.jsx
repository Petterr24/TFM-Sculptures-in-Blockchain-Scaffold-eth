import { Button, Divider, Input, Select } from "antd";
import React, { useState, useEffect } from "react";
import { utils } from "ethers";
import { List } from "antd";

import { Address, Balance } from "../components";

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
  // Sculptures addresses to be displayed at the end of the UI
  const [sculptureAddresses, setSculptureAddresses] = useState([]);

  // Categorization label options
  const categorizationLabel = [
    { value: null, label: "Select the categorization label', disabled: true" },
    { value: 0, label: "NONE" },
    { value: 1, label: "AUTHORISED UNIQUE WORK" },
    { value: 2, label: "AUTHORISED UNIQUE WORK VARIATION" },
    { value: 3, label: "AUTHORISED WORK" },
    { value: 4, label: "AUTHORISED MULTIPLE" },
    { value: 5, label: "AUTHORISED CAST" },
    { value: 6, label: "POSTHUMOUS WORK AUTHORISED BY THE ARTIST" },
    { value: 7, label: "POSTHUMOUS WORK AUTHORISED BY THE RIGHTSHOLDERS" },
    { value: 8, label: "AUTHORISED REPRODUCTION" },
    { value: 9, label: "AUTHORISED EXHIBITION COPY" },
    { value: 10, label: "AUTHORISED TECHNICAL COPY" },
    { value: 11, label: "AUTHORISED DIGITAL COPY" },
  ];

  // Conservation label options
  const conservationLabel = [
    { value: null, label: "Select the conservation label", disabled: true },
    { value: 0, label: "NONE" },
    { value: 1, label: "AUTHORISED RECONSTRUCTION" },
    { value: 2, label: "AUTHORISED RESTORATION" },
    { value: 3, label: "AUTHORISED EPHEMERAL WORK" },
  ];

  // Conservation options
  const conversationOptions = [
    { value: null, label: "Select the conservation option", disabled: true },
    { value: false, label: "NO" },
    { value: true, label: "YES" },
  ];

  const { Option } = Select;

  // Persisten data
  const [sculptureName, setSculptureName] = useState("");
  const [artist, setArtist] = useState("");
  const [criticalCatalogNumber, setCriticalCatalogNumber] = useState("");

  // Miscelaneous data
  const [date, setDate] = useState("");
  const [technique, setTechnique] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [location, setLocation] = useState("");
  const [categorizationTag, setCategorizationTag] = useState(0);
  const [categorizationTagUI, setCategorizationTagUI] = useState(null);

  // Edition data
  const [edition, setEdition] = useState(0);
  const [editionExecutor, setEditionExecutor] = useState("-");
  const [editionNumber, setEditionNumber] = useState(0);
  const [editionUI, setEditionUI] = useState(null);
  const [editionExecutorUI, setEditionExecutorUI] = useState("");
  const [editionNumberUI, setEditionNumberUI] = useState(null);

  // Conservation data
  const [isConservation, setIsConservation] = useState(null);
  const [conservationCategory, setConservationCategory] = useState(0);
  const [conservationCategoryUI, setConservationCategoryUI] = useState(null);

  // Create Sculpture Status
  const [creationStatus, setCreationStatus] = useState("");

  // Sculpture owner
  const [sculptureOwner, setSculptureOwner] = useState("");

  // Some input fields
  const fields = [
    { name: "Sculpture Name", value: sculptureName },
    { name: "Artist Name", value: artist },
    { name: "Critical Catalog Number", value: criticalCatalogNumber },
    { name: "Date", value: date },
    { name: "Technique", value: technique },
    { name: "Sculpture Dimensions", value: dimensions },
    { name: "Location", value: location },
    { name: "Categorization Labels", value: categorizationTag },
    { name: "Edition", value: edition },
    { name: "Edition executor", value: editionExecutor },
    { name: "Edition number", value: editionNumber },
    { name: "Conservation options", value: isConservation },
    { name: "Sculpture owner", value: sculptureOwner },
  ];

  /**
   * Using this useEffect to update the Categorization Tag since we want to show an empty value for the Selection (it means null to display "Select the categorization label")
   * And we have to set a defualt value '0' in case of not selecting any Categorization Tag when selecting Conservation.
   * If we try to set to '0' the 'categorizationTag' once the Create button is selected, then it would be necessary to click on that button again because the first loop would be to update this value
   * to '0', since we are using React. The same functionality is used for Edition parameters.
   */
  useEffect(() => {
    // Whenever categorizationTagUI changes, update categorizationTag based on its value
    if (categorizationTagUI != null) {
      setCategorizationTag(categorizationTagUI);
    }
  }, [categorizationTagUI]);

  async function getExistingSculptureAddresses() {
    const addresses = await readContracts.SculptureFactory.getSculptures();
    if (addresses.length > 0) {
      setSculptureAddresses(addresses);
    }
  }

  useEffect(() => {
    if (readContracts && readContracts.SculptureFactory) {
      getExistingSculptureAddresses();
    }
  }, []); // The empty dependency array means this effect only runs once

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

  function checkMaxLength(str) {
    return str.length <= 64;
  }

  function isCorrectCategLabelForEdition() {
    // One of the following categorization labels is required to store information in the edition fields:
    // 'AUTHORISED REPRODUCTION'
    // 'AUTHORISED EXHIBITION COPY'
    // 'AUTHORISED TECHNICAL COPY'
    // 'AUTHORISED DIGITAL COPY'
    return (categorizationTag > 7 && categorizationTag < 12);
  }

  async function createSculpture() {
    // Check that the following fields are provided
    for (const field of fields) {
      if (field.name !== "Conservation options") {
        if (field.name === "Categorization Labels" && !field.value) {
          // This categorization labels list does not include the Conservation labels, so if the Conservation option is set to "YES", then this field shall be empty
          // because the categorization label for that scecific sculpture shall be selected from the Conservation labels
          // The NONE option is set by default as it shall be the option sent when the Conservation option is set to 'YES'
          if (!isConservation) {
            setCreationStatus(`Please choose any of the ${field.name}`);

            return false;
          }
        } else if (field.name === "Edition" || field.name === "Edition number") {
          if (field.value !== 0 && !isCorrectCategLabelForEdition()) {
            setCreationStatus("Edition data can only be provided when using Authorisation reproduction, exhibition copy, technical copy or digital copy for categorization labels.");

            return false;
          }
        } else if (field.name === "Edition executor") {
          if (field.value !== "-" && !isCorrectCategLabelForEdition()) {
            setCreationStatus("Edition data can only be provided when using Authorisation reproduction, exhibition copy, technical copy or digital copy for categorization labels.");

            return false;
          }
        } else if (!field.value) {
          setCreationStatus(`Please introduce the ${field.name}`);

          return false;
        }
      } else if (field.name === "Conservation options" && field.value == null) {
        setCreationStatus(`Please choose any of the ${field.name}`);

        return false;
      }

      if (field.name !== "Edition" && field.name !== "Edition number" && field.name !== "Categorization Labels" && !checkMaxLength(field.value.toString())) {
        setCreationStatus(`The ${field.name} field exceeds the maximum string length of 64 characters`);

        return false;
      }
    }

    if (!isValidDate(date)) {
      setCreationStatus("Invalid date format. Please provide a valid year in the format '1990', 'c.1990', '1990-1992' or '1990 - 1992'");

      return false;
    }

    if (!isDimensionsFieldCorrect(dimensions)) {
      setCreationStatus("Invalid dimensions format. Please provide the dimensions following this format 'LENGTH x WIDTH x HEIGHT'");

      return false;
    }

    if (isConservation && (conservationCategory === null || conservationCategory === 0)) {
      setCreationStatus("Please choose any of the conservation label. NONE is not a valid option if conservation option is 'YES'");

      return false;
    } else if (!isConservation && conservationCategory !== null && conservationCategory !== 0) {
      setCreationStatus("You cannot choose a conservation label if you select the conservation option as 'NO'");

      return false;
    } else if (isConservation && conservationCategory !== null && conservationCategory !== 0 && categorizationTag !== null && categorizationTag !== 0) {
      setCreationStatus("You cannot choose any of the categorization labels if you select the conservation option as 'YES'. You can only select one of the possible conservation labels.");

      return false;
    }

    const persistentData = [sculptureName, artist, criticalCatalogNumber];
    const miscellaneousData = [ date, technique, dimensions, location, categorizationTag];
    const editionData = [edition, editionExecutor, editionNumber];
    const conservationData = [isConservation, conservationCategory];

    try {
      const transaction = await tx(writeContracts.SculptureFactory.createSculpture(persistentData, miscellaneousData, editionData, conservationData, sculptureOwner));
      await transaction.wait();
      setCreationStatus("Sculpture record created successfully");
      getExistingSculptureAddresses();

      return true;
    } catch (err) {
      console.error(err);
      setCreationStatus("Failed to create a Sculpture record");

      return false;
    }
  }

  return (
    <div>
      {/*
        ⚙️ Sculpture Factory User Interface
      */}
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 500, margin: "auto", marginTop: 64 }}>
        <Divider />
        <h2 style={{ fontWeight: "bold", fontSize: "28px" }}>Sculpture Factory</h2>
        <Divider />
        <label>SmartContract Address:</label>
        <Address
          address={readContracts && readContracts.SculptureFactory ? readContracts.SculptureFactory.address : null}
          ensProvider={mainnetProvider}
          fontSize={16}
        />
        <Divider/>
        {/*
          ⚙️ Section: Create new Sculpture
        */}
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
          <label>Dimensions (cm):</label>
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
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginTop: 10 }}>Categorization Label:</label>
          <Select style={{ marginTop: 5 }} value={categorizationTagUI} onChange={setCategorizationTagUI}>
            {categorizationLabel.map(option => (
              <Option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
        <div>
          <label>Edition:</label>
          <Input
            value={editionUI}
            onChange={e => {
              setEdition(e.target.value);
              setEditionUI(e.target.value);
            }}
          />
        </div>
        <div>
          <label>Edition Executor:</label>
          <Input
            value={editionExecutorUI}
            onChange={e => {
              setEditionExecutor(e.target.value);
              setEditionExecutorUI(e.target.value);
            }}
          />
        </div>
        <div>
          <label>Edition Number:</label>
          <Input
            value={editionNumberUI}
            onChange={e => {
              setEditionNumber(e.target.value);
              setEditionNumberUI(e.target.value);
            }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginTop: 10 }}>Conservation:</label>
          <Select style={{ marginTop: 5 }} value={isConservation} onChange={setIsConservation}>
            {conversationOptions.map(option => (
              <Option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginTop: 10 }}>Conservation Label:</label>
          <Select style={{ marginTop: 5 }} value={conservationCategoryUI}
            onChange={value => {
              setConservationCategory(value);
              setConservationCategoryUI(value);
            }}>
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
            createSculpture().then(result => {
                if (result) {
                  setSculptureName("");
                  setArtist("");
                  setCriticalCatalogNumber("");
                  setDate("");
                  setTechnique("");
                  setDimensions("");
                  setLocation("");
                  setCategorizationTag(0);
                  setCategorizationTagUI(null);
                  setEdition(0);
                  setEditionUI(null);
                  setEditionExecutor("-");
                  setEditionExecutorUI("");
                  setEditionNumber(0);
                  setEditionNumberUI(null);
                  setIsConservation(null);
                  setConservationCategory(0);
                  setConservationCategoryUI(null);
                  setSculptureOwner("");
                }
              }).catch(error => {
                console.log(error);
              })
            }}>
          Create Sculpture Record
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
      ⚙️ Section to display the available Sculpture records. Using this approach is better than the Events as they are slower than this new approach.
    */}
    <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      <h2>Sculpture Records:</h2>
      <List
        bordered
        dataSource={sculptureAddresses}
        renderItem={address => {
          return (
            <List.Item key={address}>
              <div>
              <Address
                address={address}
                ensProvider={mainnetProvider}
                fontSize={16}
              /></div>
            </List.Item>
          );
        }}
      />
    </div>
    </div>
  );
}
