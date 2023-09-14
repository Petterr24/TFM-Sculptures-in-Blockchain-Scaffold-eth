import { ethers } from "ethers";
import React from "react";
import { Link } from "react-router-dom";

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Home({ yourLocalBalance, readContracts }) {
  const containerStyle = {
    border: "1px solid #cccccc",
    padding: "16px",
    width: "800px",
    margin: "auto",
    marginTop: "64px",
    marginBottom: "16px",
    textAlign: "left",
  };

  const titleStyle = {
    fontSize: "28px",
    color: "green",
  };

  const SectionStyle = {
    fontSize: "20px",
    color: "blue",
  };

  return (
    <div style={containerStyle}>
      <div>
        <div style={{ margin: "32px" }}>
          <span style={titleStyle}>Welcome to Blockchain Sculpture Certification.</span>
        </div>

        <div style={{ margin: "32px" }}>
          <span style={{ marginRight: "8px" }}>🤖</span>
          This is your Ethereum Balance{" "}
          <span style={{ fontWeight: "bold", color: "green" }}>
            ({ethers.utils.formatEther(yourLocalBalance)})
          </span>
        </div>
        <p>There are five tabs available for you to explore:</p>
        <ol>
          <li>
            <strong>
              <Link to="/debug">"Debug Contract"</Link>
            </strong>{" "}
            - This tab allows you to debug the User Authorization and Sculpture Factory smart contracts.
          </li>
          <li>
            <strong>
              <Link to="/userauthorization">"User Authorization"</Link>
            </strong>{" "}
            - Use this tab to manage user authorizations.
          </li>
          <li>
            <strong>
              <Link to="/sculpturefactory">"Sculpture Factory"</Link>
            </strong>{" "}
            - Explore and interact with the Sculpture Factory contract here in order to create new records.
          </li>
          <li>
            <strong>
              <Link to="/sculpture">"Sculpture"</Link>
            </strong>{" "}
            - Access and interact with individual sculpture contracts.
          </li>
        </ol>
        <div style={{ margin: "32px" }}>
          <div style={{ margin: "0px" }}>
            <span style={SectionStyle}>User Authorization</span>
          </div>
          <p>The User Authorization tab allows you to manage user privileges and access control:</p>
          <ul>
            <li>
              <strong>Grant permissions:</strong> Grant permissions for new users to create or update records within the associated Sculpture Factory governance.
            </li>
            <li>
              <strong>Change Authorization Level:</strong> Adjust the authorization level for any user, either increasing or decreasing their privileges.
            </li>
            <li>
              <strong>Remove Authorization:</strong> Completely revoke authorization for a user to create or update records governed by the associated Sculpture Factory.
            </li>
            <li>
              <strong>Transaction History:</strong> View a history of transactions carried out in this contract to grant, change, or remove user permissions.
            </li>
          </ul>
          <p>Use this tab to fine-tune access control and ensure that only authorized users can make changes to the Sculpture Factory's records.</p>
        </div>
        <div style={{ margin: "32px" }}>
          <div style={{ margin: "0px" }}>
            <span style={SectionStyle}>Sculpture Factory</span>
          </div>
          <p>The Sculpture Factory tab allows you to create new sculpture records:</p>
          <ul>
            <li>
              <strong>Create Records:</strong> Use this tab to create new sculpture records within its own governance.
            </li>
            <li>
              <strong>View History:</strong> Explore the list of new sculpture record addresses created using this smart contract.
            </li>
          </ul>
          <p>Use this tab to create sculpture records within the Sculpture Factory's governance.</p>
        </div>
        <div style={{ margin: "32px" }}>
          <div style={{ margin: "0px" }}>
            <span style={SectionStyle}>Sculpture</span>
          </div>
          <p>The Sculpture tab allows you to access and interact with individual sculpture contracts:</p>
          <ul>
            <li>
              <strong>View Record:</strong> Display information for a specific sculpture record belonging to the selected Sculpture Factory by providing its address.
            </li>
            <li>
              <strong>Update Fields:</strong> Modify those allowed fields of any existing record that belongs to the governance of the selected Sculpture Factory.
            </li>
          </ul>
          <p>Use this tab to interact with and manage individual sculpture records.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
