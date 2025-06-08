import {
  AuthCallbackData,
  CategoryQRCodeRequest,
  CheckHealthData,
  CreateCartData,
  CreateCartError,
  CreateCartParams,
  CreateCategoryQrCodeData,
  CreateCategoryQrCodeError,
  CreateCustomUrlQrCodeData,
  CreateCustomUrlQrCodeError,
  CreateHomepageQrCodeData,
  CreateHomepageQrCodeError,
  CreateProductQrCodeData,
  CreateProductQrCodeError,
  CreateQrCodeData,
  CreateQrCodeError,
  CreateQrCodeParams,
  CreateScanTestQrCode22Data,
  CreateStore2Data,
  CreateStore2Error,
  CreateStoreData,
  CreateStoreError,
  CreateStoreParams,
  CreateStoreRequest,
  CreateTestQrCode2Data,
  CreateTestQrCodeData,
  CreateUserData,
  CreateUserError,
  CreateUserRequest,
  CustomURLQRCodeRequest,
  DeleteGeneratedFileData,
  DeleteGeneratedFileError,
  DeleteGeneratedFileParams,
  DeleteQrCodeData,
  DeleteQrCodeError,
  DeleteQrCodeParams,
  DeleteStore2Data,
  DeleteStore2Error,
  DeleteStore2Params,
  DeleteStoreData,
  DeleteStoreError,
  DeleteStoreParams,
  DeleteUserData,
  DeleteUserError,
  DeleteUserParams,
  DownloadGeneratedFileData,
  DownloadGeneratedFileError,
  DownloadGeneratedFileParams,
  GenerateTestDataData,
  GenerateTestDataError,
  GenerateTestDataParams,
  GetAllStoresData,
  GetAnalyticsOverviewData,
  GetAnalyticsOverviewError,
  GetAnalyticsOverviewParams,
  GetAuthUrlData,
  GetCategoriesData,
  GetCategoriesError,
  GetCategoriesParams,
  GetCouponsData,
  GetCouponsError,
  GetCouponsParams,
  GetProductsData,
  GetProductsError,
  GetProductsParams,
  GetQrCodeAnalyticsData,
  GetQrCodeAnalyticsError,
  GetQrCodeAnalyticsParams,
  GetQrCodeImageData,
  GetQrCodeImageError,
  GetQrCodeImageParams,
  GetRedirectConfigurationData,
  GetRedirectTestScenariosData,
  GetScanStatsData,
  GetScanStatsError,
  GetScanStatsParams,
  GetStore2Data,
  GetStore2Error,
  GetStore2Params,
  GetStoreData,
  GetStoreError,
  GetStoreParams,
  GetUserData,
  GetUserError,
  GetUserParams,
  HomepageQRCodeRequest,
  ListGeneratedFilesData,
  ListGeneratedFilesError,
  ListGeneratedFilesParams,
  ListQrCodesData,
  ListQrCodesError,
  ListQrCodesParams,
  ListScanStatsData,
  ListScanStatsError,
  ListScanStatsParams,
  ListStores2Data,
  ListStores2Error,
  ListStores2Params,
  ListStoresData,
  ListTestStoresData,
  ListUsersData,
  LoadCallbackData,
  LoadCallbackError,
  LoadCallbackParams,
  LoadTestPerformanceData,
  LoadTestPerformanceError,
  LoadTestPerformanceParams,
  PingData,
  ProductQRCodeRequest,
  SaveFileRequest,
  SaveGeneratedFileData,
  SaveGeneratedFileError,
  SaveGeneratedFileParams,
  StoreUpdateData,
  TestRedirectScenarioData,
  TestRedirectScenarioError,
  TestRedirectScenarioParams,
  TestRedirectScenariosData,
  TestSpecificRedirectScenarioData,
  TestSpecificRedirectScenarioError,
  TestSpecificRedirectScenarioParams,
  TrackScanData,
  TrackScanError,
  TrackScanParams,
  UpdateQRCodeRequest,
  UpdateQrCodeData,
  UpdateQrCodeError,
  UpdateQrCodeParams,
  UpdateStore2Data,
  UpdateStore2Error,
  UpdateStore2Params,
  UpdateStoreData,
  UpdateStoreError,
  UpdateStoreParams,
  UpdateUserData,
  UpdateUserError,
  UpdateUserParams,
  UpdateUserRequest,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Brain<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * @description List all stores
   *
   * @tags dbtn/module:store_manager
   * @name get_all_stores
   * @summary Get All Stores
   * @request GET:/routes/stores/
   */
  get_all_stores = (params: RequestParams = {}) =>
    this.request<GetAllStoresData, any>({
      path: `/routes/stores/`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get details for a specific store
   *
   * @tags dbtn/module:store_manager
   * @name get_store
   * @summary Get Store
   * @request GET:/routes/stores/{store_hash}
   */
  get_store = ({ storeHash, ...query }: GetStoreParams, params: RequestParams = {}) =>
    this.request<GetStoreData, GetStoreError>({
      path: `/routes/stores/${storeHash}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update store information in Firebase
   *
   * @tags dbtn/module:store_manager
   * @name update_store
   * @summary Update Store
   * @request PUT:/routes/stores/{store_hash}
   */
  update_store = ({ storeHash, ...query }: UpdateStoreParams, data: StoreUpdateData, params: RequestParams = {}) =>
    this.request<UpdateStoreData, UpdateStoreError>({
      path: `/routes/stores/${storeHash}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete a store from Firebase
   *
   * @tags dbtn/module:store_manager
   * @name delete_store
   * @summary Delete Store
   * @request DELETE:/routes/stores/{store_hash}
   */
  delete_store = ({ storeHash, ...query }: DeleteStoreParams, params: RequestParams = {}) =>
    this.request<DeleteStoreData, DeleteStoreError>({
      path: `/routes/stores/${storeHash}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Callback endpoint for BigCommerce OAuth flow. BigCommerce redirects to this endpoint after the user authorizes the app. This endpoint handles both manual installations and single-click installations from the BigCommerce App Marketplace. The flow works as follows: 1. User installs the app (either manually or via single-click from marketplace) 2. BigCommerce redirects to this endpoint with code, scope, and context 3. We exchange the code for an access token 4. We store the token information 5. We redirect the user to the HelloWorld page (for all installation types)
   *
   * @tags dbtn/module:bigcommerce_oauth
   * @name auth_callback
   * @summary Auth Callback
   * @request GET:/routes/auth_callback
   */
  auth_callback = (params: RequestParams = {}) =>
    this.request<AuthCallbackData, any>({
      path: `/routes/auth_callback`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get list of available redirect test scenarios
   *
   * @tags dbtn/module:bigcommerce_oauth
   * @name test_redirect_scenarios
   * @summary Test Redirect Scenarios
   * @request GET:/routes/test-redirect-scenarios
   */
  test_redirect_scenarios = (params: RequestParams = {}) =>
    this.request<TestRedirectScenariosData, any>({
      path: `/routes/test-redirect-scenarios`,
      method: "GET",
      ...params,
    });

  /**
   * @description Test endpoint with different redirect scenarios
   *
   * @tags dbtn/module:bigcommerce_oauth
   * @name test_redirect_scenario
   * @summary Test Redirect Scenario
   * @request GET:/routes/test-redirect/{scenario}
   */
  test_redirect_scenario = ({ scenario, ...query }: TestRedirectScenarioParams, params: RequestParams = {}) =>
    this.request<TestRedirectScenarioData, TestRedirectScenarioError>({
      path: `/routes/test-redirect/${scenario}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Generate and return the BigCommerce authorization URL
   *
   * @tags dbtn/module:bigcommerce_oauth
   * @name get_auth_url
   * @summary Get Auth Url
   * @request GET:/routes/auth-url
   */
  get_auth_url = (params: RequestParams = {}) =>
    this.request<GetAuthUrlData, any>({
      path: `/routes/auth-url`,
      method: "GET",
      ...params,
    });

  /**
   * @description List all stores that have installed the app
   *
   * @tags dbtn/module:bigcommerce_oauth
   * @name list_stores
   * @summary List Stores
   * @request GET:/routes/stores
   */
  list_stores = (params: RequestParams = {}) =>
    this.request<ListStoresData, any>({
      path: `/routes/stores`,
      method: "GET",
      ...params,
    });

  /**
   * @description Load callback for BigCommerce app This is called when a user loads the app from the BigCommerce admin panel
   *
   * @tags dbtn/module:bigcommerce_oauth
   * @name load_callback
   * @summary Load Callback
   * @request GET:/routes/load
   */
  load_callback = (query: LoadCallbackParams, params: RequestParams = {}) =>
    this.request<LoadCallbackData, LoadCallbackError>({
      path: `/routes/load`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get products for a specific store
   *
   * @tags dbtn/module:bigcommerce_api
   * @name get_products
   * @summary Get Products
   * @request GET:/routes/bigcommerce/products/{store_hash}
   */
  get_products = ({ storeHash, ...query }: GetProductsParams, params: RequestParams = {}) =>
    this.request<GetProductsData, GetProductsError>({
      path: `/routes/bigcommerce/products/${storeHash}`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get categories for a specific store
   *
   * @tags dbtn/module:bigcommerce_api
   * @name get_categories
   * @summary Get Categories
   * @request GET:/routes/bigcommerce/categories/{store_hash}
   */
  get_categories = ({ storeHash, ...query }: GetCategoriesParams, params: RequestParams = {}) =>
    this.request<GetCategoriesData, GetCategoriesError>({
      path: `/routes/bigcommerce/categories/${storeHash}`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get coupons for a specific store
   *
   * @tags dbtn/module:bigcommerce_api
   * @name get_coupons
   * @summary Get Coupons
   * @request GET:/routes/bigcommerce/coupons/{store_hash}
   */
  get_coupons = ({ storeHash, ...query }: GetCouponsParams, params: RequestParams = {}) =>
    this.request<GetCouponsData, GetCouponsError>({
      path: `/routes/bigcommerce/coupons/${storeHash}`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Create a cart with a product in a specific store
   *
   * @tags dbtn/module:bigcommerce_api
   * @name create_cart
   * @summary Create Cart
   * @request POST:/routes/bigcommerce/cart/create/{store_hash}
   */
  create_cart = ({ storeHash, ...query }: CreateCartParams, params: RequestParams = {}) =>
    this.request<CreateCartData, CreateCartError>({
      path: `/routes/bigcommerce/cart/create/${storeHash}`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description Get a store by its hash.
   *
   * @tags dbtn/module:store
   * @name get_store2
   * @summary Get Store2
   * @request GET:/routes/{store_hash}
   */
  get_store2 = ({ storeHash, ...query }: GetStore2Params, params: RequestParams = {}) =>
    this.request<GetStore2Data, GetStore2Error>({
      path: `/routes/${storeHash}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update an existing store.
   *
   * @tags dbtn/module:store
   * @name update_store2
   * @summary Update Store2
   * @request PUT:/routes/{store_hash}
   */
  update_store2 = ({ storeHash, ...query }: UpdateStore2Params, params: RequestParams = {}) =>
    this.request<UpdateStore2Data, UpdateStore2Error>({
      path: `/routes/${storeHash}`,
      method: "PUT",
      ...params,
    });

  /**
   * @description Delete a store by its hash.
   *
   * @tags dbtn/module:store
   * @name delete_store2
   * @summary Delete Store2
   * @request DELETE:/routes/{store_hash}
   */
  delete_store2 = ({ storeHash, ...query }: DeleteStore2Params, params: RequestParams = {}) =>
    this.request<DeleteStore2Data, DeleteStore2Error>({
      path: `/routes/${storeHash}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description List all stores with optional filtering.
   *
   * @tags dbtn/module:store
   * @name list_stores2
   * @summary List Stores2
   * @request GET:/routes/list
   */
  list_stores2 = (query: ListStores2Params, params: RequestParams = {}) =>
    this.request<ListStores2Data, ListStores2Error>({
      path: `/routes/list`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Create a new store.
   *
   * @tags dbtn/module:store
   * @name create_store2
   * @summary Create Store2
   * @request POST:/routes/create
   */
  create_store2 = (data: CreateStoreRequest, params: RequestParams = {}) =>
    this.request<CreateStore2Data, CreateStore2Error>({
      path: `/routes/create`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Simple ping endpoint to test database connectivity
   *
   * @tags dbtn/module:database_test
   * @name ping
   * @summary Ping
   * @request GET:/routes/db-test/ping
   */
  ping = (params: RequestParams = {}) =>
    this.request<PingData, any>({
      path: `/routes/db-test/ping`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a test store in the database
   *
   * @tags dbtn/module:database_test
   * @name create_store
   * @summary Create Store
   * @request POST:/routes/db-test/store
   */
  create_store = (query: CreateStoreParams, params: RequestParams = {}) =>
    this.request<CreateStoreData, CreateStoreError>({
      path: `/routes/db-test/store`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description List all stores in the database
   *
   * @tags dbtn/module:database_test
   * @name list_test_stores
   * @summary List Test Stores
   * @request GET:/routes/db-test/stores
   */
  list_test_stores = (params: RequestParams = {}) =>
    this.request<ListTestStoresData, any>({
      path: `/routes/db-test/stores`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a test QR code in the database
   *
   * @tags dbtn/module:database_test
   * @name create_qr_code
   * @summary Create Qr Code
   * @request POST:/routes/db-test/qr-code
   */
  create_qr_code = (query: CreateQrCodeParams, params: RequestParams = {}) =>
    this.request<CreateQrCodeData, CreateQrCodeError>({
      path: `/routes/db-test/qr-code`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description List all users in the system
   *
   * @tags users, dbtn/module:user
   * @name list_users
   * @summary List Users
   * @request GET:/routes/users/
   */
  list_users = (params: RequestParams = {}) =>
    this.request<ListUsersData, any>({
      path: `/routes/users/`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a new user
   *
   * @tags users, dbtn/module:user
   * @name create_user
   * @summary Create User
   * @request POST:/routes/users/
   */
  create_user = (data: CreateUserRequest, params: RequestParams = {}) =>
    this.request<CreateUserData, CreateUserError>({
      path: `/routes/users/`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get a specific user by email
   *
   * @tags users, dbtn/module:user
   * @name get_user
   * @summary Get User
   * @request GET:/routes/users/{email}
   */
  get_user = ({ email, ...query }: GetUserParams, params: RequestParams = {}) =>
    this.request<GetUserData, GetUserError>({
      path: `/routes/users/${email}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update user details
   *
   * @tags users, dbtn/module:user
   * @name update_user
   * @summary Update User
   * @request PUT:/routes/users/{email}
   */
  update_user = ({ email, ...query }: UpdateUserParams, data: UpdateUserRequest, params: RequestParams = {}) =>
    this.request<UpdateUserData, UpdateUserError>({
      path: `/routes/users/${email}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete a user
   *
   * @tags users, dbtn/module:user
   * @name delete_user
   * @summary Delete User
   * @request DELETE:/routes/users/{email}
   */
  delete_user = ({ email, ...query }: DeleteUserParams, params: RequestParams = {}) =>
    this.request<DeleteUserData, DeleteUserError>({
      path: `/routes/users/${email}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Generate test QR codes and scan data for a store
   *
   * @tags load-test-tracking, dbtn/module:load_test_tracking
   * @name generate_test_data
   * @summary Generate Test Data
   * @request POST:/routes/load-test-tracking/generate
   */
  generate_test_data = (query: GenerateTestDataParams, params: RequestParams = {}) =>
    this.request<GenerateTestDataData, GenerateTestDataError>({
      path: `/routes/load-test-tracking/generate`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description Create a test QR code for testing scanning functionality
   *
   * @tags qr-test, dbtn/module:qr_test
   * @name create_test_qr_code
   * @summary Create Test Qr Code
   * @request GET:/routes/qr-test/create-test-qr-code
   */
  create_test_qr_code = (params: RequestParams = {}) =>
    this.request<CreateTestQrCodeData, any>({
      path: `/routes/qr-test/create-test-qr-code`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get analytics overview for a store within a specified time period This endpoint aggregates data from scan events to provide a comprehensive analytics overview including total scans, average daily scans, top devices, locations, and QR code performance.
   *
   * @tags analytics, dbtn/module:analytics
   * @name get_analytics_overview
   * @summary Get Analytics Overview
   * @request GET:/routes/analytics/overview
   */
  get_analytics_overview = (query: GetAnalyticsOverviewParams, params: RequestParams = {}) =>
    this.request<GetAnalyticsOverviewData, GetAnalyticsOverviewError>({
      path: `/routes/analytics/overview`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get detailed analytics for a specific QR code This endpoint provides analytics specific to a single QR code, including scan count trends, device breakdowns, and location data.
   *
   * @tags analytics, dbtn/module:analytics
   * @name get_qr_code_analytics
   * @summary Get Qr Code Analytics
   * @request GET:/routes/analytics/qrcode/{qr_code_id}
   */
  get_qr_code_analytics = ({ qrCodeId, ...query }: GetQrCodeAnalyticsParams, params: RequestParams = {}) =>
    this.request<GetQrCodeAnalyticsData, GetQrCodeAnalyticsError>({
      path: `/routes/analytics/qrcode/${qrCodeId}`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get current configuration for QR code redirections
   *
   * @tags dbtn/module:redirect_test
   * @name get_redirect_configuration
   * @summary Get Redirect Configuration
   * @request GET:/routes/qr-redirect-test/config
   */
  get_redirect_configuration = (params: RequestParams = {}) =>
    this.request<GetRedirectConfigurationData, any>({
      path: `/routes/qr-redirect-test/config`,
      method: "GET",
      ...params,
    });

  /**
   * @description Return a list of test scenarios for redirects
   *
   * @tags dbtn/module:redirect_test
   * @name get_redirect_test_scenarios
   * @summary Test Redirect Scenarios
   * @request GET:/routes/qr-redirect-test/test-scenarios
   */
  get_redirect_test_scenarios = (params: RequestParams = {}) =>
    this.request<GetRedirectTestScenariosData, any>({
      path: `/routes/qr-redirect-test/test-scenarios`,
      method: "GET",
      ...params,
    });

  /**
   * @description Test a specific redirect scenario
   *
   * @tags dbtn/module:redirect_test
   * @name test_specific_redirect_scenario
   * @summary Test Redirect Scenario
   * @request GET:/routes/qr-redirect-test/test-redirect/{scenario}
   */
  test_specific_redirect_scenario = (
    { scenario, ...query }: TestSpecificRedirectScenarioParams,
    params: RequestParams = {},
  ) =>
    this.request<TestSpecificRedirectScenarioData, TestSpecificRedirectScenarioError>({
      path: `/routes/qr-redirect-test/test-redirect/${scenario}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a test QR code for testing scanning functionality
   *
   * @tags scan-test, dbtn/module:scan_test
   * @name create_scan_test_qr_code22
   * @summary Create Scan Test Qr Code22
   * @request GET:/routes/scan-test/create-test-qr
   */
  create_scan_test_qr_code22 = (params: RequestParams = {}) =>
    this.request<CreateScanTestQrCode22Data, any>({
      path: `/routes/scan-test/create-test-qr`,
      method: "GET",
      ...params,
    });

  /**
   * @description Test the performance of the tracking endpoint under load Args: qr_code_id: ID of an existing QR code or None to create a new test code request_count: Number of requests to simulate concurrent: Whether to make requests concurrently (True) or sequentially (False)
   *
   * @tags scan-test, dbtn/module:scan_test
   * @name load_test_performance
   * @summary Load Test Performance
   * @request GET:/routes/scan-test/load-test
   */
  load_test_performance = (query: LoadTestPerformanceParams, params: RequestParams = {}) =>
    this.request<LoadTestPerformanceData, LoadTestPerformanceError>({
      path: `/routes/scan-test/load-test`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Track a QR code scan and redirect to the target URL
   *
   * @tags tracking, dbtn/module:scan_proxy
   * @name track_scan
   * @summary Track Scan
   * @request GET:/routes/track/{qr_code_id}
   */
  track_scan = ({ qrCodeId, ...query }: TrackScanParams, params: RequestParams = {}) =>
    this.request<TrackScanData, TrackScanError>({
      path: `/routes/track/${qrCodeId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description List all QR codes for a specific store
   *
   * @tags dbtn/module:qr_code
   * @name list_qr_codes
   * @summary List Qr Codes
   * @request GET:/routes/qr-code/list/{store_hash}
   */
  list_qr_codes = ({ storeHash, ...query }: ListQrCodesParams, params: RequestParams = {}) =>
    this.request<ListQrCodesData, ListQrCodesError>({
      path: `/routes/qr-code/list/${storeHash}`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Create a QR code for a specific product
   *
   * @tags dbtn/module:qr_code
   * @name create_product_qr_code
   * @summary Create Product Qr Code
   * @request POST:/routes/qr-code/product
   */
  create_product_qr_code = (data: ProductQRCodeRequest, params: RequestParams = {}) =>
    this.request<CreateProductQrCodeData, CreateProductQrCodeError>({
      path: `/routes/qr-code/product`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Create a QR code for a specific category
   *
   * @tags dbtn/module:qr_code
   * @name create_category_qr_code
   * @summary Create Category Qr Code
   * @request POST:/routes/qr-code/category
   */
  create_category_qr_code = (data: CategoryQRCodeRequest, params: RequestParams = {}) =>
    this.request<CreateCategoryQrCodeData, CreateCategoryQrCodeError>({
      path: `/routes/qr-code/category`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Create a QR code for the store homepage
   *
   * @tags dbtn/module:qr_code
   * @name create_homepage_qr_code
   * @summary Create Homepage Qr Code
   * @request POST:/routes/qr-code/homepage
   */
  create_homepage_qr_code = (data: HomepageQRCodeRequest, params: RequestParams = {}) =>
    this.request<CreateHomepageQrCodeData, CreateHomepageQrCodeError>({
      path: `/routes/qr-code/homepage`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Update an existing QR code's properties
   *
   * @tags dbtn/module:qr_code
   * @name update_qr_code
   * @summary Update Qr Code
   * @request PUT:/routes/qr-code/{qr_code_id}
   */
  update_qr_code = (
    { qrCodeId, ...query }: UpdateQrCodeParams,
    data: UpdateQRCodeRequest,
    params: RequestParams = {},
  ) =>
    this.request<UpdateQrCodeData, UpdateQrCodeError>({
      path: `/routes/qr-code/${qrCodeId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Perform soft-delete on a QR code by setting active=False and status="deleted"
   *
   * @tags dbtn/module:qr_code
   * @name delete_qr_code
   * @summary Delete Qr Code
   * @request DELETE:/routes/qr-code/{qr_code_id}
   */
  delete_qr_code = ({ qrCodeId, ...query }: DeleteQrCodeParams, params: RequestParams = {}) =>
    this.request<DeleteQrCodeData, DeleteQrCodeError>({
      path: `/routes/qr-code/${qrCodeId}`,
      method: "DELETE",
      query: query,
      ...params,
    });

  /**
   * @description Create a QR code for a custom URL
   *
   * @tags dbtn/module:qr_code
   * @name create_custom_url_qr_code
   * @summary Create Custom Url Qr Code
   * @request POST:/routes/qr-code/custom
   */
  create_custom_url_qr_code = (data: CustomURLQRCodeRequest, params: RequestParams = {}) =>
    this.request<CreateCustomUrlQrCodeData, CreateCustomUrlQrCodeError>({
      path: `/routes/qr-code/custom`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Create a test QR code for testing scanning functionality
   *
   * @tags dbtn/module:qr_code
   * @name create_test_qr_code2
   * @summary Create Test Qr Code2
   * @request POST:/routes/qr-code/create-test-qr-code
   */
  create_test_qr_code2 = (params: RequestParams = {}) =>
    this.request<CreateTestQrCode2Data, any>({
      path: `/routes/qr-code/create-test-qr-code`,
      method: "POST",
      ...params,
    });

  /**
   * @description Get scan statistics for a specific QR code
   *
   * @tags scan_stats, dbtn/module:scan_stats
   * @name get_scan_stats
   * @summary Get Scan Stats
   * @request GET:/routes/scan-stats/{qr_code_id}
   */
  get_scan_stats = ({ qrCodeId, ...query }: GetScanStatsParams, params: RequestParams = {}) =>
    this.request<GetScanStatsData, GetScanStatsError>({
      path: `/routes/scan-stats/${qrCodeId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description List scan statistics for QR codes in a store
   *
   * @tags scan_stats, dbtn/module:scan_stats
   * @name list_scan_stats
   * @summary List Scan Stats
   * @request GET:/routes/scan-stats
   */
  list_scan_stats = (query: ListScanStatsParams, params: RequestParams = {}) =>
    this.request<ListScanStatsData, ListScanStatsError>({
      path: `/routes/scan-stats`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Generate a QR code image in PNG or SVG format for a given QR code ID or temporary preview
   *
   * @tags qr-image, dbtn/module:qr_generator
   * @name get_qr_code_image
   * @summary Get Qr Code Image
   * @request GET:/routes/qr-image/{qr_code_id}.{format}
   */
  get_qr_code_image = ({ qrCodeId, format, ...query }: GetQrCodeImageParams, params: RequestParams = {}) =>
    this.request<GetQrCodeImageData, GetQrCodeImageError>({
      path: `/routes/qr-image/${qrCodeId}.${format}`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Save a generated QR code file to storage
   *
   * @tags qr-file-storage, dbtn/module:qr_file_storage
   * @name save_generated_file
   * @summary Save Generated File
   * @request POST:/routes/qr-file-storage/save/{qr_code_id}
   */
  save_generated_file = (
    { qrCodeId, ...query }: SaveGeneratedFileParams,
    data: SaveFileRequest,
    params: RequestParams = {},
  ) =>
    this.request<SaveGeneratedFileData, SaveGeneratedFileError>({
      path: `/routes/qr-file-storage/save/${qrCodeId}`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Download a previously generated QR code file
   *
   * @tags qr-file-storage, dbtn/module:qr_file_storage
   * @name download_generated_file
   * @summary Download Generated File
   * @request GET:/routes/qr-file-storage/download/{file_id}
   */
  download_generated_file = ({ fileId, ...query }: DownloadGeneratedFileParams, params: RequestParams = {}) =>
    this.request<DownloadGeneratedFileData, DownloadGeneratedFileError>({
      path: `/routes/qr-file-storage/download/${fileId}`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description List all generated files for a QR code
   *
   * @tags qr-file-storage, dbtn/module:qr_file_storage
   * @name list_generated_files
   * @summary List Generated Files
   * @request GET:/routes/qr-file-storage/list/{qr_code_id}
   */
  list_generated_files = ({ qrCodeId, ...query }: ListGeneratedFilesParams, params: RequestParams = {}) =>
    this.request<ListGeneratedFilesData, ListGeneratedFilesError>({
      path: `/routes/qr-file-storage/list/${qrCodeId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Delete a generated file
   *
   * @tags qr-file-storage, dbtn/module:qr_file_storage
   * @name delete_generated_file
   * @summary Delete Generated File
   * @request DELETE:/routes/qr-file-storage/file/{file_id}
   */
  delete_generated_file = ({ fileId, ...query }: DeleteGeneratedFileParams, params: RequestParams = {}) =>
    this.request<DeleteGeneratedFileData, DeleteGeneratedFileError>({
      path: `/routes/qr-file-storage/file/${fileId}`,
      method: "DELETE",
      ...params,
    });
}
