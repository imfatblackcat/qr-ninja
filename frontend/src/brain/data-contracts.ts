/** AnalyticsOverviewResponse */
export interface AnalyticsOverviewResponse {
  /** Total Scans */
  total_scans: number;
  /** Avg Daily Scans */
  avg_daily_scans: number;
  /** Top Device */
  top_device: string;
  /** Top Location */
  top_location: string;
  /** Series */
  series: DateSeriesPoint[];
  /** Top Qr Codes */
  top_qr_codes: QRCodeStat[];
  /** Device Breakdown */
  device_breakdown: Record<string, number>;
}

/** Cart */
export interface Cart {
  /** Id */
  id: string;
  /** Redirect Url */
  redirect_url?: string | null;
  /** Checkout Url */
  checkout_url?: string | null;
}

/** CartResponse */
export interface CartResponse {
  cart: Cart;
  /**
   * Status
   * @default "success"
   */
  status?: string;
}

/** CategoriesResponse */
export interface CategoriesResponse {
  /** Categories */
  categories?: Category[];
  /**
   * Status
   * @default "success"
   */
  status?: string;
  /**
   * Total
   * @default 0
   */
  total?: number;
}

/** Category */
export interface Category {
  /** Id */
  id: number;
  /** Parent Id */
  parent_id: number;
  /** Name */
  name: string;
  /** Description */
  description?: string | null;
  /** Sort Order */
  sort_order?: number | null;
  /** Page Title */
  page_title?: string | null;
  /** Meta Description */
  meta_description?: string | null;
  /** Image Url */
  image_url?: string | null;
  /**
   * Is Visible
   * @default true
   */
  is_visible?: boolean | null;
  /** Url */
  url?: string | null;
}

/** CategoryQRCodeRequest */
export interface CategoryQRCodeRequest {
  /** Store Hash */
  store_hash: string;
  /** Name */
  name: string;
  /** Category Id */
  category_id: number;
  style?: QRCodeStyle | null;
  /** Campaign Id */
  campaign_id?: string | null;
}

/** Coupon */
export interface Coupon {
  /** Id */
  id: number;
  /** Name */
  name: string;
  /** Code */
  code: string;
  /** Type */
  type: string;
  /** Amount */
  amount: number;
  /** Min Purchase */
  min_purchase?: number | null;
  /** Applies To */
  applies_to?: Record<string, any> | null;
  /** Enabled */
  enabled: boolean;
  /** Date Created */
  date_created?: string | null;
  /** Expires */
  expires?: string | null;
  /** Num Uses */
  num_uses?: number | null;
  /** Max Uses */
  max_uses?: number | null;
}

/** CouponsResponse */
export interface CouponsResponse {
  /** Coupons */
  coupons?: Coupon[];
  /**
   * Status
   * @default "success"
   */
  status?: string;
  /**
   * Total
   * @default 0
   */
  total?: number;
}

/** CreateStoreRequest */
export interface CreateStoreRequest {
  /** Store Hash */
  store_hash: string;
  /** Store Name */
  store_name?: string | null;
  /** Domain */
  domain?: string | null;
  /** Authentication information for a store */
  auth: StoreAuth;
  status?: StoreStatus | null;
  /** Metadata */
  metadata?: Record<string, any> | null;
}

/** CreateUserRequest */
export interface CreateUserRequest {
  /** Email */
  email: string;
  /** Name */
  name?: string | null;
  /**
   * Role
   * @default "viewer"
   */
  role?: string;
  /** Stores */
  stores?: string[];
  preferences?: UserPreferences | null;
}

/** CustomURLQRCodeRequest */
export interface CustomURLQRCodeRequest {
  /** Store Hash */
  store_hash: string;
  /** Name */
  name: string;
  /** Target information for a QR code (where it points to) */
  target: QRCodeTarget;
  style?: QRCodeStyle | null;
  /** Campaign Id */
  campaign_id?: string | null;
}

/** DateSeriesPoint */
export interface DateSeriesPoint {
  /** Date */
  date: string;
  /** Count */
  count: number;
}

