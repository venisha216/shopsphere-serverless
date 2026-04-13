const {
  createOrder,
  getOrders,
  deleteOrder
} = require("./controllers/orderController");

const addCors = (response) => {
  return {
    statusCode: response?.statusCode || 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "*"
    },
    body: response?.body || JSON.stringify(response || {})
  };
};

exports.handler = async (event) => {

  console.log("ROUTE:", event.routeKey);

  if (event.requestContext?.http?.method === "OPTIONS") {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "*"
    },
    body: ""
  };
}

  try {

    const body = event.body ? JSON.parse(event.body) : {};

    switch (event.routeKey) {

      case "POST /orders":
        return addCors(await createOrder(body));

      case "GET /orders":
        return addCors(await getOrders(event.queryStringParameters?.userId));

      case "DELETE /orders/{orderId}":
        return addCors(await deleteOrder(event.pathParameters?.orderId));

      default:
        return addCors({
          statusCode: 400,
          body: JSON.stringify({
            message: "Invalid route",
            routeKey: event.routeKey
          })
        });
    }

  } catch (error) {
    console.log("ERROR:", error);

    return addCors({
      statusCode: 500,
      body: JSON.stringify({
        message: "Server error",
        error: error.message
      })
    });
  }
};