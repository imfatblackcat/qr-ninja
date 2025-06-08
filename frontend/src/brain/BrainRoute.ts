import {
  AuthCallbackData,
  CategoryQRCodeRequest,
  CheckHealthData,
  CreateCartData,
  CreateCategoryQrCodeData,
  CreateCustomUrlQrCodeData,
  CreateHomepageQrCodeData,
  CreateProductQrCodeData,
  CreateQrCodeData,
  CreateScanTestQrCode22Data,
  CreateStore2Data,
  CreateStoreData,
  CreateStoreRequest,
  CreateTestQrCode2Data,
  CreateTestQrCodeData,
  CreateUserData,
  CreateUserRequest,
  CustomURLQRCodeRequest,
  DeleteGeneratedFileData,
  DeleteQrCodeData,
  DeleteStore2Data,
  DeleteStoreData,
  DeleteUserData,
  DownloadGeneratedFileData,
  GenerateTestDataData,
  GetAllStoresData,
  GetAnalyticsOverviewData,
  GetAuthUrlData,
  GetCategoriesData,
  GetCouponsData,
  GetProductsData,
  GetQrCodeAnalyticsData,
  GetQrCodeImageData,
  GetRedirectConfigurationData,
  GetRedirectTestScenariosData,
  GetScanStatsData,
  GetStore2Data,
  GetStoreData,
  GetUserData,
  HomepageQRCodeRequest,
  ListGeneratedFilesData,
  ListQrCodesData,
  ListScanStatsData,
  ListStores2Data,
  ListStoresData,
  ListTestStoresData,
  ListUsersData,
  LoadCallbackData,
  LoadTestPerformanceData,
  PingData,
  ProductQRCodeRequest,
  SaveFileRequest,
  SaveGeneratedFileData,
  StoreUpdateData,
  TestRedirectScenarioData,
  TestRedirectScenariosData,
  TestSpecificRedirectScenarioData,
  TrackScanData,
  UpdateQRCodeRequest,
  UpdateQrCodeData,
  UpdateStore2Data,
  UpdateStoreData,
  UpdateUserData,
  UpdateUserRequest,
} from "./data-contracts";

export namespace Brain {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * @description List all stores
   * @tags dbtn/module:store_manager
   * @name get_all_stores
   * @summary Get All Stores
   * @request GET:/routes/stores/
   */
  export namespace get_all_stores {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAllStoresData;
  }

  /**
   * @description Get details for a specific store
   * @tags dbtn/module:store_manager
   * @name get_store
   * @summary Get Store
   * @request GET:/routes/stores/{store_hash}
   */
  export namespace get_store {
    export type RequestParams = {
      /** Store Hash */
      storeHash: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetStoreData;
  }

  /**
   * @description Update store information in Firebase
   * @tags dbtn/module:store_manager
   * @name update_store
   * @summary Update Store
   * @request PUT:/routes/stores/{store_hash}
   */
  export namespace update_store {
    export type RequestParams = {
      /** Store Hash */
      storeHash: string;
    };
    export type RequestQuery = {};
    export type RequestBody = StoreUpdateData;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateStoreData;
  }

  /**
   * @description Delete a store from Firebase
   * @tags dbtn/module:store_manager
   * @name delete_store
   * @summary Delete Store
   * @request DELETE:/routes/stores/{store_hash}
   */
  export namespace delete_store {
    export type RequestParams = {
      /** Store Hash */
      storeHash: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteStoreData;
  }

  /**
   * @description Callback endpoint for BigCommerce OAuth flow. BigCommerce redirects to this endpoint after the user authorizes the app. This endpoint handles both manual installations and single-click installations from the BigCommerce App Marketplace. The flow works as follows: 1. User installs the app (either manually or via single-click from marketplace) 2. BigCommerce redirects to this endpoint with code, scope, and context 3. We exchange the code for an access token 4. We store the token information 5. We redirect the user to the HelloWorld page (for all installation types)
   * @tags dbtn/module:bigcommerce_oauth
   * @name auth_callback
   * @summary Auth Callback
   * @request GET:/routes/auth_callback
   */
  export namespace auth_callback {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = AuthCallbackData;
  }

  /**
   * @description Get list of available redirect test scenarios
   * @tags dbtn/module:bigcommerce_oauth
   * @name test_redirect_scenarios
   * @summary Test Redirect Scenarios
   * @request GET:/routes/test-redirect-scenarios
   */
  export namespace test_redirect_scenarios {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TestRedirectScenariosData;
  }

