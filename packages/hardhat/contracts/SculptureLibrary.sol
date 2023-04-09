// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

library SculptureLibrary {

    enum CategorizationLabel {
        NONE,
        AUTHORIZED_UNIQUE_WORK, 
        AUTHORIZED_UNIQUE_WORK_VARIATION, 
        AUTHORIZED_WORK, 
        AUTHORIZED_MULTIPLE, 
        AUTHORIZED_CAST, 
        POSTHUMOUS_WORK_AUTHORIZED_BY_ARTIST, 
        POSTHUMOUS_WORK_AUTHORIZED_BY_RIGHTSHOLDERS, 
        AUTHORIZED_REPRODUCTION, 
        AUTHORIZED_EXHIBITION_COPY, 
        AUTHORIZED_TECHNICAL_COPY, 
        AUTHORIZED_DIGITAL_COPY 
    }
    
    enum ConservationLabel {
        NONE,
        AUTHORIZED_RECONSTRUCTION,
        AUTHORIZED_RESTORATION,
        AUTHORIZED_EPHEMERAL_WORK
    }

    struct PersistentData {
        string name;
        string artist;
        string criticalCatalogNumber;
    }

    struct MiscellaneousData {
        string date;
        string technique;
        string dimensions;
        string location;
        uint8 categorizationLabel;
    }

    struct EditionData {
        uint256 edition;
        string editionExecutor;
        uint256 editionNumber;
    }

    struct ConservationData {
        bool conservation;
        uint8 conservationLabel;
    }

    function isCategorizationLabelValid(uint8 label) internal pure returns (bool) {
        return (label >= uint8(CategorizationLabel.AUTHORIZED_UNIQUE_WORK) && label <= uint8(CategorizationLabel.AUTHORIZED_DIGITAL_COPY));
    }

    function isConservationLabelValid(uint8 label) internal pure returns (bool) {
        return (label >= uint8(ConservationLabel.NONE) && label <= uint8(ConservationLabel.AUTHORIZED_EPHEMERAL_WORK));
    }

    function getCategorizationLabelAsString(uint8 _enum) internal pure returns (string memory) {
        if (_enum == uint8(CategorizationLabel.AUTHORIZED_UNIQUE_WORK)) {
            return "Authorized unique work";
        } else if (_enum == uint8(CategorizationLabel.AUTHORIZED_UNIQUE_WORK_VARIATION)) {
            return "Authorized unique work variation";
        } else if (_enum == uint8(CategorizationLabel.AUTHORIZED_WORK)) {
            return "Authorized work";
        } else if (_enum == uint8(CategorizationLabel.AUTHORIZED_MULTIPLE)) {
            return "Authorized multiple";
        } else if (_enum == uint8(CategorizationLabel.AUTHORIZED_CAST)) {
            return "Authorized cast";
        } else if (_enum == uint8(CategorizationLabel.POSTHUMOUS_WORK_AUTHORIZED_BY_ARTIST)) {
            return "Posthumous work authorized by artist";
        } else if (_enum == uint8(CategorizationLabel.POSTHUMOUS_WORK_AUTHORIZED_BY_RIGHTSHOLDERS)) {
            return "Posthumous work authorized by rightsholders";
        } else if (_enum == uint8(CategorizationLabel.AUTHORIZED_REPRODUCTION)) {
            return "Authorized reproduction";
        } else if (_enum == uint8(CategorizationLabel.AUTHORIZED_EXHIBITION_COPY)) {
            return "Authorized exhibition copy";
        } else if (_enum == uint8(CategorizationLabel.AUTHORIZED_TECHNICAL_COPY)) {
            return "Authorized technical copy";
        } else if (_enum == uint8(CategorizationLabel.AUTHORIZED_DIGITAL_COPY)) {
            return "Authorized digital copy";
        }

        revert("Invalid Categorization Label");
    }

    function getConservationLabelAsString(ConservationLabel _enum) internal pure returns (string memory) {
        if (_enum == ConservationLabel.AUTHORIZED_RECONSTRUCTION) {
            return "Authorized reconstruction";
        } else if (_enum == ConservationLabel.AUTHORIZED_RESTORATION) {
            return "Authorized restoration";
        } else if (_enum == ConservationLabel.AUTHORIZED_EPHEMERAL_WORK) {
            return "Authorized ephermal work";
        }

        revert("Invalid Conservation Label");
    }

    function isValidDate(string memory _date) internal pure returns (bool) {
        bytes memory strBytes = bytes(_date);
        if (strBytes.length == 6) {
            // Parse data for a Date value such as "c.1993". "c." means aproximately
            for (uint i = 0; i < strBytes.length; i++) {
                if ((i == 0 && strBytes[i] != "c") || (i == 1 && strBytes[i] != ".") || (i > 2 && (uint8(strBytes[i]) < 48 || uint8(strBytes[i]) > 57))) {
                    return false;
                }
            }
        } else if (strBytes.length == 4) {
            // Parse data for a Date value such as "1993" without "c."
            for (uint i = 0; i < strBytes.length; i++) {
                if (i > 0 && (uint8(strBytes[i]) < 48 || uint8(strBytes[i]) > 57)) {
                    return false;
                }
            }
        } else {
            return false;
        }

        // If all checks passed, return true
        return true;
    }

    function checkMaxStringLength(string memory _str) internal pure returns (bool) {
        // Maximum string length accepted to be stored in the SC
        return bytes(_str).length <= 64;
    }
}