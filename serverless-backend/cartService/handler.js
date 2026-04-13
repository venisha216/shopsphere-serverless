const {
  addToCart,
  getCart,
  deleteFromCart
} = require("./controllers/cartController");

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

      case "GET /cart":
        return addCors(await getCart(event.queryStringParameters?.userId));

      case "POST /cart":
        return addCors(await addToCart(body));

      case "DELETE /cart/{productId}":
        return addCors(
          await deleteFromCart(
            event.queryStringParameters?.userId,
            event.pathParameters?.productId
          )
        );

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