/** GetScanStatsResponse */
export interface GetScanStatsResponse {
  /** Aggregated statistics for QR code scans */
  stats: ScanStats;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** HomepageQRCodeRequest */
export interface HomepageQRCodeRequest {
  /** Store Hash */
  store_hash: string;
  /** Name */
  name: string;
  style?: QRCodeStyle | null;
  /** Campaign Id */
  campaign_id?: string | null;
}

/** ListScanStatsResponse */
export interface ListScanStatsResponse {
  /** Stats */
  stats: ScanStats[];
  /** Count */
  count: number;
}

/** Product */
export interface Product {
  /** Id */
  id: number;
  /** Name */
  name: string;
  /** Type */
  type: string;
  /** Sku */
  sku?: string | null;
  /** Description */
  description?: string | null;
  /** Price */
  price: number;
  /** Sale Price */
  sale_price?: number | null;
  /** Calculated Price */
  calculated_price?: number | null;
  /** Categories */
  categories?: number[];
  /** Brand Id */
  brand_id?: number | null;
  /** Inventory Level */
  inventory_level?: number | null;
  /** Inventory Tracking */
  inventory_tracking?: string | null;
  /** Page Title */
  page_title?: string | null;
  /** Meta Description */
  meta_description?: string | null;
  /** Images */
  images?: Record<string, any>[];
  /** Custom Url */
  custom_url?: Record<string, any> | null;
  /**
   * Is Visible
   * @default true
   */
  is_visible?: boolean | null;
  /** Variants */
  variants?: Record<string, any>[];
}

/** ProductQRCodeRequest */
export interface ProductQRCodeRequest {
  /** Store Hash */
  store_hash: string;
  /** Name */
  name: string;
  /** Product Id */
  product_id: number;
  /**
   * Add To Cart
   * @default false
   */
  add_to_cart?: boolean;
  style?: QRCodeStyle | null;
  /** Campaign Id */
  campaign_id?: string | null;
}

/** ProductsResponse */
export interface ProductsResponse {
  /** Products */
  products?: Product[];
  /**
   * Status
   * @default "success"
   */
  status?: string;
  /**
   * Total
   * @default 0
   */
  total?: number;
}

/**
 * QRCode
 * QR code information including style, target, and metadata
 */
export interface QRCode {
  /** Id */
  id?: string;
  /** Store Hash */
  store_hash: string;
  /** Name */
  name: string;
  /** Type */
  type: string;
  /** Target information for a QR code (where it points to) */
  target: QRCodeTarget;
  /** Visual styling information for a QR code */
  style?: QRCodeStyle;
  /** Campaign Id */
  campaign_id?: string | null;
  /** Created At */
  created_at?: number;
  /** Updated At */
  updated_at?: number;
  /** Created By */
  created_by?: string | null;
  /**
   * Scan Count
   * @default 0
   */
  scan_count?: number;
  /**
   * Active
   * @default true
   */
  active?: boolean;
  /**
   * Status
   * @default "active"
   */
  status?: string;
}

/** QRCodeResponse */
export interface QRCodeResponse {
  /** Id */
  id: string;
  /** QR code information including style, target, and metadata */
  qr_code: QRCode;
  /**
   * Status
   * @default "success"
   */
  status?: string;
}

/** QRCodeStat */
export interface QRCodeStat {
  /** Qr Code Id */
  qr_code_id: string;
  /** Name */
  name: string;
  /** Count */
  count: number;
}

/**
 * QRCodeStyle
 * Visual styling information for a QR code
 */
export interface QRCodeStyle {
  /**
   * Foreground Color
   * @default "#000000"
   */
  foreground_color?: string;
  /**
   * Background Color
   * @default "#FFFFFF"
   */
  background_color?: string;
  /** Logo Url */
  logo_url?: string | null;
  /**
   * Dots Style
   * @default "square"
   */
  dots_style?: string;
  /**
   * Corner Style
   * @default "square"
   */
  corner_style?: string;
  /** Corner Color */
  corner_color?: string | null;
  /**
   * Logo Size
   * @default 0.3
   */
  logo_size?: number;
}

/**
 * QRCodeTarget
 * Target information for a QR code (where it points to)
 */
export interface QRCodeTarget {
  /** Url */
  url: string;
  /** Product Id */
  product_id?: number | null;
  /** Category Id */
  category_id?: number | null;
  /** Coupon Code */
  coupon_code?: string | null;
  /**
   * Add To Cart
   * @default false
   */
  add_to_cart?: boolean;
}

/**
 * SaveFileRequest
 * Request model for saving generated QR file
 */
export interface SaveFileRequest {
  /** Format */
  format: "png" | "svg" | "pdf";
  /** Size */
  size: number;
  /** Style Config */
  style_config: Record<string, any>;
  /** File Data */
  file_data: string;
}

/**
 * SaveFileResponse
 * Response model for save file operation
 */
export interface SaveFileResponse {
  /** Status */
  status: string;
  /** File Id */
  file_id: string;
  /** Download Url */
  download_url: string;
  /** Message */
  message: string;
}

/**
 * ScanStats
 * Aggregated statistics for QR code scans
 */
export interface ScanStats {
  /** Qr Code Id */
  qr_code_id: string;
  /** Store Hash */
  store_hash: string;
  /**
   * Total Scans
   * @default 0
   */
  total_scans?: number;
  /** Daily Scans */
  daily_scans?: Record<string, number>;
  /** Device Breakdown */
  device_breakdown?: Record<string, number>;
  /** Location Breakdown */
  location_breakdown?: Record<string, number>;
  /**
   * Conversions
   * @default 0
   */
  conversions?: number;
  /** Last Updated */
  last_updated?: number;
}

/**
 * Store
 * Store model
 */
export interface Store {
  /** Store Hash */
  store_hash: string;
  /** Store Name */
  store_name?: string | null;
  /** Domain */
  domain?: string | null;
  /** Email */
  email?: string | null;
  /** Admin Domain */
  admin_domain?: string | null;
  /** Control Panel Domain */
  control_panel_domain?: string | null;
  /**
   * Installation Type
   * @default "app"
   */
  installation_type?: string;
  /** Authentication information for a store */
  auth: StoreAuth;
  /** Status information for a store installation */
  status: StoreStatus;
}

/**
 * StoreAuth
 * Authentication information for a store
 */
export interface StoreAuth {
  /** Access Token */
  access_token: string;
  /** Context */
  context: string;
  /** Scope */
  scope?: string | null;
  /** Expires At */
  expires_at?: number | null;
}

/**
 * StoreList
 * List of stores
 */
export interface StoreList {
  /** Stores */
  stores?: StoreListItem[];
}

/**
 * StoreListItem
 * Basic store information for listing
 */
export interface StoreListItem {
  /** Store Hash */
  store_hash: string;
  /** Store Name */
  store_name?: string | null;
  /** Domain */
  domain?: string | null;
  /** Installation Type */
  installation_type: string;
  /** Is Active */
  is_active: boolean;
  /** Installed At */
  installed_at: number;
}

/** StoreListResponse */
export interface StoreListResponse {
  /** Stores */
  stores: Store[];
  /** Count */
  count: number;
}

/**
 * StoreStatus
 * Status information for a store installation
 */
export interface StoreStatus {
  /**
   * Active
   * @default true
   */
  active?: boolean;
  /** Last Accessed */
  last_accessed?: number;
  /** Installed At */
  installed_at?: number;
  /** Uninstalled At */
  uninstalled_at?: number | null;
}

/**
 * StoreUpdateData
 * Data for updating store information
 */
export interface StoreUpdateData {
  /** Store Name */
  store_name?: string | null;
  /** Domain */
  domain?: string | null;
  /** Is Active */
  is_active?: boolean | null;
  /** Metadata */
  metadata?: Record<string, any> | null;
}

/** TestRedirectScenario */
export interface TestRedirectScenario {
  /** Scenario */
  scenario: string;
  /** Description */
  description: string;
}

/** UpdateQRCodeRequest */
export interface UpdateQRCodeRequest {
  /** Name */
  name?: string | null;
  style?: QRCodeStyle | null;
  /** Active */
  active?: boolean | null;
  /** Campaign Id */
  campaign_id?: string | null;
}

/** UpdateUserRequest */
export interface UpdateUserRequest {
  /** Name */
  name?: string | null;
  /** Role */
  role?: string | null;
  /** Status */
  status?: string | null;
  /** Stores */
  stores?: string[] | null;
  preferences?: UserPreferences | null;
}

/**
 * UserPreferences
 * User preferences for app settings
 */
export interface UserPreferences {
  /**
   * Notifications
   * @default true
   */
  notifications?: boolean;
  /**
   * Theme
   * @default "light"
   */
  theme?: string;
  /**
   * Language
   * @default "en"
   */
  language?: string;
}

/** UserResponse */
export interface UserResponse {
  /** Email */
  email: string;
  /** Name */
  name?: string | null;
  /** Role */
  role: string;
  /** Stores */
  stores: string[];
  /** Status */
  status: string;
  /** User preferences for app settings */
  preferences: UserPreferences;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

/** StatusResponse */
export interface AppApisDatabaseTestStatusResponse {
  /** Status */
  status: string;
  /** Message */
  message: string;
}

/** StoreResponse */
export interface AppApisDatabaseTestStoreResponse {
  /** Id */
  id: string;
  /** Store Hash */
  store_hash: string;
  /** Store Name */
  store_name: string;
}

/** StatusResponse */
export interface AppApisQrCodeStatusResponse {
  /**
   * Status
   * @default "success"
   */
  status?: string;
  /** Message */
  message: string;
  /** Qr Code Id */
  qr_code_id?: string | null;
}

/** StoreResponse */
export interface AppApisStoreStoreResponse {
  /** Store model */
  store: Store;
}

/** StatusResponse */
export interface AppApisUserStatusResponse {
  /** Status */
  status: string;
  /** Message */
  message: string;
  /** User Id */
  user_id?: string | null;
}

export type CheckHealthData = HealthResponse;

export type GetAllStoresData = StoreList;

export interface GetStoreParams {
  /** Store Hash */
  storeHash: string;
}

export type GetStoreData = any;

export type GetStoreError = HTTPValidationError;

export interface UpdateStoreParams {
  /** Store Hash */
  storeHash: string;
}

export type UpdateStoreData = any;

export type UpdateStoreError = HTTPValidationError;

export interface DeleteStoreParams {
  /** Store Hash */
  storeHash: string;
}

export type DeleteStoreData = any;

export type DeleteStoreError = HTTPValidationError;

export type AuthCallbackData = any;

/** Response Test Redirect Scenarios */
export type TestRedirectScenariosData = TestRedirectScenario[];

export interface TestRedirectScenarioParams {
  /** Scenario */
  scenario: string;
}

export type TestRedirectScenarioData = any;

export type TestRedirectScenarioError = HTTPValidationError;

export type GetAuthUrlData = any;

export type ListStoresData = any;

export interface LoadCallbackParams {
  /** Context */
  context?: string | null;
}

export type LoadCallbackData = any;

export type LoadCallbackError = HTTPValidationError;

export interface GetProductsParams {
  /**
   * Limit
   * @default 50
   */
  limit?: number;
  /**
   * Page
   * @default 1
   */
  page?: number;
  /** Category Id */
  category_id?: number | null;
  /** Store Hash */
  storeHash: string;
}

export type GetProductsData = ProductsResponse;

export type GetProductsError = HTTPValidationError;

export interface GetCategoriesParams {
  /**
   * Limit
   * @default 50
   */
  limit?: number;
  /**
   * Page
   * @default 1
   */
  page?: number;
  /** Parent Id */
  parent_id?: number | null;
  /** Store Hash */
  storeHash: string;
}

export type GetCategoriesData = CategoriesResponse;

export type GetCategoriesError = HTTPValidationError;

export interface GetCouponsParams {
  /**
   * Limit
   * @default 50
   */
  limit?: number;
  /**
   * Page
   * @default 1
   */
  page?: number;
  /** Store Hash */
  storeHash: string;
}

export type GetCouponsData = CouponsResponse;

export type GetCouponsError = HTTPValidationError;

export interface CreateCartParams {
  /** Product Id */
  product_id: number;
  /**
   * Quantity
   * @default 1
   */
  quantity?: number;
  /** Store Hash */
  storeHash: string;
}

export type CreateCartData = CartResponse;

export type CreateCartError = HTTPValidationError;

export interface GetStore2Params {
  /**
   * Store Hash
   * The unique hash identifier for the store
   */
  storeHash: string;
}

export type GetStore2Data = AppApisStoreStoreResponse;

export type GetStore2Error = HTTPValidationError;

export interface UpdateStore2Params {
  /**
   * Store Hash
   * The unique hash identifier for the store
   */
  storeHash: string;
}

export type UpdateStore2Data = AppApisStoreStoreResponse;

export type UpdateStore2Error = HTTPValidationError;

export interface DeleteStore2Params {
  /**
   * Store Hash
   * The unique hash identifier for the store
   */
  storeHash: string;
}

export type DeleteStore2Data = any;

export type DeleteStore2Error = HTTPValidationError;

export interface ListStores2Params {
  /**
   * Active Only
   * Only list active stores
   * @default true
   */
  active_only?: boolean;
  /**
   * Limit
   * Maximum number of results to return
   * @default 10
   */
  limit?: number;
  /**
   * Offset
   * Number of results to skip
   * @default 0
   */
  offset?: number;
}

export type ListStores2Data = StoreListResponse;

export type ListStores2Error = HTTPValidationError;

export type CreateStore2Data = AppApisStoreStoreResponse;

export type CreateStore2Error = HTTPValidationError;

export type PingData = AppApisDatabaseTestStatusResponse;

export interface CreateStoreParams {
  /** Store Hash */
  store_hash: string;
  /** Store Name */
  store_name: string;
}

export type CreateStoreData = AppApisDatabaseTestStatusResponse;

export type CreateStoreError = HTTPValidationError;

/** Response List Test Stores */
export type ListTestStoresData = AppApisDatabaseTestStoreResponse[];

export interface CreateQrCodeParams {
  /** Store Hash */
  store_hash: string;
  /** Name */
  name: string;
  /** Url */
  url: string;
}

export type CreateQrCodeData = AppApisDatabaseTestStatusResponse;

export type CreateQrCodeError = HTTPValidationError;

/** Response List Users */
export type ListUsersData = UserResponse[];

export type CreateUserData = AppApisUserStatusResponse;

export type CreateUserError = HTTPValidationError;

export interface GetUserParams {
  /**
   * Email
   * User email address
   */
  email: string;
}

export type GetUserData = UserResponse;

export type GetUserError = HTTPValidationError;

export interface UpdateUserParams {
  /** Email */
  email: string;
}

export type UpdateUserData = AppApisUserStatusResponse;

export type UpdateUserError = HTTPValidationError;

export interface DeleteUserParams {
  /** Email */
  email: string;
}

export type DeleteUserData = AppApisUserStatusResponse;

export type DeleteUserError = HTTPValidationError;

export interface GenerateTestDataParams {
  /** Store Hash */
  store_hash: string;
  /**
   * Num Qr Codes
   * @default 3
   */
  num_qr_codes?: number;
  /**
   * Scans Per Qr
   * @default 10
   */
  scans_per_qr?: number;
}

export type GenerateTestDataData = any;

export type GenerateTestDataError = HTTPValidationError;

export type CreateTestQrCodeData = any;

export interface GetAnalyticsOverviewParams {
  /**
   * Store Hash
   * The store hash to filter by
   */
  store_hash: string;
  /**
   * Period
   * Time period to filter by (7d, 30d, custom)
   * @default "7d"
   */
  period?: string;
  /**
   * From Timestamp
   * Start timestamp for custom period
   */
  from_timestamp?: number | null;
  /**
   * To Timestamp
   * End timestamp for custom period
   */
  to_timestamp?: number | null;
}

export type GetAnalyticsOverviewData = AnalyticsOverviewResponse;

export type GetAnalyticsOverviewError = HTTPValidationError;

export interface GetQrCodeAnalyticsParams {
  /**
   * Period
   * Time period to filter by (7d, 30d, custom)
   * @default "7d"
   */
  period?: string;
  /**
   * From Timestamp
   * Start timestamp for custom period
   */
  from_timestamp?: number | null;
  /**
   * To Timestamp
   * End timestamp for custom period
   */
  to_timestamp?: number | null;
  /**
   * Qr Code Id
   * The QR code ID to get analytics for
   */
  qrCodeId: string;
}

export type GetQrCodeAnalyticsData = AnalyticsOverviewResponse;

export type GetQrCodeAnalyticsError = HTTPValidationError;

export type GetRedirectConfigurationData = any;

export type GetRedirectTestScenariosData = any;

export interface TestSpecificRedirectScenarioParams {
  /** Scenario */
  scenario: string;
}

export type TestSpecificRedirectScenarioData = any;

export type TestSpecificRedirectScenarioError = HTTPValidationError;

export type CreateScanTestQrCode22Data = any;

export interface LoadTestPerformanceParams {
  /** Qr Code Id */
  qr_code_id?: string;
  /**
   * Request Count
   * @default 100
   */
  request_count?: number;
  /**
   * Concurrent
   * @default true
   */
  concurrent?: boolean;
}

export type LoadTestPerformanceData = any;

export type LoadTestPerformanceError = HTTPValidationError;

export interface TrackScanParams {
  /** Qr Code Id */
  qrCodeId: string;
}

export type TrackScanData = any;

export type TrackScanError = HTTPValidationError;

export interface ListQrCodesParams {
  /**
   * Limit
   * @default 100
   */
  limit?: number;
  /**
   * Offset
   * @default 0
   */
  offset?: number;
  /** Store Hash */
  storeHash: string;
}

export type ListQrCodesData = any;

export type ListQrCodesError = HTTPValidationError;

export type CreateProductQrCodeData = QRCodeResponse;

export type CreateProductQrCodeError = HTTPValidationError;

export type CreateCategoryQrCodeData = QRCodeResponse;

export type CreateCategoryQrCodeError = HTTPValidationError;

export type CreateHomepageQrCodeData = QRCodeResponse;

export type CreateHomepageQrCodeError = HTTPValidationError;

export interface UpdateQrCodeParams {
  /**
   * Qr Code Id
   * The ID of the QR code to update
   */
  qrCodeId: string;
}

export type UpdateQrCodeData = QRCodeResponse;

export type UpdateQrCodeError = HTTPValidationError;

export interface DeleteQrCodeParams {
  /**
   * Hard Delete
   * @default false
   */
  hard_delete?: boolean;
  /**
   * Qr Code Id
   * The ID of the QR code to delete
   */
  qrCodeId: string;
}

export type DeleteQrCodeData = any;

export type DeleteQrCodeError = HTTPValidationError;

export type CreateCustomUrlQrCodeData = QRCodeResponse;

export type CreateCustomUrlQrCodeError = HTTPValidationError;

export type CreateTestQrCode2Data = AppApisQrCodeStatusResponse;

export interface GetScanStatsParams {
  /**
   * Qr Code Id
   * The ID of the QR code to get stats for
   */
  qrCodeId: string;
}

export type GetScanStatsData = GetScanStatsResponse;

export type GetScanStatsError = HTTPValidationError;

export interface ListScanStatsParams {
  /**
   * Store Hash
   * The store hash to filter QR codes by
   */
  store_hash: string;
  /**
   * Limit
   * Maximum number of results to return
   * @default 10
   */
  limit?: number;
  /**
   * Offset
   * Number of results to skip
   * @default 0
   */
  offset?: number;
  /**
   * Time Period
   * Time period to filter by (7days, 30days, 90days, year)
   */
  time_period?: string | null;
}

export type ListScanStatsData = ListScanStatsResponse;

export type ListScanStatsError = HTTPValidationError;

export interface GetQrCodeImageParams {
  /**
   * Url
   * URL to encode (for temp-preview)
   */
  url?: string | null;
  /**
   * Dots Style
   * Style of the QR code's data modules (dots).
   */
  dots_style?: string | null;
  /**
   * Corner Style
   * Style of the QR code's corner finder patterns.
   */
  corner_style?: string | null;
  /**
   * Actual Corner Color
   * Hex color for the custom corners, if different from foreground.
   */
  actual_corner_color?: string | null;
  /**
   * Foreground Color Override
   * Hex color for the QR code foreground (dots).
   */
  foreground_color_override?: string | null;
  /**
   * Background Color Override
   * Hex color for the QR code background.
   */
  background_color_override?: string | null;
  /**
   * Size
   * Size of the QR code in pixels
   * @default 300
   */
  size?: number;
  /**
   * Error Correction
   * Error correction level
   * @default "M"
   */
  error_correction?: "L" | "M" | "Q" | "H";
  /**
   * Border
   * Border size in modules
   * @default 4
   */
  border?: number;
  /**
   * Qr Code Id
   * The ID of the QR code or 'temp-preview' for preview
   */
  qrCodeId: string;
  /**
   * Format
   * The format of the QR code image (png, jpeg, pdf supported)
   */
  format: "png" | "jpeg" | "pdf";
}

export type GetQrCodeImageData = any;

export type GetQrCodeImageError = HTTPValidationError;

export interface SaveGeneratedFileParams {
  /**
   * Qr Code Id
   * The QR code ID
   */
  qrCodeId: string;
}

export type SaveGeneratedFileData = SaveFileResponse;

export type SaveGeneratedFileError = HTTPValidationError;

export interface DownloadGeneratedFileParams {
  /**
   * Inline
   * Whether to display inline or as attachment
   * @default false
   */
  inline?: boolean;
  /**
   * File Id
   * The file ID to download
   */
  fileId: string;
}

export type DownloadGeneratedFileData = any;

export type DownloadGeneratedFileError = HTTPValidationError;

export interface ListGeneratedFilesParams {
  /**
   * Qr Code Id
   * The QR code ID
   */
  qrCodeId: string;
}

export type ListGeneratedFilesData = any;

export type ListGeneratedFilesError = HTTPValidationError;

export interface DeleteGeneratedFileParams {
  /**
   * File Id
   * The file ID to delete
   */
  fileId: string;
}

export type DeleteGeneratedFileData = any;

export type DeleteGeneratedFileError = HTTPValidationError;
