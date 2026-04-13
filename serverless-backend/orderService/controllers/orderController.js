const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  DeleteCommand
} = require("@aws-sdk/lib-dynamodb");

const https = require("https");

const client = new DynamoDBClient({
  region: "ap-southeast-1"
});

const dynamo = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "venisha-tf-orders";

// 🔹 Call Cart Service
const getCartFromService = (userId) => {
  const url = `${process.env.CART_API_URL}?userId=${userId}`;

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";

      res.on("data", chunk => data += chunk);

      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    }).on("error", reject);
  });
};

// 🔹 Create Order
const createOrder = async (body) => {
  const { userId, items } = body;

  if (!userId || !items || items.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "userId and items required" })
    };
  }

  // 1️⃣ Get cart
  const cartItems = await getCartFromService(userId);

  if (!Array.isArray(cartItems)) {
    throw new Error("Invalid cart response");
  }

  // 2️⃣ Validate
  const invalidItems = items.filter(item => !cartItems.includes(item));

  if (invalidItems.length > 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Items not in cart",
        invalidItems
      })
    };
  }

  // 3️⃣ Create order
  const newOrder = {
    orderId: Date.now().toString(),
    userId,
    items
  };

  await dynamo.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: newOrder
    })
  );

  return {
    statusCode: 201,
    body: JSON.stringify(newOrder)
  };
};

// 🔹 Get Orders
const getOrders = async (userId) => {
  try {
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "userId is required" })
      };
    }

    const result = await dynamo.send(
      new ScanCommand({ TableName: TABLE_NAME })
    );

    const items = result.Items || [];

    const userOrders = items.filter(o => o.userId === userId);

    console.log("Orders found:", userOrders);

    return {
      statusCode: 200,
      body: JSON.stringify(userOrders)
    };

  } catch (err) {
    console.log("GET ORDERS ERROR:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to fetch orders",
        error: err.message
      })
    };
  }
};

// 🔹 Delete Order
const deleteOrder = async (orderId) => {
  if (!orderId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "orderId required" })
    };
  }

  await dynamo.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { orderId }
    })
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Order deleted",
      orderId
    })
  };
};

module.exports = {
  createOrder,
  getOrders,
  deleteOrder
};