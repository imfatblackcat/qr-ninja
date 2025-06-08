import React, { useState, useEffect } from "react";
import brain from "brain";
import { toast } from "sonner";
import { downloadQrImage } from "utils/qrDownloader";
import { getQrImageUrl } from "utils/qrImageService";
import { Layout } from "components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Search, MoreVertical, Eye, Download, Trash2, QrCode } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getStoreHash } from "utils/storeContext";
import { deleteQrCode } from "utils/brainProxy";
import { useQrCreationStoreActions } from "utils/qrCreationStore";

// Define QR code interface
interface QrCode {
  id: string;
  name: string;
  type: string;
  url: string;
  created_at: number;
  scan_count: number;
  active: boolean;
  status: string;
}

export default function MyQrCodes() {
  const navigate = useNavigate();
  const { resetStore } = useQrCreationStoreActions();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [qrCodes, setQrCodes] = useState<QrCode[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Fetch QR codes from API
  useEffect(() => {
    const fetchQrCodes = async () => {
      try {
        setLoading(true);
        // Get the store hash using the utility function
        const storeHash = getStoreHash();
        
        if (!storeHash) {
          console.error("No store_hash available in localStorage");
          toast.error("No store context found. Please reconnect your store.");
          navigate("/hello-world");
          return;
        }
        
        console.log("Fetching fresh QR codes from API...");
        // Fetch QR codes for the store
        const response = await brain.list_qr_codes({ storeHash });
        const data = await response.json();
        
        if (data && data.qr_codes) {
          console.log(`Loaded ${data.qr_codes.length} QR codes from server`);
          setQrCodes(data.qr_codes);
        }
      } catch (error) {
        console.error("Error fetching QR codes:", error);
        toast.error("Failed to load QR codes");
      } finally {
        setLoading(false);
      }
    };
    
    fetchQrCodes();
  }, [location.key]); // Re-fetch when location changes (when user navigates back to this page)
  
  // Filter QR codes based on search term
  const filteredQrCodes = qrCodes.filter(qr => 
    qr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qr.url.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle QR code deletion
  const handleDelete = async (qrCodeId: string) => {
    if (confirm("Are you sure you want to delete this QR code?")) {
      try {
        console.log(`Attempting to delete QR code with ID: ${qrCodeId}`);
        setLoading(true); // Show loading indicator while deletion is in progress
        
        // Wywołanie funkcji proxy, która używa odpowiedniego URL w zależności od środowiska
        console.log(`Deleting QR code with ID: ${qrCodeId}`);
        const response = await deleteQrCode({ qrCodeId, hard_delete: true });
        
        if (!response.ok) {
          // If the API returns an error, handle it
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to delete QR code');
        }

        toast.success("QR code deleted");
        console.log(`QR code ${qrCodeId} successfully deleted`);
        
        // Remove the deleted QR code from state
        setQrCodes(prevCodes => prevCodes.filter(code => code.id !== qrCodeId));
        
        // Force re-fetch data from server to ensure the deleted QR code is gone from the list
        const storeHash = getStoreHash();
        if (storeHash) {
          console.log("Re-fetching QR codes from server after deletion...");
          const refreshResponse = await brain.list_qr_codes({ storeHash });
          const refreshData = await refreshResponse.json();
          
          if (refreshData && refreshData.qr_codes) {
            console.log(`Refreshed data: loaded ${refreshData.qr_codes.length} QR codes from server`);
            setQrCodes(refreshData.qr_codes);
          }
        }
      } catch (error) {
        console.error("Error deleting QR code:", error);
        toast.error(typeof error === 'object' && error !== null ? (error as Error).message : "Failed to delete QR code");
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Handle QR code download
  const handleDownload = async (qrCode: QrCode, format: 'svg' | 'png' | 'pdf') => {
    try {
      setIsDownloading(true);
      
      // Use our QR image service to download from the API
      await downloadQrImage(qrCode.id, qrCode.name, format);
      toast.success(`QR code downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error(`Error downloading QR code as ${format}:`, error);
      toast.error(`Failed to download QR code as ${format}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My QR Codes</h1>
          <p className="text-muted-foreground">Manage and track all your QR codes.</p>
        </div>
        <Button onClick={() => { resetStore(); navigate("/SelectQRType"); }}>
          <Plus className="mr-2 h-4 w-4" />
          New QR Code
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All QR Codes</CardTitle>
              <CardDescription>
                {filteredQrCodes.length} QR codes found
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search QR codes..."
                className="pl-8 w-full sm:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500 mx-auto mb-3"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Loading QR codes...</h3>
            </div>
          ) : filteredQrCodes.length === 0 ? (
            <div className="py-12 text-center">
              <QrCode className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No QR codes found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or create a new QR code.</p>
              <Button onClick={() => { resetStore(); navigate("/SelectQRType"); }}>
                <Plus className="mr-2 h-4 w-4" />
                Create QR Code
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden md:table-cell">Destination</TableHead>
                    <TableHead className="hidden md:table-cell">Created</TableHead>
                    <TableHead className="text-right">Scans</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQrCodes.map((qrCode) => (
                    <TableRow key={qrCode.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <img 
                            src={getQrImageUrl(qrCode.id, 'png', 32)} 
                            alt={qrCode.name} 
                            className="w-8 h-8 rounded border border-gray-200" 
                            onError={(e) => {
                              // Use default image if QR code image fails to load
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+Cg==';
                            }}
                          />
                          {qrCode.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{qrCode.type}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                        {qrCode.url}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{new Date(qrCode.created_at * 1000).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">{qrCode.scan_count.toLocaleString()}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge className={
                          qrCode.status === "active" 
                            ? "bg-green-100 text-green-800 hover:bg-green-100" 
                            : qrCode.status === "inactive" 
                              ? "bg-gray-100 text-gray-800 hover:bg-gray-100"
                              : "bg-red-100 text-red-800 hover:bg-red-100"
                        }>
                          {qrCode.status === "active" ? "Active" : qrCode.status === "inactive" ? "Inactive" : "Deleted"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/edit-qr/${qrCode.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                <DropdownMenuItem onClick={() => handleDownload(qrCode, 'svg')}>
                                  SVG
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownload(qrCode, 'png')}>
                                  PNG
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownload(qrCode, 'pdf')}>
                                  PDF
                                </DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(qrCode.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* No hidden element needed - we use the API directly */}
    </Layout>
  );
}
