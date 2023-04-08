// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./SculptureLibrary.sol";
import "./UserAuthorization.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract SculptureFactory {

    // Singleton to allow only creating one Instance of this Smart Contract
    address private s_SculptureFactory;

    // Stores the addresses of the deployed SC (records)
    address[] private sculptures;

    // UserAuthorization instance
    UserAuthorization userAuthorizationInstance;

    event NewSculpture(address sculpture);

    constructor(address _userAuthorizationAddress) {
        // Checks if an instance of this Smart Contract already exists
        require(s_SculptureFactory == address(0), "The Instance of this Smart Contract already exists");

        //TODO: checks if the address is a correct SC address
        userAuthorizationInstance = UserAuthorization(_userAuthorizationAddress);

        // Checks if the user to deploy this SC is an admin user
        require(userAuthorizationInstance.isAdminUser(msg.sender), "You are not authorized to deploy this SC");

        // Sets the Instance address to the address of the contract
        s_SculptureFactory = address(this);
    }

    function createSculpture(
        SculptureLibrary.PersistentData memory _persistentData,
        SculptureLibrary.MiscellaneousData memory _miscData,
        SculptureLibrary.EditionData memory _editionData,
        SculptureLibrary.ConservationData memory _conservationData,
        string memory _sculptureOwner
    ) external payable returns (address) {
        // This function can only be used by the root Factory SC
        require(s_SculptureFactory == address(this));
        
        // Checks if the user is an Admin user
        require(userAuthorizationInstance.isAuthorizedToCreate(msg.sender) == true, "Your are not authorized to create a record.");

        require(parseSculptureData(_persistentData, _miscData, _editionData, _conservationData, _sculptureOwner) == true);

        address newSculptureAddress = address(new Sculpture{value: msg.value}(_persistentData, _miscData, _editionData, _conservationData, _sculptureOwner, address(userAuthorizationInstance), address(this)));

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
        require(SculptureLibrary.checkMaxStringLength(_editionData.editionExecutor) == true, "The Edition Excutor field exceeds the maximum string length!");
        require(SculptureLibrary.isConservationLabelValid(_conservationData.conservationLabel) == true, "The Conservation Label is not a valid value!");
        require(SculptureLibrary.checkMaxStringLength(_sculptureOwner) == true, "The Sculpture Owner field exceeds the maximum string length!");

        return true;
    }
}

contract Sculpture {
    // UserAuthorization instance
    UserAuthorization userAuthorizationInstance;

    // SculptureFactory instance (parent)
    SculptureFactory sculptureFactoryInstance;

    // UNIX Time of the last unit modification
    uint256 public lastChangeTimestamp;

    // Strings library from OpenZeppelin
    using Strings for uint256;

    // The owner must be encrypted in the REST API before sending so that it is protected against miners
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
        address _userAuthorizationAddress,
        address _sculptureFactoryAddress
    ) payable {
        require(_userAuthorizationAddress != address(0), "Invalid UserAuthorization SC address!");
        require(_sculptureFactoryAddress != address(0), "Invalid SculptureFactory SC address!");

        userAuthorizationInstance = UserAuthorization(_userAuthorizationAddress);
        sculptureFactoryInstance = SculptureFactory(_sculptureFactoryAddress);

        require(userAuthorizationInstance.isUserAuthorizationSC(_userAuthorizationAddress) == true, "This address does not belong to the UserAuthorization SC!");
        require(sculptureFactoryInstance.isSculptureFactory(_sculptureFactoryAddress) == true, "This address does not belong to the SculptureFactory SC!");

        persistentData = _persistentData;
        miscData = _miscData;
        editionData = _editionData;
        conservationData = _conservationData;
        sculptureOwner = _sculptureOwner;
    }

    struct UpdatedSculptureData {
        string date;
        string technique;
        string dimensions;
        string location;
        string categorizationLabel;
        string edition;
        string editionExecutor;
        string editionNumber;
        string sculptureOwner;
    }

    function getSculptureData() public view returns (
        SculptureLibrary.PersistentData memory,
        SculptureLibrary.MiscellaneousData memory,
        SculptureLibrary.EditionData memory,
        SculptureLibrary.ConservationData memory
    ) {
        return (persistentData, miscData, editionData, conservationData);
    }

    event SculptureUpdated(uint256 timestamp, address authorizedModifier, UpdatedSculptureData updatedData);

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
        require(userAuthorizationInstance.isAuthorizedToUpdate(msg.sender) == true, "Your are not authorized to update a record.");

        // Initializes the updated data struct
        UpdatedSculptureData memory updatedData = UpdatedSculptureData(
            "Not updated",
            "Not updated",
            "Not updated",
            "Not updated",
            "Not updated",
            "Not updated",
            "Not updated",
            "Not updated",
            "Not updated"
        );

        if (bytes(_date).length > 0) {
            require(SculptureLibrary.isValidDate(_date) == true, "The Date field is wrong. Two different options are possible, example:'c.1990' for an aproximate date or just 1990!");

            miscData.date = _date;
            updatedData.date = _date;
        }

        if (bytes(_technique).length > 0) {
            require(SculptureLibrary.checkMaxStringLength(_technique) == true, "The Technique field exceeds the maximum string length!");

            miscData.technique = _technique;
            updatedData.technique = _technique;
        }

        if (bytes(_dimensions).length > 0) {
            require(SculptureLibrary.checkMaxStringLength(_dimensions) == true, "The Dimensions field exceeds the maximum string length!");

            miscData.dimensions = _dimensions;
            updatedData.dimensions = _dimensions;
        }

        if (bytes(_location).length > 0) {
            require(SculptureLibrary.checkMaxStringLength(_location) == true, "The Location field exceeds the maximum string length!");

            miscData.location = _location;
            updatedData.location = _location;
        }

        if ((_categorizationLabel != uint8(SculptureLibrary.CategorizationLabel.NONE)) && SculptureLibrary.isCategorizationLabelValid(_categorizationLabel)) {
            miscData.categorizationLabel = _categorizationLabel;
            updatedData.categorizationLabel = SculptureLibrary.getCategorizationLabelAsString(_categorizationLabel);
        }

        // TODO: check what would happen when this value is not provided
        if (_edition !=  editionData.edition) {
            editionData.edition = _edition;
            updatedData.edition = _edition.toString();
        }

        if (bytes(_editionExecutor).length > 0) {
            require(SculptureLibrary.checkMaxStringLength(_editionExecutor) == true, "The Edition Excutor field exceeds the maximum string length!");

            editionData.editionExecutor = _editionExecutor;
            updatedData.editionExecutor = _editionExecutor;
        }

        // TODO: check what would happen when this value is not provided
        if (_editionNumber !=  editionData.editionNumber) {
            editionData.editionNumber = _editionNumber;
            updatedData.editionNumber = _editionNumber.toString();
        }

        if (bytes(_sculptureOwner).length > 0) {
            require(SculptureLibrary.checkMaxStringLength(_sculptureOwner) == true, "The Sculpture Owner field exceeds the maximum string length!");

            sculptureOwner = _sculptureOwner;
            // Avoid displaying the Sclupture Owner for confidentiality purposes. Just to notify that this value has been updated
            updatedData.sculptureOwner = "Updated";
        }

        lastChangeTimestamp = block.timestamp;
        emit SculptureUpdated(lastChangeTimestamp, msg.sender, updatedData);
    }
}