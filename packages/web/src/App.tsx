import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Markdown from "react-markdown";
import { withChartCode, ChartType, Line } from "@antv/gpt-vis";
import useMCPClient from "./hooks/use-mcp-client";  // 导入自定义 Hook

const CodeBlock = withChartCode({
  components: { [ChartType.Line]: Line },
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
  const location = useLocation();
  const { client, transport, isConnected } = useMCPClient();  // 使用自定义 Hook 获取 client 和 transport
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // 解析 URL 查询参数中的 sessionId
    const searchParams = new URLSearchParams(location.search);
    const sessionId = searchParams.get("sessionId");

    // 如果 sessionId 存在，发送请求获取数据
    if (sessionId) {
      fetch(`/api/chart-data?sessionId=${sessionId}`)
        .then((response) => response.json())
        .then((data) => {
          setChartData(data);
        })
        .catch((error) => {
          console.error("Error fetching chart data:", error);
        });
    }
  }, [location]);

  const handleGenerateChart = useCallback(async () => {
    if (!client || !transport) {
      console.log("Client or transport not available yet.");
      return;
    }

    try {
      const res = await client.callTool({
        name: "generate_bar_chart",
        arguments: {
          data: [
            {
              category: "分类一",
              value: 10,
            },
          ],
          stack: false,
          style: {},
          theme: "default",
          width: 600,
          height: 400,
          title: "",
          axisXTitle: "",
          axisYTitle: "",
          sessionId: "1",
        },
      });

      console.log("Generated chart response:", res);
      // 处理生成的图表数据，更新 state 或做其他操作
    } catch (error) {
      console.error("Error generating chart:", error);
    }
  }, [client, transport]);

  if (!chartData) {
    return <div>Loading chart data...</div>;
  }

  // 格式化模板，将 {chartData} 替换为实际的 JSON 数据
  const updatedMarkdown = markdownTemplate.replace(
    "{chartData}",
    JSON.stringify(chartData, null, 2)  // 格式化 JSON 为美观的字符串
  );

  return (
    <div>
      {isConnected ? (
        <div>
          <button onClick={handleGenerateChart}>Generate Bar Chart</button>
          <Markdown components={{ code: CodeBlock }} children={updatedMarkdown} />
        </div>
      ) : (
        <div>Connecting to MCP...</div>
      )}
    </div>
  );
};

export default RenderChart;