  /**
   * @description Test endpoint with different redirect scenarios
   * @tags dbtn/module:bigcommerce_oauth
   * @name test_redirect_scenario
   * @summary Test Redirect Scenario
   * @request GET:/routes/test-redirect/{scenario}
   */
  export namespace test_redirect_scenario {
    export type RequestParams = {
      /** Scenario */
      scenario: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TestRedirectScenarioData;
  }

  /**
   * @description Generate and return the BigCommerce authorization URL
   * @tags dbtn/module:bigcommerce_oauth
   * @name get_auth_url
   * @summary Get Auth Url
   * @request GET:/routes/auth-url
   */
  export namespace get_auth_url {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAuthUrlData;
  }

  /**
   * @description List all stores that have installed the app
   * @tags dbtn/module:bigcommerce_oauth
   * @name list_stores
   * @summary List Stores
   * @request GET:/routes/stores
   */
  export namespace list_stores {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListStoresData;
  }

  /**
   * @description Load callback for BigCommerce app This is called when a user loads the app from the BigCommerce admin panel
   * @tags dbtn/module:bigcommerce_oauth
   * @name load_callback
   * @summary Load Callback
   * @request GET:/routes/load
   */
  export namespace load_callback {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Context */
      context?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = LoadCallbackData;
  }

  /**
   * @description Get products for a specific store
   * @tags dbtn/module:bigcommerce_api
   * @name get_products
   * @summary Get Products
   * @request GET:/routes/bigcommerce/products/{store_hash}
   */
  export namespace get_products {
    export type RequestParams = {
      /** Store Hash */
      storeHash: string;
    };
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetProductsData;
  }

  /**
   * @description Get categories for a specific store
   * @tags dbtn/module:bigcommerce_api
   * @name get_categories
   * @summary Get Categories
   * @request GET:/routes/bigcommerce/categories/{store_hash}
   */
  export namespace get_categories {
    export type RequestParams = {
      /** Store Hash */
      storeHash: string;
    };
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetCategoriesData;
  }

  /**
   * @description Get coupons for a specific store
   * @tags dbtn/module:bigcommerce_api
   * @name get_coupons
   * @summary Get Coupons
   * @request GET:/routes/bigcommerce/coupons/{store_hash}
   */
  export namespace get_coupons {
    export type RequestParams = {
      /** Store Hash */
      storeHash: string;
    };
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetCouponsData;
  }

  /**
   * @description Create a cart with a product in a specific store
   * @tags dbtn/module:bigcommerce_api
   * @name create_cart
   * @summary Create Cart
   * @request POST:/routes/bigcommerce/cart/create/{store_hash}
   */
  export namespace create_cart {
    export type RequestParams = {
      /** Store Hash */
      storeHash: string;
    };
    export type RequestQuery = {
      /** Product Id */
      product_id: number;
      /**
       * Quantity
       * @default 1
       */
      quantity?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CreateCartData;
  }

  /**
   * @description Get a store by its hash.
   * @tags dbtn/module:store
   * @name get_store2
   * @summary Get Store2
   * @request GET:/routes/{store_hash}
   */
  export namespace get_store2 {
    export type RequestParams = {
      /**
       * Store Hash
       * The unique hash identifier for the store
       */
      storeHash: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetStore2Data;
  }

  /**
   * @description Update an existing store.
   * @tags dbtn/module:store
   * @name update_store2
   * @summary Update Store2
   * @request PUT:/routes/{store_hash}
   */
  export namespace update_store2 {
    export type RequestParams = {
      /**
       * Store Hash
       * The unique hash identifier for the store
       */
      storeHash: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateStore2Data;
  }

  /**
   * @description Delete a store by its hash.
   * @tags dbtn/module:store
   * @name delete_store2
   * @summary Delete Store2
   * @request DELETE:/routes/{store_hash}
   */
  export namespace delete_store2 {
    export type RequestParams = {
      /**
       * Store Hash
       * The unique hash identifier for the store
       */
      storeHash: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteStore2Data;
  }

  /**
   * @description List all stores with optional filtering.
   * @tags dbtn/module:store
   * @name list_stores2
   * @summary List Stores2
   * @request GET:/routes/list
   */
  export namespace list_stores2 {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListStores2Data;
  }

