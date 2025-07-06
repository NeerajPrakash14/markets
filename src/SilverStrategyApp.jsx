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
  TableRow,
  Card,
  CardContent,
  CardHeader,
  Divider
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
    lotSize: 1
  });

  const [result, setResult] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [useSip, setUseSip] = useState(true);
  const [showExpert, setShowExpert] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: parseFloat(e.target.value) });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const analysis = await analyzeStrategy({ ...form, useSip });
      setResult(analysis);
      setChartData(analysis.payoffTable || []);
    } catch (error) {
      alert('Error analyzing strategy.');
    } finally {
      setLoading(false);
    }
  };

  const metricDescriptions = {
    totalPositions: 'Total lots to be purchased based on drop intervals.',
    totalMargin: 'Total margin required to hold all positions.',
    averageBuyPrice: 'Average cost per unit across all positions.',
    maxDrawdownPerLot: 'Max loss on one lot if price hits lowest point.',
    totalMaxDrawdown: 'Worst-case loss across all lots.',
    totalCapitalNeeded: 'Combined margin and drawdown capital required.',
    totalProfitOnFullCycle: 'Total profit assuming all lots exit at sell intervals.',
    estimatedAnnualReturnLow: 'Minimum projected annual return.',
    estimatedAnnualReturnHigh: 'High-side projected annual return.',
    estimatedROI: 'Return on investment as a percentage.',
    breakevenPrice: 'Price at which cumulative profit = 0.',
    worstCaseLoss: 'Maximum potential loss in adverse scenario.',
    taxAdjustedProfit: 'Profit after accounting for tax.',
    netROI: 'Net return percentage after taxes.',
    capitalWithBuffer: 'Capital including additional safety reserve.',
    winProb: 'Probability of strategy resulting in net gain.'
  };

  return (
    <Box sx={{ background: darkMode ? '#0e0e11' : '#e3f2fd', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" fontWeight="bold" color="primary">💎 {commodity} Strategy Analyzer</Typography>
          {/* <FormControlLabel control={<Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />} label="Dark Mode" /> */}
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

        <Button onClick={() => setShowExpert(!showExpert)} endIcon={showExpert ? <ExpandLessIcon /> : <ExpandMoreIcon />} sx={{ mt: 1 }}>
          {showExpert ? 'Hide Advanced' : 'Show Advanced'}
        </Button>

        <Collapse in={showExpert}>
          <Grid container spacing={2} mt={1}>
            {Object.entries(form).map(([key, value]) => (
              <Grid item xs={12} sm={6} key={key}>
                <TextField
                  fullWidth
                  label={key.replace(/([A-Z])/g, ' $1')}
                  name={key}
                  type="number"
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
          <Box mt={6}>
            <Typography variant="h5" gutterBottom>📊 Detailed Strategy Insights</Typography>
            <Grid container spacing={3}>
              {Object.entries(result).filter(([key]) => typeof result[key] !== 'object').map(([key, value]) => (
                <Grid item xs={12} sm={6} md={4} key={key}>
                  <Card variant="outlined" sx={{ backgroundColor: darkMode ? '#1e1e2f' : '#ffffff', borderRadius: 3 }}>
                    <CardHeader
                      title={key.replace(/([A-Z])/g, ' $1')}
                      titleTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                    />
                    <Divider />
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold">{value}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {metricDescriptions[key]}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {chartData.length > 0 && (
              <Box mt={6}>
                <Typography variant="h6">📈 Payoff Chart</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="entryPrice" />
                    <YAxis />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="returnIfSoldAtTarget" stroke="#1976d2" fill="#bbdefb" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            )}

            {chartData.length > 0 && (
              <Box mt={5}>
                <Typography variant="h6">📋 Payoff Table</Typography>
                <TableContainer component={Paper} elevation={2}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Entry Price</TableCell>
                        <TableCell>Cost</TableCell>
                        <TableCell>Drawdown</TableCell>
                        <TableCell>Return at Target</TableCell>
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
