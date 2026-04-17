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

// 🔹 Call Product Service
const getProductsFromService = () => {
  const url = process.env.PRODUCT_API_URL;

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

// 🔹 Clear Cart
const clearCart = async (userId, items) => {
  const baseUrl = process.env.CART_API_URL;

  await Promise.all(
    items.map(item =>
      new Promise((resolve, reject) => {
        https.request(
          `${baseUrl}/${item}?userId=${userId}`,
          { method: "DELETE" },
          res => {
            res.on("data", () => {});
            res.on("end", resolve);
          }
        ).on("error", reject).end();
      })
    )
  );
};

// 🔹 Create Order (UPDATED)
const createOrder = async (body) => {
  const { userId, items } = body;

  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "userId required" })
    };
  }

  // 1️⃣ Get latest cart
  const cartItems = await getCartFromService(userId);

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Cart is empty" })
    };
  }

  // 2️⃣ Decide items
  const orderItems = items && items.length > 0 ? items : cartItems;

  // 3️⃣ Validate
  const invalidItems = orderItems.filter(item => !cartItems.includes(item));

  if (invalidItems.length > 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Items not in cart",
        invalidItems
      })
    };
  }

  // 4️⃣ Get product data
  const products = await getProductsFromService();

  // 5️⃣ Calculate total
  let totalAmount = 0;

  orderItems.forEach(itemId => {
    const product = products.find(p => p.id === itemId);
    if (product) {
      totalAmount += product.price;
    }
  });

  // 6️⃣ Create order
  const newOrder = {
    orderId: Date.now().toString(),
    userId,
    items: orderItems,
    totalAmount
  };

  await dynamo.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: newOrder
    })
  );

  // 7️⃣ Clear cart
  await clearCart(userId, orderItems);

  return {
    statusCode: 201,
    body: JSON.stringify(newOrder)
  };
};

// 🔹 Get Orders
const getOrders = async (userId) => {
  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "userId is required" })
    };
  }

  const result = await dynamo.send(
    new ScanCommand({ TableName: TABLE_NAME })
  );

  const userOrders = (result.Items || []).filter(o => o.userId === userId);

  return {
    statusCode: 200,
    body: JSON.stringify(userOrders)
  };
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