  /**
   * @description Create a new store.
   * @tags dbtn/module:store
   * @name create_store2
   * @summary Create Store2
   * @request POST:/routes/create
   */
  export namespace create_store2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateStoreRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateStore2Data;
  }

  /**
   * @description Simple ping endpoint to test database connectivity
   * @tags dbtn/module:database_test
   * @name ping
   * @summary Ping
   * @request GET:/routes/db-test/ping
   */
  export namespace ping {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = PingData;
  }

  /**
   * @description Create a test store in the database
   * @tags dbtn/module:database_test
   * @name create_store
   * @summary Create Store
   * @request POST:/routes/db-test/store
   */
  export namespace create_store {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Store Hash */
      store_hash: string;
      /** Store Name */
      store_name: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CreateStoreData;
  }

  /**
   * @description List all stores in the database
   * @tags dbtn/module:database_test
   * @name list_test_stores
   * @summary List Test Stores
   * @request GET:/routes/db-test/stores
   */
  export namespace list_test_stores {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListTestStoresData;
  }

  /**
   * @description Create a test QR code in the database
   * @tags dbtn/module:database_test
   * @name create_qr_code
   * @summary Create Qr Code
   * @request POST:/routes/db-test/qr-code
   */
  export namespace create_qr_code {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Store Hash */
      store_hash: string;
      /** Name */
      name: string;
      /** Url */
      url: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CreateQrCodeData;
  }

  /**
   * @description List all users in the system
   * @tags users, dbtn/module:user
   * @name list_users
   * @summary List Users
   * @request GET:/routes/users/
   */
  export namespace list_users {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListUsersData;
  }

  /**
   * @description Create a new user
   * @tags users, dbtn/module:user
   * @name create_user
   * @summary Create User
   * @request POST:/routes/users/
   */
  export namespace create_user {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateUserRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateUserData;
  }

  /**
   * @description Get a specific user by email
   * @tags users, dbtn/module:user
   * @name get_user
   * @summary Get User
   * @request GET:/routes/users/{email}
   */
  export namespace get_user {
    export type RequestParams = {
      /**
       * Email
       * User email address
       */
      email: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserData;
  }

  /**
   * @description Update user details
   * @tags users, dbtn/module:user
   * @name update_user
   * @summary Update User
   * @request PUT:/routes/users/{email}
   */
  export namespace update_user {
    export type RequestParams = {
      /** Email */
      email: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateUserRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateUserData;
  }

  /**
   * @description Delete a user
   * @tags users, dbtn/module:user
   * @name delete_user
   * @summary Delete User
   * @request DELETE:/routes/users/{email}
   */
  export namespace delete_user {
    export type RequestParams = {
      /** Email */
      email: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteUserData;
  }

  /**
   * @description Generate test QR codes and scan data for a store
   * @tags load-test-tracking, dbtn/module:load_test_tracking
   * @name generate_test_data
   * @summary Generate Test Data
   * @request POST:/routes/load-test-tracking/generate
   */
  export namespace generate_test_data {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GenerateTestDataData;
  }

  /**
   * @description Create a test QR code for testing scanning functionality
   * @tags qr-test, dbtn/module:qr_test
   * @name create_test_qr_code
   * @summary Create Test Qr Code
   * @request GET:/routes/qr-test/create-test-qr-code
   */
  export namespace create_test_qr_code {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CreateTestQrCodeData;
  }

  /**
   * @description Get analytics overview for a store within a specified time period This endpoint aggregates data from scan events to provide a comprehensive analytics overview including total scans, average daily scans, top devices, locations, and QR code performance.
   * @tags analytics, dbtn/module:analytics
   * @name get_analytics_overview
   * @summary Get Analytics Overview
   * @request GET:/routes/analytics/overview
   */
  export namespace get_analytics_overview {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAnalyticsOverviewData;
  }

  /**
   * @description Get detailed analytics for a specific QR code This endpoint provides analytics specific to a single QR code, including scan count trends, device breakdowns, and location data.
   * @tags analytics, dbtn/module:analytics
   * @name get_qr_code_analytics
   * @summary Get Qr Code Analytics
   * @request GET:/routes/analytics/qrcode/{qr_code_id}
   */
  export namespace get_qr_code_analytics {
    export type RequestParams = {
      /**
       * Qr Code Id
       * The QR code ID to get analytics for
       */
      qrCodeId: string;
    };
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetQrCodeAnalyticsData;
  }

