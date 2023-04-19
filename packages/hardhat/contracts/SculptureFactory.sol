// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./SculptureLibrary.sol";
import "./UserAuthorisation.sol";

contract SculptureFactory {

    // Stores the addresses of the deployed SC (records)
    address[] private sculptures;

    // UserAuthorisation instance
    UserAuthorisation userAuthorisationInstance;

    event NewSculpture(address sculpture);

    constructor(address _userAuthorisationAddress) {

        //TODO: checks if the address is a correct SC address
        userAuthorisationInstance = UserAuthorisation(_userAuthorisationAddress);

        // Checks if the user to deploy this SC is an admin user
        require(userAuthorisationInstance.isAdminUser(msg.sender), "You are not authorised to deploy this SC");
    }

    function createSculpture(
        SculptureLibrary.PersistentData memory _persistentData,
        SculptureLibrary.MiscellaneousData memory _miscData,
        SculptureLibrary.EditionData memory _editionData,
        SculptureLibrary.ConservationData memory _conservationData,
        string memory _sculptureOwner
    ) external payable returns (address) {
        // Checks if the user is an Admin user
        require(userAuthorisationInstance.isAuthorisedToCreate(msg.sender) == true, "Your are not authorised to create a record.");

        require(parseSculptureData(_persistentData, _miscData, _editionData, _conservationData, _sculptureOwner) == true);

        address newSculptureAddress = address(new Sculpture{value: msg.value}(_persistentData, _miscData, _editionData, _conservationData, _sculptureOwner, address(userAuthorisationInstance), address(this)));

        // Emit the new Sculpture address
        emit NewSculpture(newSculptureAddress);

        sculptures.push(newSculptureAddress);

        return newSculptureAddress;
    }

    function isSculptureFactory(address addr) public view returns (bool) {
        return addr == address(this);
    }

    function getSculptures() public view returns (address[] memory) {
        return sculptures;
    }

    function parseSculptureData(SculptureLibrary.PersistentData memory _persistentData,
        SculptureLibrary.MiscellaneousData memory _miscData,
        SculptureLibrary.EditionData memory _editionData,
        SculptureLibrary.ConservationData memory _conservationData,
        string memory _sculptureOwner
    ) private pure returns (bool) {
        require(SculptureLibrary.checkMaxStringLength(_persistentData.name) == true, "The Sculpture name field exceeds the maximum string length!");
        require(SculptureLibrary.checkMaxStringLength(_persistentData.artist) == true, "The Artits field exceeds the maximum string length!");
        require(SculptureLibrary.checkMaxStringLength(_persistentData.criticalCatalogNumber) == true, "The Critical Catalog Number field exceeds the maximum string length!");
        require(SculptureLibrary.isValidDate(_miscData.date) == true, "The Date field is wrong. Two different options are possible, example:'c.1990' for an aproximate date or just 1990!");
        require(SculptureLibrary.checkMaxStringLength(_miscData.technique) == true, "The Technique field exceeds the maximum string length!");
        require(SculptureLibrary.checkMaxStringLength(_miscData.dimensions) == true, "The Dimensions field exceeds the maximum string length!");
        require(SculptureLibrary.checkMaxStringLength(_miscData.location) == true, "The Location field exceeds the maximum string length!");
        require(SculptureLibrary.isCategorizationLabelValid(_miscData.categorizationLabel) == true, "The Categorizatoin Label is not a valid value!");
        require(SculptureLibrary.isEditionDataValid(_miscData.categorizationLabel, _editionData) == true, "The Edition options are only required when the categorization label is Authorised reproduction, exhibition copy, technical copy or digital copy!");
        require(SculptureLibrary.checkMaxStringLength(_editionData.editionExecutor) == true, "The Edition Excutor field exceeds the maximum string length!");
        require(SculptureLibrary.isConservationLabelValid(_conservationData.conservationLabel) == true, "The Conservation Label is not a valid value!");
        require(SculptureLibrary.checkMaxStringLength(_sculptureOwner) == true, "The Sculpture Owner field exceeds the maximum string length!");

        return true;
    }
}

