import { Hono } from 'hono';
import charts from './routes/charts';

const app = new Hono();

app.get('/chart-data', async (c) => {
  const sessionId = c.req.query('sessionId');
  
  if (!sessionId) {
    return c.json({ error: 'sessionId is required' }, 400);
  }

  // 根据 sessionId 查询数据，这里你可以替换为实际的数据库查询逻辑
  const chartData = {
    type: 'line',
    data: [
      { time: '2013', value: 33.3 },
      { time: '2014', value: 64.4 },
      { time: '2015', value: 68.9 },
      { time: '2016', value: 74.4 },
      { time: '2017', value: 82.7 },
      { time: '2018', value: 91.9 },
      { time: '2019', value: 99.1 },
      { time: '2020', value: 101.6 },
      { time: '2021', value: 114.4 },
      { time: '2022', value: 121 },
    ]
  };

  return c.json(chartData);
});


const routes = app.route("/charts", charts);

export default {
  fetch: app.fetch,
}

export type AppType = typeof routes;
