import { useState, useEffect } from "react";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

// 自定义 Hook 用于初始化和返回 MCP 客户端和 transport
const useMCPClient = () => {
  const [client, setClient] = useState<Client | null>(null);
  const [transport, setTransport] = useState<StreamableHTTPClientTransport | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newClient = new Client({ name: "bun-client", version: "1.0.0" });
    const newTransport = new StreamableHTTPClientTransport(
      new URL("http://localhost:1123/mcp")
    );

    // 连接 client
    const connectClient = async () => {
      try {
        await newClient.connect(newTransport);
        console.log("Connected to MCP");
        setIsConnected(true); // 连接成功后更新状态
        setClient(newClient);  // 更新客户端
        setTransport(newTransport);  // 更新 transport
      } catch (error) {
        console.error("Error connecting to MCP:", error);
      }
    };

    connectClient(); // 调用异步函数进行连接

    // 清理连接
    return () => {
      newClient.close().then(() => {
        console.log("Connection closed");
        setIsConnected(false);
      });
    };
  }, []); // 只在组件挂载时执行一次

  return { client, transport, isConnected };
};

export default useMCPClient;
