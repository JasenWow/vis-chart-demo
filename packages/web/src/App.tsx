import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Markdown from "react-markdown";
import { withChartCode, ChartType, Line, Bar } from "@antv/gpt-vis";
import useMCPClient from "./hooks/use-mcp-client";

const CodeBlock = withChartCode({
  components: {
    [ChartType.Line]: Line,
    [ChartType.Bar]: Bar,
  },
});

// markdown 模板内容，使用占位符 `{chartData}`
const markdownTemplate = `
# GPT-VIS \n\nComponents for GPTs, generative AI, and LLM projects. Not only UI Components.

Here’s a visualization of Haidilao's food delivery revenue from 2013 to 2022. You can see a steady increase over the years, with notable *growth* particularly in recent years.

\`\`\`vis-chart
{chartData}
\`\`\`
`;

const RenderChart = () => {
  const { client, transport, isConnected } = useMCPClient();
  const navigate = useNavigate();
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // 解析 URL 查询参数中的 sessionId
    const searchParams = new URLSearchParams(location.search);
    const initialSessionId = searchParams.get("id");
    console.log("Session ID from URL:", initialSessionId);
    // 如果 sessionId 存在，发送请求获取数据
    if (initialSessionId) {
      fetch(`/api/charts/getOne?id=${initialSessionId}`)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          setChartData(data);
        })
        .catch((error) => {
          console.error("Error fetching chart data:", error);
        });
    }
  }, []);

  /** Add your agent logic here */
  const handleGenerateChart = useCallback(async () => {
    if (!client || !transport) {
      console.log("Client or transport not available yet.");
      return;
    }

    try {
      const res = await client.callTool({
        name: "generate_bar_chart",
        arguments: {
          data: [{ category: "2013", value: 59.3 }],
          sessionId: 1,
        },
      });
      const content = res.content as unknown as Array<{
        type: string;
        text: string;
      }>;
      console.log("Generated chart response:", res);

      const newSessionId = content[0].text; // 获取返回的 sessionId

      // 使用新的 sessionId 发送请求获取数据
      fetch(`/api/charts/getOne?id=${newSessionId}`)
        .then((response) => response.json())
        .then((data) => {
          console.log("Fetched new chart data:", data);
          setChartData(data); // 更新图表数据
        })
        .catch((error) => {
          console.error("Error fetching chart data:", error);
        });

      // 更新 URL 查询参数
      navigate(`?id=${newSessionId}`, { replace: true }); // 更新 URL 中的查询参数
    } catch (error) {
      console.error("Error generating chart:", error);
    }
  }, [client, transport, navigate]);

  if (!chartData) {
    return (
      <div>
        <button onClick={handleGenerateChart}>Generate Line Chart</button>
        <div>Loading chart data...</div>
      </div>
    );
  }

  // 格式化模板，将 {chartData} 替换为实际的 JSON 数据
  const updatedMarkdown = markdownTemplate.replace(
    "{chartData}",
    JSON.stringify(chartData, null, 2) // 格式化 JSON 为美观的字符串
  );

  return (
    <div>
      {isConnected ? (
        <div>
          <button onClick={handleGenerateChart}>Generate Line Chart</button>
          <Markdown
            components={{ code: CodeBlock }}
            children={updatedMarkdown}
          />
        </div>
      ) : (
        <div>Connecting to MCP...</div>
      )}
    </div>
  );
};

export default RenderChart;
