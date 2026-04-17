jest.mock("../controllers/orderController", () => ({
  createOrder: jest.fn().mockResolvedValue({
    statusCode: 201,
    body: JSON.stringify({})
  }),
  getOrders: jest.fn().mockResolvedValue({
    statusCode: 200,
    body: JSON.stringify([])
  }),
  deleteOrder: jest.fn().mockResolvedValue({
    statusCode: 200,
    body: JSON.stringify({})
  })
}));

const { handler } = require("../handler");

describe("Order Handler Tests", () => {

  test("POST /orders", async () => {
    const event = {
      routeKey: "POST /orders",
      body: JSON.stringify({ userId: "u1" })
    };

    const res = await handler(event);

    expect(res.statusCode).toBe(201);
  });

  test("GET /orders", async () => {
    const event = {
      routeKey: "GET /orders",
      queryStringParameters: { userId: "u1" }
    };

    const res = await handler(event);

    expect(res.statusCode).toBe(200);
  });

  test("DELETE /orders/{orderId}", async () => {
    const event = {
      routeKey: "DELETE /orders/{orderId}",
      pathParameters: { orderId: "o1" }
    };

    const res = await handler(event);

    expect(res.statusCode).toBe(200);
  });

  test("Invalid route", async () => {
    const event = {
      routeKey: "PATCH /orders"
    };

    const res = await handler(event);

    expect(res.statusCode).toBe(400);
  });

});