//  Mock AWS SDK
jest.mock("@aws-sdk/lib-dynamodb", () => {
  const sendMock = jest.fn();

  return {
    DynamoDBDocumentClient: {
      from: jest.fn(() => ({
        send: sendMock
      }))
    },
    ScanCommand: jest.fn(),
    GetCommand: jest.fn(),
    PutCommand: jest.fn(),
    DeleteCommand: jest.fn(),
    UpdateCommand: jest.fn()
  };
});

//  Import controller functions
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

//  Import mocked commands (IMPORTANT for verification)
const {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  PutCommand,
  DeleteCommand,
  UpdateCommand
} = require("@aws-sdk/lib-dynamodb");

describe("Product Controller Tests", () => {

  const mockSend = DynamoDBDocumentClient.from().send;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================
  //  GET ALL PRODUCTS
  // =========================
  test("getAllProducts should return items and call ScanCommand", async () => {

    mockSend.mockResolvedValue({
      Items: [{ id: "1", name: "Pen" }]
    });

    const result = await getAllProducts();

    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(body.length).toBe(1);

    //  Verify DynamoDB call
    expect(ScanCommand).toHaveBeenCalledWith({
      TableName: "venisha-tf-products"
    });
  });

  // =========================
  //  GET PRODUCT BY ID
  // =========================
  test("getProductById should return product and call GetCommand", async () => {

    mockSend.mockResolvedValue({
      Item: { id: "1", name: "Pen" }
    });

    const result = await getProductById("1");

    expect(result.statusCode).toBe(200);

    //  Verify DynamoDB call
    expect(GetCommand).toHaveBeenCalledWith({
      TableName: "venisha-tf-products",
      Key: { id: "1" }
    });
  });

  //  NOT FOUND
  test("getProductById should return 404 if not found", async () => {

    mockSend.mockResolvedValue({});

    const result = await getProductById("1");

    expect(result.statusCode).toBe(404);
  });

  //  MISSING ID
  test("getProductById should return 400 if id missing", async () => {

    const result = await getProductById();

    expect(result.statusCode).toBe(400);
  });

  // =========================
  //  CREATE PRODUCT
  // =========================
  test("createProduct should create product and call PutCommand", async () => {

    mockSend.mockResolvedValue({});

    const data = { id: "1", name: "Pen", price: 10 };

    const result = await createProduct(data);

    expect(result.statusCode).toBe(201);

    //  Verify DynamoDB call
    expect(PutCommand).toHaveBeenCalledWith({
      TableName: "venisha-tf-products",
      Item: data
    });
  });

  //  INVALID CREATE
  test("createProduct should return 400 if missing fields", async () => {

    const result = await createProduct({ name: "Pen" });

    expect(result.statusCode).toBe(400);
  });

  // =========================
  //  UPDATE PRODUCT
  // =========================
  test("updateProduct should update product and call UpdateCommand", async () => {

    mockSend.mockResolvedValue({});

    const result = await updateProduct("1", {
      name: "Book",
      price: 50
    });

    expect(result.statusCode).toBe(200);

    //  Verify DynamoDB call
    expect(UpdateCommand).toHaveBeenCalledWith({
      TableName: "venisha-tf-products",
      Key: { id: "1" },
      UpdateExpression: "SET #name = :name, price = :price",
      ExpressionAttributeNames: {
        "#name": "name"
      },
      ExpressionAttributeValues: {
        ":name": "Book",
        ":price": 50
      }
    });
  });

  // =========================
  //  DELETE PRODUCT
  // =========================
  test("deleteProduct should delete product and call DeleteCommand", async () => {

    mockSend.mockResolvedValue({});

    const result = await deleteProduct("1");

    expect(result.statusCode).toBe(200);

    //  Verify DynamoDB call
    expect(DeleteCommand).toHaveBeenCalledWith({
      TableName: "venisha-tf-products",
      Key: { id: "1" }
    });
  });

});