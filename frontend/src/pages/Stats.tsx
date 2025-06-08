import { useState, useEffect } from "react";
import { Layout } from "components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, BarChart2, TrendingUp, Scan, Smartphone, MapPin, Calendar } from "lucide-react";
import brain from "brain";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { getStoreHash } from "utils/storeContext";
import { toast } from "sonner";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { AnalyticsOverviewResponse } from "types";

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Stats() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("7d"); // Changed default value to match API format
  const [selectedQr, setSelectedQr] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStoreHash, setCurrentStoreHash] = useState("");
  
  // Analytics data
  const [analyticsData, setAnalyticsData] = useState<AnalyticsOverviewResponse | null>(null);
  
  // Chart data derived from analytics response
  const [deviceData, setDeviceData] = useState([]);
  
  // Get the store hash using utility function
  useEffect(() => {
    const storeHash = getStoreHash();
    
    if (!storeHash) {
      console.error("No store_hash available in localStorage");
      toast.error("No store context found. Please reconnect your store.");
      navigate("/hello-world");
      return;
    }
    
    setCurrentStoreHash(storeHash);
  }, [navigate]);

  // Load analytics data when store hash or time range changes
  useEffect(() => {
    if (!currentStoreHash) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch analytics overview from our new API endpoint
        const response = await brain.get_analytics_overview({ 
          store_hash: currentStoreHash,
          period: timeRange 
        });
        
        const data = await response.json();
        setAnalyticsData(data);
        
        // Process device data for pie chart
        if (data.device_breakdown) {
          const deviceChartData = Object.entries(data.device_breakdown)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
          setDeviceData(deviceChartData);
        } else {
          setDeviceData([]);
        }
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError("Failed to load analytics data");
        toast.error("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentStoreHash, timeRange]);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">QR Code Analytics</h1>
        <p className="text-muted-foreground">Track and analyze the performance of your QR codes.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Scan className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{analyticsData?.total_scans.toLocaleString() || "0"}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {timeRange === "7d" ? "Last 7 days" : 
                   timeRange === "30d" ? "Last 30 days" : 
                   "Custom period"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily Scans</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{analyticsData?.avg_daily_scans.toLocaleString() || "0"}</div>
                <p className="text-xs text-muted-foreground mt-1">Daily average for period</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Device</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold capitalize">{analyticsData?.top_device || "No data"}</div>
                <p className="text-xs text-muted-foreground mt-1">Most common device type</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Location</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{analyticsData?.top_location || "No data"}</div>
                <p className="text-xs text-muted-foreground mt-1">Most common location</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-5">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Scan Activity</CardTitle>
                <CardDescription>QR code scans over time</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[150px]">
                    <Calendar className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Skeleton className="w-full h-[250px] rounded-md" />
                </div>
              ) : !analyticsData?.series || analyticsData.series.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No scan data available for this time period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={analyticsData?.series || []}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" name="Scans" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Top QR Codes</CardTitle>
            <CardDescription>By total scans</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : !analyticsData?.top_qr_codes || analyticsData.top_qr_codes.length === 0 ? (
              <div className="py-4 text-center text-muted-foreground">
                No QR code scan data available
              </div>
            ) : (
              <div className="space-y-4">
                {analyticsData?.top_qr_codes.slice(0, 5).map((qrCode, index) => (
                  <div key={qrCode.qr_code_id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium truncate max-w-[70%]" title={qrCode.name}>
                        {qrCode.name}
                      </div>
                      <div className="text-sm text-muted-foreground">{qrCode.count}</div>
                    </div>
                    <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${analyticsData.total_scans > 0 ? Math.round((qrCode.count / analyticsData.total_scans) * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                {analyticsData?.top_qr_codes.length > 5 && (
                  <button 
                    className="text-sm text-blue-600 hover:underline w-full text-center mt-2"
                    onClick={() => navigate("/my-qr-codes")}
                  >
                    View all QR codes
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Device breakdown chart */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
            <CardDescription>QR code scans by device type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Skeleton className="w-full h-[250px] rounded-md" />
                </div>
              ) : deviceData.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No device data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} scans`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
