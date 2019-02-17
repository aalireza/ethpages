import {
  EthereumEvent,
  SmartContract,
  EthereumValue,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class NewEmailVerificationRequest extends EthereumEvent {
  get params(): NewEmailVerificationRequestParams {
    return new NewEmailVerificationRequestParams(this);
  }
}

export class NewEmailVerificationRequestParams {
  _event: NewEmailVerificationRequest;

  constructor(event: NewEmailVerificationRequest) {
    this._event = event;
  }

  get userAddress(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get email(): string {
    return this._event.parameters[1].value.toString();
  }
}

export class NewTelegramVerificationRequest extends EthereumEvent {
  get params(): NewTelegramVerificationRequestParams {
    return new NewTelegramVerificationRequestParams(this);
  }
}

export class NewTelegramVerificationRequestParams {
  _event: NewTelegramVerificationRequest;

  constructor(event: NewTelegramVerificationRequest) {
    this._event = event;
  }

  get userAddress(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get telegram(): string {
    return this._event.parameters[1].value.toString();
  }
}

export class UserDataUpdated extends EthereumEvent {
  get params(): UserDataUpdatedParams {
    return new UserDataUpdatedParams(this);
  }
}

export class UserDataUpdatedParams {
  _event: UserDataUpdated;

  constructor(event: UserDataUpdated) {
    this._event = event;
  }

  get userAddress(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get email(): string {
    return this._event.parameters[1].value.toString();
  }

  get name(): string {
    return this._event.parameters[2].value.toString();
  }

  get telegram(): string {
    return this._event.parameters[3].value.toString();
  }
}

export class OwnershipTransferred extends EthereumEvent {
  get params(): OwnershipTransferredParams {
    return new OwnershipTransferredParams(this);
  }
}

export class OwnershipTransferredParams {
  _event: OwnershipTransferred;

  constructor(event: OwnershipTransferred) {
    this._event = event;
  }

  get previousOwner(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get newOwner(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class Keybook__getUserResult {
  value0: string;
  value1: string;
  value2: string;

  constructor(value0: string, value1: string, value2: string) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
  }

  toMap(): TypedMap<string, EthereumValue> {
    let map = new TypedMap<string, EthereumValue>();
    map.set("value0", EthereumValue.fromString(this.value0));
    map.set("value1", EthereumValue.fromString(this.value1));
    map.set("value2", EthereumValue.fromString(this.value2));
    return map;
  }
}

export class Keybook extends SmartContract {
  static bind(address: Address): Keybook {
    return new Keybook("Keybook", address);
  }

  addressIsAVerifier(param0: Address): boolean {
    let result = super.call("addressIsAVerifier", [
      EthereumValue.fromAddress(param0)
    ]);
    return result[0].toBoolean();
  }

  owner(): Address {
    let result = super.call("owner", []);
    return result[0].toAddress();
  }

  isOwner(): boolean {
    let result = super.call("isOwner", []);
    return result[0].toBoolean();
  }

  getEmailForUser(userAddress: Address): string {
    let result = super.call("getEmailForUser", [
      EthereumValue.fromAddress(userAddress)
    ]);
    return result[0].toString();
  }

  getTelegramForUser(userAddress: Address): string {
    let result = super.call("getTelegramForUser", [
      EthereumValue.fromAddress(userAddress)
    ]);
    return result[0].toString();
  }

  getNameForUser(userAddress: Address): string {
    let result = super.call("getNameForUser", [
      EthereumValue.fromAddress(userAddress)
    ]);
    return result[0].toString();
  }

  getUsers(): Array<Address> {
    let result = super.call("getUsers", []);
    return result[0].toAddressArray();
  }

  getUser(addr: Address): Keybook__getUserResult {
    let result = super.call("getUser", [EthereumValue.fromAddress(addr)]);
    return new Keybook__getUserResult(
      result[0].toString(),
      result[1].toString(),
      result[2].toString()
    );
  }

  getNumberOfEmailVerifications(userAddress: Address): BigInt {
    let result = super.call("getNumberOfEmailVerifications", [
      EthereumValue.fromAddress(userAddress)
    ]);
    return result[0].toBigInt();
  }

  getNumberOfTelegramVerifications(userAddress: Address): BigInt {
    let result = super.call("getNumberOfTelegramVerifications", [
      EthereumValue.fromAddress(userAddress)
    ]);
    return result[0].toBigInt();
  }
}
