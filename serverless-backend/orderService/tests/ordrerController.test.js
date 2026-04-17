//  Mock AWS SDK
jest.mock("@aws-sdk/lib-dynamodb", () => {
  const sendMock = jest.fn();

  return {
    DynamoDBDocumentClient: {
      from: jest.fn(() => ({
        send: sendMock
      }))
    },
    PutCommand: jest.fn(),
    ScanCommand: jest.fn(),
    DeleteCommand: jest.fn()
  };
});

// ✅ Import modules
const https = require("https");

const {
  createOrder,
  getOrders,
  deleteOrder
} = require("../controllers/orderController");

const {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  DeleteCommand
} = require("@aws-sdk/lib-dynamodb");

describe("Order Controller Tests", () => {

  const mockSend = DynamoDBDocumentClient.from().send;

  beforeEach(() => {
    jest.clearAllMocks();

    //  Mock env vars
    process.env.CART_API_URL = "http://cart-service/cart";
    process.env.PRODUCT_API_URL = "http://product-service/products";

    //  Safe mocking (DO NOT override whole https module)
    jest.spyOn(https, "get");
    jest.spyOn(https, "request");
  });

  // =========================
  //  CREATE ORDER (SUCCESS)
  // =========================
  test("createOrder should create order and call PutCommand", async () => {

    // 🔹 Mock Cart API
    https.get.mockImplementationOnce((url, cb) => {
      const res = {
        on: (event, handler) => {
          if (event === "data") handler(JSON.stringify(["p1", "p2"]));
          if (event === "end") handler();
        }
      };
      cb(res);
      return { on: jest.fn() };
    });

    // 🔹 Mock Product API
    https.get.mockImplementationOnce((url, cb) => {
      const res = {
        on: (event, handler) => {
          if (event === "data") handler(JSON.stringify([
            { id: "p1", price: 10 },
            { id: "p2", price: 20 }
          ]));
          if (event === "end") handler();
        }
      };
      cb(res);
      return { on: jest.fn() };
    });

    // 🔹 Mock clearCart (DELETE calls)
    https.request.mockImplementation((url, options, cb) => {
      const res = {
        on: (event, handler) => {
          if (event === "data") handler("");
          if (event === "end") handler(); // ✅ resolves promise
        }
      };

      cb(res);

      return {
        on: jest.fn().mockReturnThis(),
        end: jest.fn()
      };
    });

    mockSend.mockResolvedValue({});

    const result = await createOrder({ userId: "u1" });

    expect(result.statusCode).toBe(201);

    //  Verify DynamoDB call
    expect(PutCommand).toHaveBeenCalled();

    const call = PutCommand.mock.calls[0][0];

    expect(call.TableName).toBe("venisha-tf-orders");
    expect(call.Item.userId).toBe("u1");
    expect(call.Item.totalAmount).toBe(30); // 10 + 20
  });

  // =========================
  //  CREATE ORDER (missing userId)
  // =========================
  test("createOrder should return 400 if userId missing", async () => {

    const result = await createOrder({});

    expect(result.statusCode).toBe(400);
  });

  // =========================
  //  CREATE ORDER (empty cart)
  // =========================
  test("createOrder should return 400 if cart empty", async () => {

    https.get.mockImplementationOnce((url, cb) => {
      const res = {
        on: (event, handler) => {
          if (event === "data") handler(JSON.stringify([]));
          if (event === "end") handler();
        }
      };
      cb(res);
      return { on: jest.fn() };
    });

    const result = await createOrder({ userId: "u1" });

    expect(result.statusCode).toBe(400);
  });

  // =========================
  //  GET ORDERS
  // =========================
  test("getOrders should return filtered orders and call ScanCommand", async () => {

    mockSend.mockResolvedValue({
      Items: [
        { orderId: "1", userId: "u1" },
        { orderId: "2", userId: "u2" }
      ]
    });

    const result = await getOrders("u1");

    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(body.length).toBe(1);

    //  Verify DynamoDB call
    expect(ScanCommand).toHaveBeenCalledWith({
      TableName: "venisha-tf-orders"
    });
  });

  //  GET ORDERS (missing userId)
  test("getOrders should return 400 if missing userId", async () => {

    const result = await getOrders();

    expect(result.statusCode).toBe(400);
  });

  // =========================
  //  DELETE ORDER
  // =========================
  test("deleteOrder should delete order and call DeleteCommand", async () => {

    mockSend.mockResolvedValue({});

    const result = await deleteOrder("o1");

    expect(result.statusCode).toBe(200);

    //  Verify DynamoDB call
    expect(DeleteCommand).toHaveBeenCalledWith({
      TableName: "venisha-tf-orders",
      Key: { orderId: "o1" }
    });
  });

  //  DELETE ORDER (missing id)
  test("deleteOrder should return 400 if missing orderId", async () => {

    const result = await deleteOrder();

    expect(result.statusCode).toBe(400);
  });

});