  /**
   * @description Get current configuration for QR code redirections
   * @tags dbtn/module:redirect_test
   * @name get_redirect_configuration
   * @summary Get Redirect Configuration
   * @request GET:/routes/qr-redirect-test/config
   */
  export namespace get_redirect_configuration {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetRedirectConfigurationData;
  }

  /**
   * @description Return a list of test scenarios for redirects
   * @tags dbtn/module:redirect_test
   * @name get_redirect_test_scenarios
   * @summary Test Redirect Scenarios
   * @request GET:/routes/qr-redirect-test/test-scenarios
   */
  export namespace get_redirect_test_scenarios {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetRedirectTestScenariosData;
  }

  /**
   * @description Test a specific redirect scenario
   * @tags dbtn/module:redirect_test
   * @name test_specific_redirect_scenario
   * @summary Test Redirect Scenario
   * @request GET:/routes/qr-redirect-test/test-redirect/{scenario}
   */
  export namespace test_specific_redirect_scenario {
    export type RequestParams = {
      /** Scenario */
      scenario: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TestSpecificRedirectScenarioData;
  }

  /**
   * @description Create a test QR code for testing scanning functionality
   * @tags scan-test, dbtn/module:scan_test
   * @name create_scan_test_qr_code22
   * @summary Create Scan Test Qr Code22
   * @request GET:/routes/scan-test/create-test-qr
   */
  export namespace create_scan_test_qr_code22 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CreateScanTestQrCode22Data;
  }

  /**
   * @description Test the performance of the tracking endpoint under load Args: qr_code_id: ID of an existing QR code or None to create a new test code request_count: Number of requests to simulate concurrent: Whether to make requests concurrently (True) or sequentially (False)
   * @tags scan-test, dbtn/module:scan_test
   * @name load_test_performance
   * @summary Load Test Performance
   * @request GET:/routes/scan-test/load-test
   */
  export namespace load_test_performance {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = LoadTestPerformanceData;
  }

  /**
   * @description Track a QR code scan and redirect to the target URL
   * @tags tracking, dbtn/module:scan_proxy
   * @name track_scan
   * @summary Track Scan
   * @request GET:/routes/track/{qr_code_id}
   */
  export namespace track_scan {
    export type RequestParams = {
      /** Qr Code Id */
      qrCodeId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TrackScanData;
  }

  /**
   * @description List all QR codes for a specific store
   * @tags dbtn/module:qr_code
   * @name list_qr_codes
   * @summary List Qr Codes
   * @request GET:/routes/qr-code/list/{store_hash}
   */
  export namespace list_qr_codes {
    export type RequestParams = {
      /** Store Hash */
      storeHash: string;
    };
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListQrCodesData;
  }

  /**
   * @description Create a QR code for a specific product
   * @tags dbtn/module:qr_code
   * @name create_product_qr_code
   * @summary Create Product Qr Code
   * @request POST:/routes/qr-code/product
   */
  export namespace create_product_qr_code {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ProductQRCodeRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateProductQrCodeData;
  }

  /**
   * @description Create a QR code for a specific category
   * @tags dbtn/module:qr_code
   * @name create_category_qr_code
   * @summary Create Category Qr Code
   * @request POST:/routes/qr-code/category
   */
  export namespace create_category_qr_code {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CategoryQRCodeRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateCategoryQrCodeData;
  }

  /**
   * @description Create a QR code for the store homepage
   * @tags dbtn/module:qr_code
   * @name create_homepage_qr_code
   * @summary Create Homepage Qr Code
   * @request POST:/routes/qr-code/homepage
   */
  export namespace create_homepage_qr_code {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = HomepageQRCodeRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateHomepageQrCodeData;
  }

  /**
   * @description Update an existing QR code's properties
   * @tags dbtn/module:qr_code
   * @name update_qr_code
   * @summary Update Qr Code
   * @request PUT:/routes/qr-code/{qr_code_id}
   */
  export namespace update_qr_code {
    export type RequestParams = {
      /**
       * Qr Code Id
       * The ID of the QR code to update
       */
      qrCodeId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateQRCodeRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateQrCodeData;
  }

