const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  PutCommand,
  DeleteCommand,
  UpdateCommand
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({
  region: "ap-southeast-1"
});

const dynamo = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "venisha-tf-products";

// GET /products
const getAllProducts = async () => {
  console.log("Fetching all products");

  const result = await dynamo.send(
    new ScanCommand({ TableName: TABLE_NAME })
  );

  return {
    statusCode: 200,
    body: JSON.stringify(result.Items || [])
  };
};

// GET /products/{id}
const getProductById = async (id) => {
  console.log("Fetching product:", id);

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Product ID required" })
    };
  }

  const result = await dynamo.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { id }
    })
  );

  if (!result.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Product not found" })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result.Item)
  };
};

// POST /products
const createProduct = async (data) => {
  console.log("Creating product:", data);

  if (!data.id || !data.name) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "id and name required" })
    };
  }

  await dynamo.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: data
    })
  );

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: "Product created",
      product: data
    })
  };
};

// PUT /products/{id}
const updateProduct = async (id, data) => {
  console.log("Updating product:", id, data);

  await dynamo.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: "SET #name = :name, price = :price",
      ExpressionAttributeNames: {
        "#name": "name"
      },
      ExpressionAttributeValues: {
        ":name": data.name,
        ":price": data.price
      }
    })
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Product updated" })
  };
};

// DELETE /products/{id}
const deleteProduct = async (id) => {
  console.log("Deleting product:", id);

  await dynamo.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id }
    })
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Product deleted" })
  };
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};