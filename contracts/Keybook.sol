pragma solidity ^0.5.4;

import {Ownable} from "./Ownable.sol";


contract Keybook is Ownable {

    mapping(address => bool) public addressIsAVerifier;

    struct User {
        string email;
        string name;
        string phoneNumber;
        string pgpKey;
        string twitter;
        string website;
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
    function getPhoneForUser(address userAddress) public view returns (string memory) {
        return addressToUser[userAddress].phoneNumber;
    }
    function getPgpKeyForUser(address userAddress) public view returns (string memory) {
        return addressToUser[userAddress].pgpKey;
    }
    function getTwitterForUser(address userAddress) public view returns (string memory) {
        return addressToUser[userAddress].twitter;
    }
    function getWebsiteForUser(address userAddress) public view returns (string memory) {
        return addressToUser[userAddress].website;
    }

    function makeUser(string memory email,
                      string memory name,
                      string memory phoneNumber,
                      string memory pgpKey,
                      string memory twitter,
                      string memory website,
                      string memory telegram) public {
        address[] memory emptyArray;
        User memory newUser = User(email, name, phoneNumber, pgpKey, twitter, website, telegram, emptyArray, emptyArray);
        addressToUser[msg.sender] = newUser;
        if (bytes(email).length > 0){
            emit NewEmailVerificationRequest(msg.sender, email);
        }
        if (bytes(telegram).length > 0){
            emit NewTelegramVerificationRequest(msg.sender, telegram);
        }
    }

    function verifyEmail(address userAddress, uint8 v, bytes32 r, bytes32 s) public {
        User storage verifyingUser = addressToUser[userAddress];

        bytes32 dataToSign = keccak256(abi.encodePacked(userAddress, verifyingUser.email));
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHash = keccak256(abi.encodePacked( prefix, "email: ", dataToSign));
        address verifier = ecrecover(prefixedHash, v, r, s);
        require(addressIsAVerifier[verifier]);
        verifyingUser.emailVerifiedByAddresses.push(verifier);
    }

    function verifyTelegram(address userAddress, uint8 v, bytes32 r, bytes32 s) public {
        User storage verifyingUser = addressToUser[userAddress];

        bytes32 dataToSign = keccak256(abi.encodePacked(userAddress, verifyingUser.telegram));
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHash = keccak256(abi.encodePacked( prefix, "telegram: ", dataToSign));
        address verifier = ecrecover(prefixedHash, v, r, s);
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
