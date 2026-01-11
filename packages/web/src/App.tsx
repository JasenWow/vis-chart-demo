import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Markdown from "react-markdown";
import { withChartCode, ChartType, Line, Bar } from "@antv/gpt-vis";
import useMCPClient from "./hooks/use-mcp-client";
import useApiCharts from "./hooks/use-api-charts";

const CodeBlock = withChartCode({
  components: {
    [ChartType.Line]: Line,
    [ChartType.Bar]: Bar,
  },
});

const markdownTemplate = `
# GPT-VIS \n\nComponents for GPTs, generative AI, and LLM projects. Not only UI Components.

Here’s a visualization of Haidilao's food delivery revenue from 2013 to 2022. You can see a steady increase over the years, with notable *growth* particularly in recent years.

\`\`\`vis-chart
{chartData}
\`\`\`
`;

const RenderChart = () => {
  const sessioId = 1;
  const { client, transport, isConnected } = useMCPClient();
  const { setIds, data, mutate } = useApiCharts();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const initChartIds = searchParams.getAll("ids").map((i) => Number(i));
    console.log(initChartIds)
    if (initChartIds.length > 0) {

      setIds(initChartIds);
 
    }
  }, [mutate, setIds]);

  /** Add your agent logic here
   * Currently we add fake data here
   */
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
            { category: "2013", value: 59.3 },
            { category: "2014", value: 70 },
          ],
          sessionId: sessioId,
        },
      });
      const content = res.content as unknown as Array<{
        type: string;
        text: string;
      }>;
      console.log("Generated chart response:", res);

      const callbackUrl = content[0].text;
      const urlObj = new URL(callbackUrl);
      const newIds = new URLSearchParams(urlObj.search).get("id");

      navigate(`?ids=${newIds}`, { replace: true });
    } catch (error) {
      console.error("Error generating chart:", error);
    }
  }, [client, transport, navigate]);

  if (!data || data.length == 0) {
    return (
      <div>
        {isConnected ? (
          <div>
            <button onClick={handleGenerateChart}>Generate Bar Chart</button>
            <div>Loading data</div>
          </div>
        ) : (
          <div>Connecting to MCP...</div>
        )}
      </div>
    );
  }

  const updatedMarkdown = markdownTemplate.replace(
    "{chartData}",
    JSON.stringify(data[data.length - 1], null, 2)
  );

  console.log(updatedMarkdown);

  return (
    <div>
      {isConnected ? (
        <div>
          <button onClick={handleGenerateChart}>Generate Bar Chart</button>
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
