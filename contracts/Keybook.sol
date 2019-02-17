pragma solidity ^0.5.4;

import {Ownable} from "./Ownable.sol";


contract Keybook is Ownable {

    mapping(address => bool) public addressIsAVerifier;

    struct User {
        string email;
        string name;
        /* string phoneNumber; */
        /* string pgpKey; */
        /* string twitter; */
        /* string website; */
        string telegram;
        address[] emailVerifiedByAddresses;
        address[] telegramVerifiedByAddresses;
    }

    event NewEmailVerificationRequest(
        address userAddress,
        string email
    );

    event NewTelegramVerificationRequest(
        address userAddress,
        string telegram
    );


    mapping(address => User) addressToUser;


    function requestEmailVerification() public {
       string memory email = addressToUser[msg.sender].email;
       require(bytes(email).length > 0);
       emit NewEmailVerificationRequest(msg.sender, email);
    }

    function requestTelegramVerification() public {
       string memory telegram = addressToUser[msg.sender].telegram;
       require(bytes(telegram).length > 0);
       emit NewTelegramVerificationRequest(msg.sender, telegram);
    }

    function getEmailForUser(address userAddress) public view returns (string memory) {
        return addressToUser[userAddress].email;
    }
    function getTelegramForUser(address userAddress) public view returns (string memory) {
        return addressToUser[userAddress].telegram;
    }
    function getNameForUser(address userAddress) public view returns (string memory) {
        return addressToUser[userAddress].name;
    }
    /* function getPhoneForUser(address userAddress) public view returns (string memory) { */
    /*     return addressToUser[userAddress].phoneNumber; */
    /* } */
    /* function getPgpKeyForUser(address userAddress) public view returns (string memory) { */
    /*     return addressToUser[userAddress].pgpKey; */
    /* } */
    /* function getTwitterForUser(address userAddress) public view returns (string memory) { */
    /*     return addressToUser[userAddress].twitter; */
    /* } */
    /* function getWebsiteForUser(address userAddress) public view returns (string memory) { */
    /*     return addressToUser[userAddress].website; */
    /* } */

    function makeUser(string memory email,
                      string memory name,
                      /* string memory phoneNumber, */
                      /* string memory pgpKey, */
                      /* string memory twitter, */
                      /* string memory website, */
                      string memory telegram) public {
        address[] memory emptyArray;
        User memory newUser = User(email, name, telegram, emptyArray, emptyArray);
        addressToUser[msg.sender] = newUser;
        if (bytes(email).length > 0){
            emit NewEmailVerificationRequest(msg.sender, email);
        }
        if (bytes(telegram).length > 0){
            emit NewTelegramVerificationRequest(msg.sender, telegram);
        }
    }



    uint256 constant N  = 115792089210356248762697446949407573529996955224135760342422259061068512044369;
    //This is the curve order for spec256k

    function recover(bytes32 hash, bytes memory sig) internal pure returns(address){
        hash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));

        bytes32 r;
        bytes32 s;
        uint8 v;

        if (sig.length != 65) return address(0);

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }

        if (v < 27) {
          v += 27;
        }

        if (v != 27 && v != 28) return address(0);

        require(uint(s) < N/2); //We define that the lower s version of the signature is the valid one

        return ecrecover(hash, v, r, s);
    }


    function verifyEmail(address userAddress, bytes memory _sig) public {
        User storage verifyingUser = addressToUser[userAddress];
        bytes32 dataToSign = keccak256(abi.encodePacked(userAddress, "email: ", verifyingUser.email));
        address verifier = recover(dataToSign, _sig);
        require(addressIsAVerifier[verifier]);
        verifyingUser.emailVerifiedByAddresses.push(verifier);
    }

    function verifyTelegram(address userAddress, bytes memory _sig) public {
        User storage verifyingUser = addressToUser[userAddress];

        bytes32 dataToSign = keccak256(abi.encodePacked(userAddress, "telegram: ", verifyingUser.telegram));
        address verifier = recover(dataToSign, _sig);
        require(addressIsAVerifier[verifier]);
        verifyingUser.telegramVerifiedByAddresses.push(verifier);
    }

    function addVerifier(address newVerifier) public onlyOwner {
        addressIsAVerifier[newVerifier] = true;
    }

    function removeVerifier(address verifierToRemove) public onlyOwner {
        addressIsAVerifier[verifierToRemove] = false;
    }
}
