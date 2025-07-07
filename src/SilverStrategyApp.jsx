// SilverStrategyApp.jsx
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Box,
  Paper,
  Switch,
  FormControlLabel,
  Collapse,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
import { analyzeStrategy } from './strategyService';

export default function SilverStrategyApp() {
  const [commodity, setCommodity] = useState('Silver');
  const [form, setForm] = useState({
    currentPrice: 110000,
    minPrice: 70000,
    buyInterval: 2000,
    sellInterval: 2000,
    marginPerLot: 16000,
    lotSize: 1,
    atr: 1000,
    averageTradingDaysPerMonth: 20,
    trendBias: 'neutral'
  });

  const [result, setResult] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [volatilityData, setVolatilityData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [useSip, setUseSip] = useState(true);
  const [showExpert, setShowExpert] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const analysis = await analyzeStrategy({ ...form, useSip });
      setResult(analysis);
      setChartData(analysis.payoffTable || []);
      setVolatilityData(analysis.volatilityBufferSeries || []);
    } catch (error) {
      alert('Error Analyzing Strategy.');
    } finally {
      setLoading(false);
    }
  };

  const metricDescriptions = {
    totalPositions: 'Total Lots To Be Purchased Based On Drop Intervals.',
    totalMargin: 'Total Margin Required To Hold All Positions.',
    averageBuyPrice: 'Average Cost Per Unit Across All Positions.',
    maxDrawdownPerLot: 'Max Loss On One Lot If Price Hits Lowest Point.',
    totalMaxDrawdown: 'Worst-Case Loss Across All Lots.',
    totalCapitalNeeded: 'Combined Margin And Drawdown Capital Required.',
    capitalWithBuffer: 'Capital Including Additional Safety Reserve.',
    volatilityBuffer: 'Extra Capital To Protect Against Volatility (ATR-Based).',
    totalProfitOnFullCycle: 'Total Profit Assuming All Lots Exit At Sell Intervals.',
    estimatedAnnualReturnLow: 'Minimum Projected Annual Return.',
    estimatedAnnualReturnHigh: 'High-Side Projected Annual Return.',
    estimatedROI: 'Return On Investment As A Percentage.',
    breakevenPrice: 'Price At Which Cumulative Profit = 0.',
    worstCaseLoss: 'Maximum Potential Loss In Adverse Scenario.',
    taxAdjustedProfit: 'Profit After Accounting For Tax.',
    netROI: 'Net Return Percentage After Taxes.',
    winProb: 'Probability Of Strategy Resulting In Net Gain.'
  };

  return (
    <Box sx={{ background: darkMode ? '#121212' : '#f4f6f8', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">💎 {commodity} Strategy Analyzer</Typography>
          <FormControlLabel control={<Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />} label="Dark Mode" />
        </Box>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Commodity</InputLabel>
          <Select value={commodity} onChange={(e) => setCommodity(e.target.value)}>
            <MenuItem value="Silver">Silver</MenuItem>
            <MenuItem value="Gold">Gold</MenuItem>
            <MenuItem value="Crude Oil">Crude Oil</MenuItem>
          </Select>
        </FormControl>

        <FormControlLabel control={<Switch checked={useSip} onChange={() => setUseSip(!useSip)} />} label="Include SIP Capital Injection" />

        <Button onClick={() => setShowExpert(!showExpert)} endIcon={showExpert ? <ExpandLessIcon /> : <ExpandMoreIcon />}>{showExpert ? 'Hide Advanced' : 'Show Advanced'}</Button>

        <Collapse in={showExpert}>
          <Grid container spacing={2} mt={1}>
            {Object.entries(form).map(([key, value]) => (
              <Grid item xs={12} sm={6} key={key}>
                <TextField
                  fullWidth
                  label={key.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase())}
                  name={key}
                  type={typeof value === 'number' ? 'number' : 'text'}
                  value={value}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
            ))}
          </Grid>
        </Collapse>

        <Button variant="contained" sx={{ mt: 2 }} onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Analyze Strategy'}
        </Button>

        {result && (
          <Box mt={5}>
            <Typography variant="h5" gutterBottom>📊 Strategy Insights</Typography>
            <Grid container spacing={3}>
              {Object.entries(result).filter(([key, val]) => typeof val !== 'object').map(([key, value]) => (
                <Grid item xs={12} sm={6} md={4} key={key}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600}>{key.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase())}</Typography>
                    <Typography variant="h6">{value}</Typography>
                    <Typography variant="caption" color="text.secondary">{metricDescriptions[key]}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Box mt={5}>
              <Typography variant="h6">📅 Monthly Strategy Forecast</Typography>
              <Paper sx={{ p: 2, mt: 2 }}>
                {Object.entries(result.monthlyStats).map(([key, value]) => (
                  <Typography key={key}><strong>{key.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase())}:</strong> {value}</Typography>
                ))}
              </Paper>
            </Box>

            {chartData.length > 0 && (
              <Box mt={5}>
                <Typography variant="h6">📈 Payoff Chart</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="entryPrice" />
                    <YAxis />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="returnIfSoldAtTarget" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            )}

            {volatilityData.length > 0 && (
              <Box mt={5}>
                <Typography variant="h6">📉 Volatility Buffer Chart</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={volatilityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="position" />
                    <YAxis />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="buffer" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            )}

            {chartData.length > 0 && (
              <Box mt={5}>
                <Typography variant="h6">📋 Payoff Table</Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Entry Price</TableCell>
                        <TableCell>Cost</TableCell>
                        <TableCell>Drawdown</TableCell>
                        <TableCell>Return At Target</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {chartData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.entryPrice}</TableCell>
                          <TableCell>{row.cost}</TableCell>
                          <TableCell>{row.drawdown}</TableCell>
                          <TableCell>{row.returnIfSoldAtTarget}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}