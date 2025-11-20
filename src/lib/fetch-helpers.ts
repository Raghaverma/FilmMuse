export async function safeJsonParse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");
  
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    throw new Error(`Expected JSON but got ${contentType}. Response: ${text.substring(0, 100)}`);
  }
  
  if (!response.ok) {
    const text = await response.text();
    let errorMessage = `HTTP ${response.status}`;
    try {
      const json = JSON.parse(text);
      errorMessage = json.error || json.message || errorMessage;
    } catch {
      // Not JSON, use text or status
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
}

export async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.message || `HTTP ${response.status}`);
    } else {
      const text = await response.text().catch(() => "");
      throw new Error(`HTTP ${response.status}: ${text.substring(0, 100)}`);
    }
  }
  
  return response;
}

