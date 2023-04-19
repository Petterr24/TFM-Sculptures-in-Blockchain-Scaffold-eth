// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

library SculptureLibrary {

    enum CategorizationLabel {
        NONE,
        AUTHORISED_UNIQUE_WORK, 
        AUTHORISED_UNIQUE_WORK_VARIATION, 
        AUTHORISED_WORK, 
        AUTHORISED_MULTIPLE, 
        AUTHORISED_CAST, 
        POSTHUMOUS_WORK_AUTHORISED_BY_ARTIST, 
        POSTHUMOUS_WORK_AUTHORISED_BY_RIGHTSHOLDERS, 
        AUTHORISED_REPRODUCTION, 
        AUTHORISED_EXHIBITION_COPY, 
        AUTHORISED_TECHNICAL_COPY, 
        AUTHORISED_DIGITAL_COPY 
    }
    
    enum ConservationLabel {
        NONE,
        AUTHORISED_RECONSTRUCTION,
        AUTHORISED_RESTORATION,
        AUTHORISED_EPHEMERAL_WORK
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

    function isCategorizationLabelValid(uint8 _label) internal pure returns (bool) {
        return (_label >= uint8(CategorizationLabel.AUTHORISED_UNIQUE_WORK) && _label <= uint8(CategorizationLabel.AUTHORISED_DIGITAL_COPY));
    }

    function isEditionDataValid(uint8 _categorizationLabel, EditionData memory _editionData) internal pure returns (bool) {
        bytes memory editionExecutorBytes = bytes(_editionData.editionExecutor);
        if ((_editionData.edition != 0) || (_editionData.editionNumber != 0) || ((editionExecutorBytes.length == 1) && (editionExecutorBytes[0] != "-")) || (editionExecutorBytes.length > 1)) {
            // Edition Data is only available for the following categorization labels
            if ((_categorizationLabel == uint8(CategorizationLabel.AUTHORISED_REPRODUCTION))
                    || (_categorizationLabel == uint8(CategorizationLabel.AUTHORISED_EXHIBITION_COPY))
                    || (_categorizationLabel == uint8(CategorizationLabel.AUTHORISED_TECHNICAL_COPY))
                    || (_categorizationLabel == uint8(CategorizationLabel.AUTHORISED_DIGITAL_COPY))) {
                return true;
            } else {
                return false;
            }
        }

        return true;
    }

    function isConservationLabelValid(uint8 _label) internal pure returns (bool) {
        return (_label >= uint8(ConservationLabel.NONE) && _label <= uint8(ConservationLabel.AUTHORISED_EPHEMERAL_WORK));
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
        } else if (strBytes.length == 9 || strBytes.length == 11) {
            // Parse data for a Date value such as "1990-1992" or "1990 - 1992". Both are valid
            // Check format of string using ASCII table
            for (uint i = 0; i < strBytes.length; i++) {
                // Check the digits
                if ((i < 4 || i > (strBytes.length - 5)) && (uint8(strBytes[i]) < 48 || uint8(strBytes[i]) > 57)) {
                    return false;
                }

                // Check the hypen for "1990-1992"
                if ((strBytes.length == 9) && (i == 4) && (strBytes[i] != "-")) {
                    return false;
                }

                // Check the hypen and whitespaces for "1990 - 1992"
                if ((strBytes.length == 11) && (i > 3 || i < 7)) {
                    // Check the two whitespaces
                    if ((i == 4 || i == 6) && uint8(strBytes[i]) != 32) {
                        return false;
                    }

                    if (i == 5 && strBytes[i] != "-") {
                        return false;
                    }
                }
            }

            return true;
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