export class BackendClient {
  constructor({ baseUrl, apiKey, logger }) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.logger = logger;
  }

  async fetchGroups() {
    const response = await fetch(`${this.baseUrl}/groups`, {
      headers: {
        accept: 'application/json',
        ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {})
      }
    });

    if (!response.ok) {
      throw new Error(`Backend /groups failed with ${response.status}`);
    }

    const data = await response.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.groups)) return data.groups;
    if (Array.isArray(data.data)) return data.data;
    throw new Error('Backend response must be an array or contain groups/data array');
  }
}

