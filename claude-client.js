class ClaudeClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://api.anthropic.com";
    this.model = "claude-3-5-sonnet-20241022";
  }

  async makeRequest(messages, maxTokens = 1000) {
    const response = await fetch(`${this.baseUrl}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: maxTokens,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  async testConnection() {
    try {
      await this.makeRequest([{ role: "user", content: "Hello" }], 10);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async summarizeTranscript(transcript) {
    const messages = [
      {
        role: "user",
        content: `Please provide a concise summary of the following transcript from a tl;dv recording:\n\n${transcript}`,
      },
    ];

    return await this.makeRequest(messages, 1000);
  }
}
