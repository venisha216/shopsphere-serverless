jest.mock("../controllers/productController", () => ({
  getAllProducts: jest.fn().mockResolvedValue({
    statusCode: 200,
    body: JSON.stringify([])
  }),
  getProductById: jest.fn().mockResolvedValue({
    statusCode: 200,
    body: JSON.stringify({ id: "1" })
  }),
  createProduct: jest.fn().mockResolvedValue({
    statusCode: 201,
    body: JSON.stringify({})
  }),
  updateProduct: jest.fn().mockResolvedValue({
    statusCode: 200,
    body: JSON.stringify({})
  }),
  deleteProduct: jest.fn().mockResolvedValue({
    statusCode: 200,
    body: JSON.stringify({})
  })
}));

const { handler } = require("../handler");

describe("Handler Tests", () => {

  test("GET /products", async () => {
    const event = {
      routeKey: "GET /products"
    };

    const res = await handler(event);

    expect(res.statusCode).toBe(200);
  });

  test("POST /products", async () => {
    const event = {
      routeKey: "POST /products",
      body: JSON.stringify({ id: "1", name: "Pen" })
    };

    const res = await handler(event);

    expect(res.statusCode).toBe(201);
  });

  test("Invalid route", async () => {
    const event = {
      routeKey: "PATCH /products"
    };

    const res = await handler(event);

    expect(res.statusCode).toBe(400);
  });

  test("Health check", async () => {
    const event = {
      routeKey: "GET /health"
    };

    const res = await handler(event);

    expect(res.statusCode).toBe(200);
  });

});