import axios from 'axios';

export default class UserService {
  private readonly _baseUrl: string;

  public constructor(host: string, port: number) {
    this._baseUrl = `http://${host}:${port}/user-service`;
  }

  public async fetchAccessTokenPublicKey(): Promise<string> {
    return (await axios.get(`${this._baseUrl}/access-token-public-key`)).data;
  }
}
