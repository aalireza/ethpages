pragma solidity ^0.5.4;

contract Keybook {

    mapping(address => bool) public addressIsAVerifier;

    struct User {
        string email;
        string name;
        string phoneNumber;
        string pgpKey;
        string twitter;
        string website;
        
        address[] emailVerifiedByAddresses;
    }


    mapping(address => User) addressToUser;
    
    
    function getUserByAddress(address userAddress) private view returns (User memory) {
        return addressToUser[userAddress];
    }
    
    function getEmailForUser(address userAddress) public view returns (string memory){
        return getUserByAddress(userAddress).email;
    }
    function getNameForUser(address userAddress) public view returns (string memory){
        return getUserByAddress(userAddress).name;
    }
    function getPhoneForUser(address userAddress) public view returns (string memory){
        return getUserByAddress(userAddress).phoneNumber;
    }
    function getPgpKeyForUser(address userAddress) public view returns (string memory){
        return getUserByAddress(userAddress).pgpKey;
    }
    function getTwitterForUser(address userAddress) public view returns (string memory){
        return getUserByAddress(userAddress).twitter;
    }
    function getWebsiteForUser(address userAddress) public view returns (string memory){
        return getUserByAddress(userAddress).website;
    }
    

    function makeUser(  string memory email,
                        string memory name,
                        string memory phoneNumber,
                        string memory pgpKey,
                        string memory twitter,
                        string memory website) public{
        address[] memory dumArray;
        User memory newUser = User(email, name, phoneNumber, pgpKey, twitter, website, dumArray);
        addressToUser[msg.sender] = newUser;
        
        // add event here
    }
    
    function verifyEmail(address userAddress, uint8 v, bytes32 r, bytes32 s) public {
        User storage verifyingUser = addressToUser[userAddress];

        bytes32 dataToSign = keccak256(abi.encodePacked(userAddress, verifyingUser.email));
        
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHash = keccak256(abi.encodePacked( prefix, dataToSign));
        address verifier = ecrecover(prefixedHash, v, r, s);
        
        require(addressIsAVerifier[verifier]);
        verifyingUser.emailVerifiedByAddresses.push(verifier);
    }
    
}
