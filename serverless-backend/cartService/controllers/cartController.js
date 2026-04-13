const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({
  region: "ap-southeast-1"
});

const dynamo = DynamoDBDocumentClient.from(client);

// ⚠️ MUST match Terraform
const TABLE_NAME = "venisha-tf-cart";

// 🔹 Add item to cart
const addToCart = async (body) => {
  const { userId, productId } = body;

  if (!userId || !productId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing userId or productId" })
    };
  }

  const existing = await dynamo.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { userId }
    })
  );

  let items = existing.Item?.items || [];

  if (!items.includes(productId)) {
    items.push(productId);
  }

  await dynamo.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: { userId, items }
    })
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Item added to cart",
      items
    })
  };
};

// 🔹 Get cart
const getCart = async (userId) => {
  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "userId is required" })
    };
  }

  const result = await dynamo.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { userId }
    })
  );

  return {
    statusCode: 200,
    body: JSON.stringify(result.Item?.items || [])
  };
};

// 🔹 Delete item from cart
const deleteFromCart = async (userId, productId) => {
  if (!userId || !productId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "userId and productId required" })
    };
  }

  const existing = await dynamo.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { userId }
    })
  );

  let items = existing.Item?.items || [];

  items = items.filter(item => item !== productId);

  await dynamo.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: { userId, items }
    })
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Item removed",
      items
    })
  };
};

module.exports = {
  addToCart,
  getCart,
  deleteFromCart
};