contract Sculpture {
    // UserAuthorisation instance
    UserAuthorisation userAuthorisationInstance;

    // SculptureFactory instance (parent)
    SculptureFactory sculptureFactoryInstance;

    // UNIX Time of the last unit modification
    uint256 public lastChangeTimestamp;

    // The owner should be encrypted in in the backend before sending so that it is protected against miners
    // As agreed, for now, this field will be in plain format but we keep it as private
    string private sculptureOwner;

    // Sculpture data
    SculptureLibrary.PersistentData public persistentData;
    SculptureLibrary.MiscellaneousData public miscData;
    SculptureLibrary.EditionData public editionData;
    SculptureLibrary.ConservationData public conservationData;

    constructor(
        SculptureLibrary.PersistentData memory _persistentData,
        SculptureLibrary.MiscellaneousData memory _miscData,
        SculptureLibrary.EditionData memory _editionData,
        SculptureLibrary.ConservationData memory _conservationData,
        string memory _sculptureOwner,
        address _userAuthorisationAddress,
        address _sculptureFactoryAddress
    ) payable {
        require(_userAuthorisationAddress != address(0), "Invalid UserAuthorisation SC address!");
        require(_sculptureFactoryAddress != address(0), "Invalid SculptureFactory SC address!");

        userAuthorisationInstance = UserAuthorisation(_userAuthorisationAddress);
        sculptureFactoryInstance = SculptureFactory(_sculptureFactoryAddress);

        require(userAuthorisationInstance.isUserAuthorisationSC(_userAuthorisationAddress) == true, "This address does not belong to the UserAuthorisation SC!");
        require(sculptureFactoryInstance.isSculptureFactory(_sculptureFactoryAddress) == true, "This address does not belong to the SculptureFactory SC!");

        persistentData = _persistentData;
        miscData = _miscData;
        editionData = _editionData;
        sculptureOwner = _sculptureOwner;

        // Stores the Conservation information depending on the 'Conservation' option
        conservationData.conservation = _conservationData.conservation;
        if (_conservationData.conservation) {
            conservationData.conservationLabel = _conservationData.conservationLabel;
        } else {
            conservationData.conservationLabel = uint8(SculptureLibrary.ConservationLabel.NONE);
        }
    }

    function getSculptureData() public view returns (
        SculptureLibrary.PersistentData memory,
        SculptureLibrary.MiscellaneousData memory,
        SculptureLibrary.EditionData memory,
        SculptureLibrary.ConservationData memory,
        string memory
    ) {
        return (persistentData, miscData, editionData, conservationData, sculptureOwner);
    }

    event SculptureUpdated(uint256 timestamp, address authorisedModifier, string info);

    function updateSculpture(
        string memory _date,
        string memory _technique,
        string memory _dimensions,
        string memory _location,
        uint8 _categorizationLabel,
        uint256 _edition,
        string memory _editionExecutor,
        uint256 _editionNumber,
        string memory _sculptureOwner
    ) public {
        // Checks if the user has privileges to update the data
        require(userAuthorisationInstance.isAuthorisedToUpdate(msg.sender) == true, "Your are not authorised to update a record.");

        if (bytes(_date).length > 0) {
            require(SculptureLibrary.isValidDate(_date) == true, "The Date field is wrong. Two different options are possible, example:'c.1990' for an aproximate date or just 1990!");

            miscData.date = _date;
        }

        if (bytes(_technique).length > 0) {
            require(SculptureLibrary.checkMaxStringLength(_technique) == true, "The Technique field exceeds the maximum string length!");

            miscData.technique = _technique;
        }

        if (bytes(_dimensions).length > 0) {
            require(SculptureLibrary.checkMaxStringLength(_dimensions) == true, "The Dimensions field exceeds the maximum string length!");

            miscData.dimensions = _dimensions;
        }

        if (bytes(_location).length > 0) {
            require(SculptureLibrary.checkMaxStringLength(_location) == true, "The Location field exceeds the maximum string length!");

            miscData.location = _location;
        }

        if (_categorizationLabel != uint8(SculptureLibrary.CategorizationLabel.NONE)) {
            require(SculptureLibrary.isCategorizationLabelValid(_categorizationLabel) == true, "The Categorizatoin Label is not a valid value!");

            miscData.categorizationLabel = _categorizationLabel;
        }

        // Only update the Edition data when the categorization label is one of the available options to store this information. Otherwise, ignore this data
        if ((miscData.categorizationLabel == uint8(SculptureLibrary.CategorizationLabel.AUTHORISED_REPRODUCTION))
                || (miscData.categorizationLabel == uint8(SculptureLibrary.CategorizationLabel.AUTHORISED_EXHIBITION_COPY))
                || (miscData.categorizationLabel == uint8(SculptureLibrary.CategorizationLabel.AUTHORISED_TECHNICAL_COPY))
                || (miscData.categorizationLabel == uint8(SculptureLibrary.CategorizationLabel.AUTHORISED_DIGITAL_COPY))) {

            if (_edition !=  editionData.edition) {
                editionData.edition = _edition;
            }

            if (bytes(_editionExecutor).length > 0) {
                require(SculptureLibrary.checkMaxStringLength(_editionExecutor) == true, "The Edition Excutor field exceeds the maximum string length!");

                editionData.editionExecutor = _editionExecutor;
            }

            // TODO: Clarify if conservation data can be updated or not
            if (_editionNumber !=  editionData.editionNumber) {
                editionData.editionNumber = _editionNumber;
            }
        }

        if (bytes(_sculptureOwner).length > 0) {
            require(SculptureLibrary.checkMaxStringLength(_sculptureOwner) == true, "The Sculpture Owner field exceeds the maximum string length!");

            sculptureOwner = _sculptureOwner;
        }

        lastChangeTimestamp = block.timestamp;
        emit SculptureUpdated(lastChangeTimestamp, msg.sender, "Sculpture data updated successfully");
    }
}