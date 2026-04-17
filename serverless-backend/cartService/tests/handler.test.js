jest.mock("../controllers/cartController", () => ({
  addToCart: jest.fn().mockResolvedValue({
    statusCode: 200,
    body: JSON.stringify({})
  }),
  getCart: jest.fn().mockResolvedValue({
    statusCode: 200,
    body: JSON.stringify([])
  }),
  deleteFromCart: jest.fn().mockResolvedValue({
    statusCode: 200,
    body: JSON.stringify({})
  })
}));

const { handler } = require("../handler");

describe("Cart Handler Tests", () => {

  test("GET /cart", async () => {
    const event = {
      routeKey: "GET /cart",
      queryStringParameters: { userId: "u1" }
    };

    const res = await handler(event);

    expect(res.statusCode).toBe(200);
  });

  test("POST /cart", async () => {
    const event = {
      routeKey: "POST /cart",
      body: JSON.stringify({ userId: "u1", productId: "p1" })
    };

    const res = await handler(event);

    expect(res.statusCode).toBe(200);
  });

  test("DELETE /cart/{productId}", async () => {
    const event = {
      routeKey: "DELETE /cart/{productId}",
      queryStringParameters: { userId: "u1" },
      pathParameters: { productId: "p1" }
    };

    const res = await handler(event);

    expect(res.statusCode).toBe(200);
  });

  test("Invalid route", async () => {
    const event = {
      routeKey: "PATCH /cart"
    };

    const res = await handler(event);

    expect(res.statusCode).toBe(400);
  });

});