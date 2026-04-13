const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require("./controllers/productController");

//  helper
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

  //  OPTIONS (CORS preflight)
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

      case "GET /":
        return addCors({
          statusCode: 200,
          body: JSON.stringify({ message: "API is running" })
        });

      case "GET /products":
        return addCors(await getAllProducts());

      case "GET /products/{id}":
        return addCors(await getProductById(event.pathParameters?.id));

      case "POST /products":
        return addCors(await createProduct(body));

      case "PUT /products/{id}":
        return addCors(await updateProduct(event.pathParameters?.id, body));

      case "DELETE /products/{id}":
        return addCors(await deleteProduct(event.pathParameters?.id));

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