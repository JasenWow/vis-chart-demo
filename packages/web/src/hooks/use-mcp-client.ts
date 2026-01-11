import { useState, useEffect } from "react";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const useMCPClient = () => {
  const [client, setClient] = useState<Client | null>(null);
  const [transport, setTransport] =
    useState<StreamableHTTPClientTransport | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newClient = new Client({ name: "bun-client", version: "1.0.0" });
    const newTransport = new StreamableHTTPClientTransport(
      new URL(import.meta.env.VITE_MCP_SERVER_CHART_URL)
    );

    const connectClient = async () => {
      try {
        await newClient.connect(newTransport);
        console.log("Connected to MCP");
        setIsConnected(true);
        setClient(newClient);
        setTransport(newTransport);
      } catch (error) {
        console.error("Error connecting to MCP:", error);
      }
    };

    connectClient();

    return () => {
      newClient.close().then(() => {
        console.log("Connection closed");
        setIsConnected(false);
      });
    };
  }, []);

  return { client, transport, isConnected };
};

export default useMCPClient;
