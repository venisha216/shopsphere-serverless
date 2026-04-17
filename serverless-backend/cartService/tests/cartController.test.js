//  Mock AWS SDK
jest.mock("@aws-sdk/lib-dynamodb", () => {
  const sendMock = jest.fn();

  return {
    DynamoDBDocumentClient: {
      from: jest.fn(() => ({
        send: sendMock
      }))
    },
    GetCommand: jest.fn(),
    PutCommand: jest.fn()
  };
});

//  Import controller
const {
  addToCart,
  getCart,
  deleteFromCart
} = require("../controllers/cartController");

//  Import mocked commands
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand
} = require("@aws-sdk/lib-dynamodb");

describe("Cart Controller Tests", () => {

  const mockSend = DynamoDBDocumentClient.from().send;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================
  //  ADD TO CART (new item)
  // =========================
  test("addToCart should add new item and call PutCommand", async () => {

    // First call → GetCommand (existing cart)
    mockSend.mockResolvedValueOnce({
      Item: { userId: "u1", items: ["p1"] }
    });

    // Second call → PutCommand
    mockSend.mockResolvedValueOnce({});

    const body = { userId: "u1", productId: "p2" };

    const result = await addToCart(body);

    expect(result.statusCode).toBe(200);

    //  Verify GetCommand
    expect(GetCommand).toHaveBeenCalledWith({
      TableName: "venisha-tf-cart",
      Key: { userId: "u1" }
    });

    //  Verify PutCommand (p1 + p2)
    expect(PutCommand).toHaveBeenCalledWith({
      TableName: "venisha-tf-cart",
      Item: {
        userId: "u1",
        items: ["p1", "p2"]
      }
    });
  });

  // =========================
  //  ADD TO CART (missing fields)
  // =========================
  test("addToCart should return 400 if missing data", async () => {

    const result = await addToCart({ userId: "u1" });

    expect(result.statusCode).toBe(400);
  });

  // =========================
  //  GET CART
  // =========================
  test("getCart should return items and call GetCommand", async () => {

    mockSend.mockResolvedValue({
      Item: { userId: "u1", items: ["p1", "p2"] }
    });

    const result = await getCart("u1");

    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(body.length).toBe(2);

    //  Verify GetCommand
    expect(GetCommand).toHaveBeenCalledWith({
      TableName: "venisha-tf-cart",
      Key: { userId: "u1" }
    });
  });

  //  GET CART (missing userId)
  test("getCart should return 400 if userId missing", async () => {

    const result = await getCart();

    expect(result.statusCode).toBe(400);
  });

  // =========================
  //  DELETE FROM CART
  // =========================
  test("deleteFromCart should remove item and call PutCommand", async () => {

    // First → existing cart
    mockSend.mockResolvedValueOnce({
      Item: { userId: "u1", items: ["p1", "p2"] }
    });

    // Second → update
    mockSend.mockResolvedValueOnce({});

    const result = await deleteFromCart("u1", "p2");

    expect(result.statusCode).toBe(200);

    //  Verify GetCommand
    expect(GetCommand).toHaveBeenCalledWith({
      TableName: "venisha-tf-cart",
      Key: { userId: "u1" }
    });

    //  Verify PutCommand (only p1 remains)
    expect(PutCommand).toHaveBeenCalledWith({
      TableName: "venisha-tf-cart",
      Item: {
        userId: "u1",
        items: ["p1"]
      }
    });
  });

  //  DELETE (missing data)
  test("deleteFromCart should return 400 if missing fields", async () => {

    const result = await deleteFromCart("u1");

    expect(result.statusCode).toBe(400);
  });

});