  /**
   * @description Perform soft-delete on a QR code by setting active=False and status="deleted"
   * @tags dbtn/module:qr_code
   * @name delete_qr_code
   * @summary Delete Qr Code
   * @request DELETE:/routes/qr-code/{qr_code_id}
   */
  export namespace delete_qr_code {
    export type RequestParams = {
      /**
       * Qr Code Id
       * The ID of the QR code to delete
       */
      qrCodeId: string;
    };
    export type RequestQuery = {
      /**
       * Hard Delete
       * @default false
       */
      hard_delete?: boolean;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteQrCodeData;
  }

  /**
   * @description Create a QR code for a custom URL
   * @tags dbtn/module:qr_code
   * @name create_custom_url_qr_code
   * @summary Create Custom Url Qr Code
   * @request POST:/routes/qr-code/custom
   */
  export namespace create_custom_url_qr_code {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CustomURLQRCodeRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateCustomUrlQrCodeData;
  }

  /**
   * @description Create a test QR code for testing scanning functionality
   * @tags dbtn/module:qr_code
   * @name create_test_qr_code2
   * @summary Create Test Qr Code2
   * @request POST:/routes/qr-code/create-test-qr-code
   */
  export namespace create_test_qr_code2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CreateTestQrCode2Data;
  }

  /**
   * @description Get scan statistics for a specific QR code
   * @tags scan_stats, dbtn/module:scan_stats
   * @name get_scan_stats
   * @summary Get Scan Stats
   * @request GET:/routes/scan-stats/{qr_code_id}
   */
  export namespace get_scan_stats {
    export type RequestParams = {
      /**
       * Qr Code Id
       * The ID of the QR code to get stats for
       */
      qrCodeId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetScanStatsData;
  }

  /**
   * @description List scan statistics for QR codes in a store
   * @tags scan_stats, dbtn/module:scan_stats
   * @name list_scan_stats
   * @summary List Scan Stats
   * @request GET:/routes/scan-stats
   */
  export namespace list_scan_stats {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListScanStatsData;
  }

  /**
   * @description Generate a QR code image in PNG or SVG format for a given QR code ID or temporary preview
   * @tags qr-image, dbtn/module:qr_generator
   * @name get_qr_code_image
   * @summary Get Qr Code Image
   * @request GET:/routes/qr-image/{qr_code_id}.{format}
   */
  export namespace get_qr_code_image {
    export type RequestParams = {
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
    };
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetQrCodeImageData;
  }

  /**
   * @description Save a generated QR code file to storage
   * @tags qr-file-storage, dbtn/module:qr_file_storage
   * @name save_generated_file
   * @summary Save Generated File
   * @request POST:/routes/qr-file-storage/save/{qr_code_id}
   */
  export namespace save_generated_file {
    export type RequestParams = {
      /**
       * Qr Code Id
       * The QR code ID
       */
      qrCodeId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = SaveFileRequest;
    export type RequestHeaders = {};
    export type ResponseBody = SaveGeneratedFileData;
  }

  /**
   * @description Download a previously generated QR code file
   * @tags qr-file-storage, dbtn/module:qr_file_storage
   * @name download_generated_file
   * @summary Download Generated File
   * @request GET:/routes/qr-file-storage/download/{file_id}
   */
  export namespace download_generated_file {
    export type RequestParams = {
      /**
       * File Id
       * The file ID to download
       */
      fileId: string;
    };
    export type RequestQuery = {
      /**
       * Inline
       * Whether to display inline or as attachment
       * @default false
       */
      inline?: boolean;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DownloadGeneratedFileData;
  }

  /**
   * @description List all generated files for a QR code
   * @tags qr-file-storage, dbtn/module:qr_file_storage
   * @name list_generated_files
   * @summary List Generated Files
   * @request GET:/routes/qr-file-storage/list/{qr_code_id}
   */
  export namespace list_generated_files {
    export type RequestParams = {
      /**
       * Qr Code Id
       * The QR code ID
       */
      qrCodeId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListGeneratedFilesData;
  }

  /**
   * @description Delete a generated file
   * @tags qr-file-storage, dbtn/module:qr_file_storage
   * @name delete_generated_file
   * @summary Delete Generated File
   * @request DELETE:/routes/qr-file-storage/file/{file_id}
   */
  export namespace delete_generated_file {
    export type RequestParams = {
      /**
       * File Id
       * The file ID to delete
       */
      fileId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteGeneratedFileData;
  }
}
