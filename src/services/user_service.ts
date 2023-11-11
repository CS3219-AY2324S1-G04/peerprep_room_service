/**
 * @file Defines {@link UserService}.
 */
import axios from 'axios';

/** Handles communication with the user service. */
export default class UserService {
  private readonly _baseUrl: string;

  /**
   * @param host - Address of the user service host.
   * @param port - Port the user service host is listening on.
   */
  public constructor(host: string, port: number) {
    this._baseUrl = `http://${host}:${port}/user-service`;
  }

  /**
   * Fetches the public key for verifying access tokens.
   * @returns Public key for verifying access tokens.
   */
  public async fetchAccessTokenPublicKey(): Promise<string> {
    return (await axios.get(`${this._baseUrl}/access-token-public-key`)).data;
  }
}
